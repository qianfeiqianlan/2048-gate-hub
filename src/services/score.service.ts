import type { D1Database } from "@cloudflare/workers-types";
import type {
  Score,
  ScoreResponse,
  UploadScoreRequest,
  GetUserScoresResponse,
  GetTopScoresResponse,
  UserScoreInfo,
} from "../types";

export class ScoreService {
  constructor(private db: D1Database) {}

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

    return results;
  }

  async getTopScores(): Promise<GetTopScoresResponse> {
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
}
