import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import pdfParse from 'pdf-parse';
import { BillInput, validDate } from '../domain/bill';

export interface Preview extends BillInput { previewId: string; filename: string; }
function dateFromText(text: string): string | undefined {
  const match = text.match(/(?:vencimento|vcto|venc\.?)[^\d]*(\d{2})[\/.-](\d{2})[\/.-](\d{4})/i)
    ?? text.match(/\b(\d{2})[\/](\d{2})[\/](\d{4})\b/);
  if (!match) return undefined;
  const value = `${match[3]}-${match[2]}-${match[1]}`;
  return validDate(value) ? value : undefined;
}
function amountFromText(text: string): number | undefined {
  const match = text.match(/(?:valor(?:\s+do\s+documento)?|total)[^\d]*(\d{1,3}(?:\.\d{3})*,\d{2})/i);
  if (!match) return undefined;
  const value = Number(match[1].replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(value) ? value : undefined;
}
function extract(text: string): Omit<Preview, 'previewId' | 'filename'> {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const beneficiary = (text.match(/(?:beneficiário|cedente|pagador)\s*[:\-]\s*(.+)/i)?.[1] ?? lines[0] ?? '').trim().slice(0, 200);
  const barcode = text.replace(/\D/g, '').match(/\d{44,48}/)?.[0];
  const bank = text.match(/banco\s*[:\-]\s*(.+)/i)?.[1]?.trim().slice(0, 200);
  return { beneficiary, amount: amountFromText(text) ?? 0, dueDate: dateFromText(text) ?? '', barcode, bank };
}
export async function processPdf(buffer: Buffer, filename: string): Promise<Preview> {
  if (buffer.length < 5 || buffer.subarray(0, 5).toString() !== '%PDF-') throw new Error('arquivo não é um PDF válido');
  const temp = path.join(os.tmpdir(), `contas-${crypto.randomUUID()}.pdf`);
  await fs.writeFile(temp, buffer, { flag: 'wx' });
  try {
    const result = await pdfParse(buffer);
    if (!result.text.trim()) throw new Error('PDF sem texto selecionável');
    return { ...extract(result.text), previewId: crypto.randomUUID(), filename: filename.slice(0, 200) };
  } catch (error) {
    if (error instanceof Error && error.message === 'PDF sem texto selecionável') throw error;
    throw new Error('PDF não pôde ser lido');
  } finally {
    await fs.rm(temp, { force: true });
  }
}
