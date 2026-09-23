import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import Database from 'better-sqlite3';
import { UserRepository } from '../repositories/user-repository';

const SESSION_DAYS = 7;
export class AuthService {
  private users: UserRepository;
  constructor(private readonly db: Database.Database) { this.users = new UserRepository(db); }
  register(email: string, password: string): number {
    return this.users.create(email.toLowerCase(), bcrypt.hashSync(password, 12));
  }
  authenticate(email: string, password: string): number | undefined {
    const user = this.users.findByEmail(email.toLowerCase());
    return user && bcrypt.compareSync(password, user.password_hash) ? user.id : undefined;
  }
  createSession(userId: number): string {
    const token = crypto.randomBytes(32).toString('base64url');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    this.db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)')
      .run(hash, userId, Date.now() + SESSION_DAYS * 86400000);
    return token;
  }
  userForToken(token: string): number | undefined {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const row = this.db.prepare('SELECT user_id, expires_at FROM sessions WHERE token_hash = ?').get(hash) as any;
    if (!row) return undefined;
    if (row.expires_at <= Date.now()) { this.revoke(token); return undefined; }
    return row.user_id;
  }
  revoke(token: string): void {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    this.db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hash);
  }
  setPending(token: string, pending: unknown[]): void {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    this.db.prepare('UPDATE sessions SET pending_json = ? WHERE token_hash = ?').run(JSON.stringify(pending), hash);
  }
  getPending(token: string): any[] {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const row = this.db.prepare('SELECT pending_json FROM sessions WHERE token_hash = ?').get(hash) as any;
    if (!row) return [];
    try { return JSON.parse(row.pending_json) as any[]; } catch { return []; }
  }
}
