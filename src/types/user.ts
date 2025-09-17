export interface User {
  id: number;
  username: string;
  password: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserResponse {
  id: number;
  username: string;
  createdAt: number;
  updatedAt: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  userInfo: UserResponse;
  token: string;
}

export interface JwtPayload {
  id: number;
  username: string;
}
