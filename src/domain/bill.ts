export type StoredStatus = 'pendente' | 'pago';
export type BillStatus = StoredStatus | 'vencido';

export interface BillInput {
  beneficiary: string;
  amount: number;
  dueDate: string;
  barcode?: string;
  issueDate?: string;
  bank?: string;
}

export interface Bill extends BillInput {
  id: number;
  userId: number;
  status: BillStatus;
  createdAt: string;
}

export function derivedStatus(status: StoredStatus, dueDate: string, today = new Date()): BillStatus {
  if (status === 'pago') return 'pago';
  const due = new Date(`${dueDate}T23:59:59.999Z`);
  return due.getTime() < Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0)
    ? 'vencido' : 'pendente';
}

export function validDate(value: string | undefined): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateBill(input: Partial<BillInput>): string | undefined {
  if (!input.beneficiary || input.beneficiary.trim().length > 200) return 'beneficiary inválido';
  if (typeof input.amount !== 'number' || !Number.isFinite(input.amount) || input.amount <= 0) return 'amount inválido';
  if (!validDate(input.dueDate)) return 'dueDate inválido';
  for (const field of ['barcode', 'issueDate', 'bank'] as const) {
    if (input[field] !== undefined && input[field]!.length > 200) return `${field} inválido`;
  }
  if (input.issueDate !== undefined && !validDate(input.issueDate)) return 'issueDate inválido';
  return undefined;
}
