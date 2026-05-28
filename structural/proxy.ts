// Subject interface - proxy and real object share this
interface IDatabase {
    query(sql: string): any;
}

// Real subject - expensive to call
class RealDatabase implements IDatabase {
    query(sql: string): any {
        console.log(`[DB] Executing: ${sql}`);
        return { rows: ["result1", "result2"] };
    }
}

// Proxy - access control + caching in one place
class DatabaseProxy implements IDatabase {
    private realDb: RealDatabase | null = null;   // virtual proxy - lazy init
    private cache = new Map<string, any>();
    private currentUser: string;

    constructor(user: string) {
        this.currentUser = user;
    }

    query(sql: string): any {
        // 1 Protection proxy - check role
        if (this.currentUser !== "admin" && sql.includes("DELETE")) {
            console.log(`[PROXY] Access denied for user: ${this.currentUser}`);
            return null;
        }

        // 2 Caching proxy - return cached result if available
        if (this.cache.has(sql)) {
            console.log(`[PROXY] Cache hit for: ${sql}`);
            return this.cache.get(sql);
        }

        // 3 Virtual proxy - create real object only on first actual use
        if (!this.realDb) {
            this.realDb = new RealDatabase();
            console.log("[PROXY] RealDatabase created (lazy init)");
        }

        const result = this.realDb.query(sql);
        this.cache.set(sql, result);
        return result;
    }
}

// Usage - client only sees IDatabase, never RealDatabase directly
const db: IDatabase = new DatabaseProxy("admin");
db.query("SELECT * FROM users");    // [PROXY] RealDatabase created → [DB] Executing
db.query("SELECT * FROM users");    // [PROXY] Cache hit - no DB call

const guest: IDatabase = new DatabaseProxy("guest");
guest.query("DELETE FROM logs");     // [PROXY] Access denied