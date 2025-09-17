import type { D1Database } from "@cloudflare/workers-types";
import type { User, UserResponse, LoginRequest } from "../types";
import { encryptPassword } from "../utils";

export class UserService {
  constructor(private db: D1Database) {}

  async login(
    loginData: LoginRequest,
    salt: string = "tinca-salt"
  ): Promise<UserResponse> {
    console.log("login", loginData);
    const userResult = await this.db
      .prepare("SELECT * FROM user WHERE username = ?")
      .bind(loginData.username)
      .first<User>();

    let user: User;

    if (!userResult) {
      const encryptedPassword = encryptPassword(loginData.password, salt);
      const now = Date.now();

      const insertResult = await this.db
        .prepare(
          "INSERT INTO user (username, password, createdAt, updatedAt) VALUES (?, ?, ?, ?)"
        )
        .bind(loginData.username, encryptedPassword, now, now)
        .run();

      if (!insertResult.success) {
        throw new Error("Failed to create user");
      }

      const newUserResult = await this.db
        .prepare("SELECT * FROM user WHERE id = ?")
        .bind(insertResult.meta.last_row_id)
        .first<User>();

      if (!newUserResult) {
        throw new Error("Failed to retrieve created user");
      }

      user = newUserResult;
    } else {
      const encryptedPassword = encryptPassword(loginData.password, salt);
      if (userResult.password !== encryptedPassword) {
        throw new Error("Invalid password");
      }
      user = userResult;
    }

    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await this.db
      .prepare("SELECT * FROM user WHERE id = ?")
      .bind(id)
      .first<User>();

    return result || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await this.db
      .prepare("SELECT * FROM user WHERE username = ?")
      .bind(username)
      .first<User>();

    return result || null;
  }
}
