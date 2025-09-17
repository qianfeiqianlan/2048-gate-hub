export interface Score {
  id: number;
  userId: number;
  gameId: string;
  score: number;
  timestamp: number;
  date: string;
  country?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ScoreResponse {
  id: number;
  userId: number;
  gameId: string;
  score: number;
  timestamp: number;
  date: string;
  country?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UploadScoreRequest {
  gameId: string;
  score: number;
  timestamp: number;
  date: string;
}

export interface UploadMultipleScoresRequest {
  scores: UploadScoreRequest[];
}

export interface GetUserScoresResponse {
  userId: number;
  scores: ScoreResponse[];
}

export interface UserScoreInfo {
  userId: number;
  username: string;
  highestScore: number;
  gameId: string;
  timestamp: number;
  date: string;
  country?: string;
  createdAt: number;
  updatedAt: number;
  level: string;
}

export interface GetTopScoresResponse {
  topScores: UserScoreInfo[];
}
