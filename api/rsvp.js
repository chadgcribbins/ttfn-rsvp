const { kv } = require('@vercel/kv');
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

      await kv.hset(`rsvp:${editToken}`, record);
      await kv.sadd('rsvp:index', editToken);

      const base = (req.headers['x-forwarded-proto'] || 'https') + '://' + req.headers.host;
      return res.status(201).json({ ok: true, id, editToken, editUrl: `${base}/edit.html?token=${editToken}` });
    }

    if (method === 'GET') {
      if (!token) return res.status(400).json({ ok: false, error: 'Missing token' });
      const record = await kv.hgetall(`rsvp:${token}`);
      if (!record || !record.id) return res.status(404).json({ ok: false, error: 'Not found' });
      return res.json({ ok: true, rsvp: record });
    }

    if (method === 'PUT') {
      if (!token) return res.status(400).json({ ok: false, error: 'Missing token' });
      const existing = await kv.hgetall(`rsvp:${token}`);
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

      await kv.hset(`rsvp:${token}`, updated);
      return res.json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};


