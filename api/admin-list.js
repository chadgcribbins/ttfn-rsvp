let kv;
try { ({ kv } = require('@vercel/kv')); }
catch (_) {
  const { Redis } = require('@upstash/redis');
  const client = new Redis({
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  kv = {
    async hgetall(key) { return client.hgetall(key); },
    async smembers(key) { return client.smembers(key); }
  };
}

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


