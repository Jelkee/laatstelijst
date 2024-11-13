import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
export class DatabaseManager {
    static _db : NodePgDatabase<typeof schema> | null = null;

    static getDatabase() {
        if (this._db != null)
            return this._db;

        const pool = new Pool({
            connectionString: process.env.DATABASE_URL
        })

        this._db = drizzle(pool);
        return this._db;
    }
}