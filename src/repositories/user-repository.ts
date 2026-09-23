import Database from 'better-sqlite3';

export class UserRepository {
  constructor(private readonly db: Database.Database) {}
  create(email: string, passwordHash: string): number {
    const result = this.db.prepare(
      'INSERT INTO users(email, password_hash, created_at) VALUES (?, ?, ?)'
    ).run(email, passwordHash, new Date().toISOString());
    return Number(result.lastInsertRowid);
  }
  findByEmail(email: string): { id: number; email: string; password_hash: string } | undefined {
    return this.db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email) as any;
  }
  findById(id: number): { id: number; email: string } | undefined {
    return this.db.prepare('SELECT id, email FROM users WHERE id = ?').get(id) as any;
  }
}
