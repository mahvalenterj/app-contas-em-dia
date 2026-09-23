import Database from 'better-sqlite3';
import { Bill, BillInput, derivedStatus, StoredStatus } from '../domain/bill';

export class BillRepository {
  constructor(private readonly db: Database.Database) {}
  create(userId: number, input: BillInput): number {
    const result = this.db.prepare(`
      INSERT INTO bills(user_id, beneficiary, amount, due_date, barcode, issue_date, bank, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente', ?)
    `).run(userId, input.beneficiary, Math.round(input.amount * 100), input.dueDate,
      input.barcode ?? null, input.issueDate ?? null, input.bank ?? null, new Date().toISOString());
    return Number(result.lastInsertRowid);
  }
  list(userId: number, today = new Date()): Bill[] {
    const rows = this.db.prepare('SELECT * FROM bills WHERE user_id = ? ORDER BY due_date ASC, id ASC').all(userId) as any[];
    return rows.map(row => ({ id: row.id, userId: row.user_id, beneficiary: row.beneficiary,
      amount: row.amount / 100, dueDate: row.due_date, barcode: row.barcode ?? undefined,
      issueDate: row.issue_date ?? undefined, bank: row.bank ?? undefined,
      status: derivedStatus(row.status as StoredStatus, row.due_date, today), createdAt: row.created_at }));
  }
  updateStatus(userId: number, id: number, status: StoredStatus): boolean {
    const result = this.db.prepare('UPDATE bills SET status = ? WHERE id = ? AND user_id = ?').run(status, id, userId);
    return result.changes > 0;
  }
}
