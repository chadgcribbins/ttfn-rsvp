const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_KEY) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  const tokens = await kv.smembers('rsvp:index');
  const items = await Promise.all(tokens.map(async t => {
    const r = await kv.hgetall(`rsvp:${t}`);
    return { token: t, ...r };
  }));

  items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return res.json({ ok: true, items });
};


