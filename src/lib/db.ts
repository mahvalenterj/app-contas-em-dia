import Database from 'better-sqlite3';

export function createDatabase(filename = ':memory:'): Database.Database {
  const db = new Database(filename);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL, pending_json TEXT NOT NULL DEFAULT '[]',
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
      beneficiary TEXT NOT NULL, amount INTEGER NOT NULL, due_date TEXT NOT NULL,
      barcode TEXT, issue_date TEXT, bank TEXT, status TEXT NOT NULL CHECK(status IN ('pendente','pago')),
      created_at TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS bills_user_due ON bills(user_id, due_date);
  `);
  return db;
}
