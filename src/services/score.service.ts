import type { D1Database, KVNamespace } from "@cloudflare/workers-types";
import type {
  Score,
  ScoreResponse,
  UploadScoreRequest,
  GetUserScoresResponse,
  GetTopScoresResponse,
  UserScoreInfo,
} from "../types";

interface CachedTopScores {
  data: GetTopScoresResponse;
  timestamp: number;
}

export class ScoreService {
  private static readonly CACHE_KEY = "top_scores_cache";
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(private db: D1Database, private kv: KVNamespace) {}

  private readonly LEVEL_MAP = [
    { score: 2300, level: "Legend" },
    { score: 2100, level: "Master" },
    { score: 1900, level: "Grandmaster" },
    { score: 1700, level: "Diamond" },
    { score: 1500, level: "Platinum" },
    { score: 1000, level: "Gold" },
    { score: 500, level: "Silver" },
    { score: 300, level: "Bronze" },
  ];

  private readonly LEVEL_ARRAY = Array.from({ length: 2300 }, (_, index) => {
    return (
      this.LEVEL_MAP.find((item) => index >= item.score)?.level || "Bronze"
    );
  });

  /**
   * Get cached leaderboard data from KV
   */
  private async getCachedTopScores(): Promise<CachedTopScores | null> {
    try {
      const cached = await this.kv.get(ScoreService.CACHE_KEY, "json");
      return cached as CachedTopScores | null;
    } catch (error) {
      console.error("Failed to get KV cache:", error);
      return null;
    }
  }

  /**
   * Cache leaderboard data to KV
   */
  private async setCachedTopScores(data: GetTopScoresResponse): Promise<void> {
    try {
      const cacheData: CachedTopScores = {
        data,
        timestamp: Date.now(),
      };
      await this.kv.put(ScoreService.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Failed to set KV cache:", error);
    }
  }

  /**
   * Check if cache is expired
   */
  private isCacheExpired(timestamp: number): boolean {
    return Date.now() - timestamp > ScoreService.CACHE_DURATION;
  }

  /**
   * Clear leaderboard cache
   */
  private async clearTopScoresCache(): Promise<void> {
    try {
      await this.kv.delete(ScoreService.CACHE_KEY);
      console.log("Leaderboard cache cleared");
    } catch (error) {
      console.error("Failed to clear KV cache:", error);
    }
  }

  /**
   * Get the lowest score in the leaderboard
   * @returns The lowest score in the leaderboard, returns 0 if leaderboard is empty or fetch fails
   */
  private async getLowestScoreInLeaderboard(): Promise<number> {
    try {
      // Try to get leaderboard data from cache
      const cached = await this.getCachedTopScores();

      if (cached && !this.isCacheExpired(cached.timestamp)) {
        // Use cached data
        const topScores = cached.data.topScores;
        if (topScores.length === 0) return 0;

        // Find the lowest score
        const lowestScore = Math.min(
          ...topScores.map((score) => score.highestScore)
        );
        return lowestScore;
      }

      // Cache unavailable, query lowest score from database directly
      const result = await this.db
        .prepare("SELECT score FROM score ORDER BY score ASC LIMIT 1 OFFSET 99")
        .first<{ score: number }>();

      return result?.score || 0;
    } catch (error) {
      console.error("Failed to get lowest score from leaderboard:", error);
      return 0; // Return 0 on failure to ensure cache is cleared (conservative strategy)
    }
  }

  /**
   * Determine if cache should be cleared
   * @param newScore New score
   * @returns Whether cache should be cleared
   */
  private async shouldClearCache(newScore: number): Promise<boolean> {
    const lowestScore = await this.getLowestScoreInLeaderboard();
    return newScore > lowestScore;
  }

  /**
   * Fetch latest leaderboard data from database
   */
  private async fetchTopScoresFromDB(): Promise<GetTopScoresResponse> {
    const allScores = await this.db
      .prepare("SELECT * FROM score ORDER BY score DESC LIMIT 100")
      .all<Score>();

    const userIds = allScores.results.map((item) => item.userId);
    if (userIds.length === 0) {
      return { topScores: [] };
    }

    const placeholders = userIds.map(() => "?").join(",");
    const users = await this.db
      .prepare(`SELECT * FROM user WHERE id IN (${placeholders})`)
      .bind(...userIds)
      .all<{ id: number; username: string }>();

    const userMap = new Map(
      users.results.map((user: { id: number; username: string }) => [
        user.id,
        user,
      ])
    );

    const topScoresWithUserInfo: UserScoreInfo[] = allScores.results.map(
      (item: Score) => {
        const user = userMap.get(item.userId);
        return {
          userId: item.userId,
          username: user?.username || "Unknown User",
          highestScore: item.score,
          gameId: item.gameId,
          timestamp: item.timestamp,
          date: item.date,
          country: item.country,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          level: this.LEVEL_ARRAY[item.score] || "Legend",
        };
      }
    );

    return {
      topScores: topScoresWithUserInfo,
    };
  }

  async getUserScores(userId: number): Promise<GetUserScoresResponse> {
    const scores = await this.db
      .prepare("SELECT * FROM score WHERE userId = ? ORDER BY createdAt DESC")
      .bind(userId)
      .all<Score>();

    return {
      userId,
      scores: scores.results.map((score) => ({
        id: score.id,
        userId: score.userId,
        gameId: score.gameId,
        score: score.score,
        timestamp: score.timestamp,
        date: score.date,
        country: score.country,
        createdAt: score.createdAt,
        updatedAt: score.updatedAt,
      })),
    };
  }

  async uploadScore(
    userId: number,
    scoreData: UploadScoreRequest,
    country?: string
  ): Promise<ScoreResponse> {
    const existingScore = await this.db
      .prepare("SELECT * FROM score WHERE userId = ? AND gameId = ?")
      .bind(userId, scoreData.gameId)
      .first<Score>();

    if (existingScore) {
      throw new Error("Score already exists");
    }

    const now = Date.now();
    const insertResult = await this.db
      .prepare(
        "INSERT INTO score (userId, gameId, score, timestamp, date, country, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        userId,
        scoreData.gameId,
        scoreData.score,
        scoreData.timestamp,
        scoreData.date,
        country || "CN",
        now,
        now
      )
      .run();

    if (!insertResult.success) {
      throw new Error("Failed to create score");
    }

    const newScore = await this.db
      .prepare("SELECT * FROM score WHERE id = ?")
      .bind(insertResult.meta.last_row_id)
      .first<Score>();

    if (!newScore) {
      throw new Error("Failed to retrieve created score");
    }

    // Smart cache clearing: only clear cache when new score is higher than lowest score in leaderboard
    const shouldClear = await this.shouldClearCache(newScore.score);
    if (shouldClear) {
      console.log(
        `New score ${newScore.score} is higher than lowest leaderboard score, clearing cache`
      );
      this.clearTopScoresCache().catch((error) => {
        console.error("Error clearing cache:", error);
      });
    } else {
      console.log(
        `New score ${newScore.score} does not meet leaderboard threshold, keeping cache`
      );
    }

    return {
      id: newScore.id,
      userId: newScore.userId,
      gameId: newScore.gameId,
      score: newScore.score,
      timestamp: newScore.timestamp,
      date: newScore.date,
      country: newScore.country,
      createdAt: newScore.createdAt,
      updatedAt: newScore.updatedAt,
    };
  }

  async uploadMultipleScores(
    userId: number,
    scoresData: UploadScoreRequest[],
    country?: string
  ): Promise<ScoreResponse[]> {
    const existingScores = await this.db
      .prepare("SELECT * FROM score WHERE userId = ?")
      .bind(userId)
      .all<Score>();

    const existingScoresMap = new Map<string, Score>();
    existingScores.results.forEach((score: Score) => {
      existingScoresMap.set(score.gameId, score);
    });

    const results: ScoreResponse[] = [];
    const scoresToCreate: UploadScoreRequest[] = [];

    for (const scoreData of scoresData) {
      const existingScore = existingScoresMap.get(scoreData.gameId);

      if (existingScore) {
        continue;
      } else {
        scoresToCreate.push(scoreData);
      }
    }

    if (scoresToCreate.length > 0) {
      const now = Date.now();

      for (const scoreData of scoresToCreate) {
        const insertResult = await this.db
          .prepare(
            "INSERT INTO score (userId, gameId, score, timestamp, date, country, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
          )
          .bind(
            userId,
            scoreData.gameId,
            scoreData.score,
            scoreData.timestamp,
            scoreData.date,
            country || "CN",
            now,
            now
          )
          .run();

        if (!insertResult.success) {
          throw new Error(
            `Failed to create score for gameId: ${scoreData.gameId}`
          );
        }

        const newScore = await this.db
          .prepare("SELECT * FROM score WHERE id = ?")
          .bind(insertResult.meta.last_row_id)
          .first<Score>();

        if (newScore) {
          results.push({
            id: newScore.id,
            userId: newScore.userId,
            gameId: newScore.gameId,
            score: newScore.score,
            timestamp: newScore.timestamp,
            date: newScore.date,
            country: newScore.country,
            createdAt: newScore.createdAt,
            updatedAt: newScore.updatedAt,
          });
        }
      }
    }

    // Smart cache clearing: if new scores are created, check if highest score exceeds lowest leaderboard score
    if (results.length > 0) {
      const maxScore = Math.max(...results.map((result) => result.score));
      const shouldClear = await this.shouldClearCache(maxScore);

      if (shouldClear) {
        console.log(
          `Highest score ${maxScore} in batch upload is higher than lowest leaderboard score, clearing cache`
        );
        this.clearTopScoresCache().catch((error) => {
          console.error("Error clearing cache:", error);
        });
      } else {
        console.log(
          `Highest score ${maxScore} in batch upload does not meet leaderboard threshold, keeping cache`
        );
      }
    }

    return results;
  }

  async getTopScores(): Promise<GetTopScoresResponse> {
    // Try to get data from KV cache
    const cached = await this.getCachedTopScores();

    // If cache exists and is not expired, return cached data directly
    if (cached && !this.isCacheExpired(cached.timestamp)) {
      console.log("Returning leaderboard data from KV cache");
      return cached.data;
    }

    console.log(
      "Cache expired or does not exist, fetching latest data from database"
    );

    // Cache does not exist or has expired, fetch latest data from database
    const freshData = await this.fetchTopScoresFromDB();

    // Cache new data to KV (async operation, does not block return)
    await this.setCachedTopScores(freshData);

    return freshData;
  }
}
