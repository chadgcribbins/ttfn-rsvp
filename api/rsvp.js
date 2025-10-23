// Lightweight Upstash REST client (works in any Node runtime)
const BASE_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const AUTH_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
async function upstash(command, ...args) {
  if (!BASE_URL || !AUTH_TOKEN) throw new Error('Missing Upstash REST env vars');
  const res = await fetch(`${BASE_URL}/pipeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AUTH_TOKEN}` },
    body: JSON.stringify({ commands: [[command, ...args]] })
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = null; }
  if (!res.ok) throw new Error((json && (json.error || json[0]?.error)) || text || 'Upstash request failed');
  const result = Array.isArray(json) ? json[0]?.result : undefined;
  return result;
}
const { nanoid } = require('nanoid');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const token = (req.query && req.query.token) || body.token;
  const method = req.method;

  try {
    if (method === 'POST') {
      const { name, email, phone = '', attendance, selectedEvents = [], notes = '' } = body;
      if (!name || !email || !attendance) return res.status(400).json({ ok: false, error: 'Missing fields' });

      const editToken = nanoid(32);
      const id = nanoid(12);
      const record = { id, name, email, phone, attendance, selectedEvents, notes, createdAt: Date.now(), updatedAt: Date.now() };

      await upstash('SET', `rsvp:${editToken}`, JSON.stringify(record));
      await upstash('SADD', 'rsvp:index', editToken);

      const base = (req.headers['x-forwarded-proto'] || 'https') + '://' + req.headers.host;
      return res.status(201).json({ ok: true, id, editToken, editUrl: `${base}/edit.html?token=${editToken}` });
    }

    if (method === 'GET') {
      if (!token) return res.status(400).json({ ok: false, error: 'Missing token' });
      const str = await upstash('GET', `rsvp:${token}`);
      const record = str ? JSON.parse(str) : null;
      if (!record || !record.id) return res.status(404).json({ ok: false, error: 'Not found' });
      return res.json({ ok: true, rsvp: record });
    }

    if (method === 'PUT') {
      if (!token) return res.status(400).json({ ok: false, error: 'Missing token' });
      const existingStr = await upstash('GET', `rsvp:${token}`);
      const existing = existingStr ? JSON.parse(existingStr) : null;
      if (!existing || !existing.id) return res.status(404).json({ ok: false, error: 'Not found' });

      const { name, email, phone = '', attendance, selectedEvents = [], notes = '' } = body;
      const updated = {
        ...existing,
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(attendance !== undefined ? { attendance } : {}),
        ...(selectedEvents ? { selectedEvents } : {}),
        phone, notes,
        updatedAt: Date.now()
      };

      await upstash('SET', `rsvp:${token}`, JSON.stringify(updated));
      return res.json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (e) {
    console.error('RSVP API error:', e);
    return res.status(500).json({ ok: false, error: e.message || 'Server error' });
  }
};


