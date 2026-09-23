import Fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { createDatabase } from './lib/db';
import { AuthService } from './services/auth-service';
import { BillService } from './services/bill-service';
import { processPdf, Preview } from './services/pdf-service';

const COOKIE = 'contas_session';
const MAX_FILE = 5 * 1024 * 1024;
const MAX_BATCH = 25 * 1024 * 1024;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bodyObject(request: FastifyRequest): Record<string, unknown> {
  return (request.body && typeof request.body === 'object' ? request.body : {}) as Record<string, unknown>;
}
export function buildApp(database?: Database.Database): FastifyInstance {
  const db = database ?? createDatabase(process.env.DATABASE_PATH ?? 'contas-em-dia.sqlite');
  const auth = new AuthService(db);
  const bills = new BillService(db);
  const app = Fastify({ logger: false });
  app.register(cookie);
  app.register(multipart, { limits: { files: 10, fileSize: MAX_FILE, parts: 12 } });

  const tokenOf = (request: FastifyRequest) => request.cookies[COOKIE];
  const userIdOf = (request: FastifyRequest) => {
    const token = tokenOf(request);
    return token ? auth.userForToken(token) : undefined;
  };
  const requireUser = (request: FastifyRequest, reply: any): number | undefined => {
    const id = userIdOf(request);
    if (!id) { reply.code(401).send({ error: 'autenticação necessária' }); return undefined; }
    return id;
  };
  app.post('/auth/register', async (request, reply) => {
    const body = bodyObject(request);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!emailPattern.test(email) || password.length < 8 || password.length > 200)
      return reply.code(400).send({ error: 'e-mail ou senha inválidos' });
    try { auth.register(email, password); return reply.code(201).send({ message: 'usuário criado' }); }
    catch { return reply.code(409).send({ error: 'não foi possível criar o usuário' }); }
  });
  app.post('/auth/login', async (request, reply) => {
    const body = bodyObject(request);
    const email = typeof body.email === 'string' ? body.email : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const userId = auth.authenticate(email, password);
    if (!userId) return reply.code(401).send({ error: 'credenciais inválidas' });
    const token = auth.createSession(userId);
    reply.setCookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
      path: '/', maxAge: 7 * 86400 });
    return reply.send({ message: 'login realizado' });
  });
  app.post('/auth/logout', async (request, reply) => {
    const token = tokenOf(request); if (token) auth.revoke(token);
    reply.clearCookie(COOKIE, { path: '/' }); return reply.send({ message: 'logout realizado' });
  });
  app.get('/auth/me', async (request, reply) => {
    const id = requireUser(request, reply); if (!id) return;
    return reply.send({ userId: id });
  });
  app.post('/uploads', async (request, reply) => {
    const userId = requireUser(request, reply); if (!userId) return;
    const token = tokenOf(request)!;
    const previews: Preview[] = []; let total = 0;
    try {
      for await (const part of request.parts()) {
        if (!part.file) continue;
        const buffer = await part.toBuffer();
        if (part.file.truncated || buffer.length > MAX_FILE) throw new Error('arquivo excede 5 MB');
        total += buffer.length;
        if (total > MAX_BATCH) throw new Error('lote excede 25 MB');
        try { previews.push(await processPdf(buffer, part.filename)); }
        catch (error) { previews.push({ previewId: '', filename: part.filename.slice(0, 200),
          beneficiary: '', amount: 0, dueDate: '', ...(error instanceof Error ? { error: error.message } : { error: 'arquivo não processado' }) } as Preview); }
      }
      if (!previews.length) return reply.code(400).send({ error: 'envie ao menos um PDF' });
      auth.setPending(token, [...auth.getPending(token), ...previews.filter(p => p.previewId)]);
      return reply.send({ items: previews });
    } catch (error) {
      return reply.code(400).send({ error: error instanceof Error ? error.message : 'lote inválido' });
    }
  });
  app.post('/bills/confirm', async (request, reply) => {
    const userId = requireUser(request, reply); if (!userId) return;
    const token = tokenOf(request)!; const body = bodyObject(request);
    const previewId = typeof body.previewId === 'string' ? body.previewId : '';
    const pending = auth.getPending(token); const preview = pending.find(item => item.previewId === previewId);
    if (!preview) return reply.code(404).send({ error: 'prévia não encontrada ou expirada' });
    const input = { beneficiary: body.beneficiary, amount: body.amount, dueDate: body.dueDate,
      barcode: body.barcode, issueDate: body.issueDate, bank: body.bank };
    try {
      const id = bills.confirm(userId, input as any);
      auth.setPending(token, pending.filter(item => item.previewId !== previewId));
      return reply.code(201).send({ id });
    } catch (error) { return reply.code(400).send({ error: error instanceof Error ? error.message : 'dados inválidos' }); }
  });
  app.get('/bills', async (request, reply) => {
    const userId = requireUser(request, reply); if (!userId) return;
    const list = bills.list(userId);
    const groups: Record<string, typeof list> = {};
    for (const bill of list) (groups[bill.dueDate.slice(0, 7)] ??= []).push(bill);
    return reply.send({ items: list, groups });
  });
  app.patch('/bills/:id/status', async (request, reply) => {
    const userId = requireUser(request, reply); if (!userId) return;
    const body = bodyObject(request); const status = body.status;
    const id = Number((request.params as { id: string }).id);
    if (!Number.isSafeInteger(id) || (status !== 'pendente' && status !== 'pago'))
      return reply.code(400).send({ error: 'status inválido' });
    if (!bills.setStatus(userId, id, status)) return reply.code(404).send({ error: 'conta não encontrada' });
    return reply.send({ message: 'status atualizado' });
  });
  app.setErrorHandler((error, _request, reply) => {
    if ((error as any).code === 'FST_REQ_FILE_TOO_LARGE') return reply.code(413).send({ error: 'arquivo excede 5 MB' });
    return reply.code(500).send({ error: 'erro interno' });
  });
  return app;
}
