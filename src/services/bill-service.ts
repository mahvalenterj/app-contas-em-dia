import Database from 'better-sqlite3';
import { BillInput, validateBill } from '../domain/bill';
import { BillRepository } from '../repositories/bill-repository';

export class BillService {
  private readonly repository: BillRepository;
  constructor(db: Database.Database) { this.repository = new BillRepository(db); }
  confirm(userId: number, input: BillInput): number {
    const error = validateBill(input);
    if (error) throw new Error(error);
    return this.repository.create(userId, input);
  }
  list(userId: number) { return this.repository.list(userId); }
  setStatus(userId: number, id: number, status: 'pendente' | 'pago'): boolean {
    return this.repository.updateStatus(userId, id, status);
  }
}
