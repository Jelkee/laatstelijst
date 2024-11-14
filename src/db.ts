import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export class DatabaseManager {
  static _db: NodePgDatabase<typeof schema> | null = null;
  static _pool: Pool | null = null;

  // Get or create the database connection
  static getDatabase() {
    if (this._db != null) return this._db;

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set in the environment variables.");
    }

    // Create a new PostgreSQL pool instance if not created already
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Create a drizzle-ORM database instance using the pool
    this._db = drizzle(this._pool, { schema });

    // Return the database instance
    return this._db;
  }

  // Gracefully shut down the database connections
  static async closeDatabase() {
    if (this._pool) {
      await this._pool.end();
      this._db = null; // Nullify the reference after closing the connection pool
      console.log("Database connections closed.");
    }
  }
}
