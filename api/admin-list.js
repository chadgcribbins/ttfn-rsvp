const BASE_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const AUTH_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
async function upstash(command, ...args) {
  if (!BASE_URL || !AUTH_TOKEN) throw new Error('Missing Upstash REST env vars');
  const res = await fetch(`${BASE_URL}/pipeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AUTH_TOKEN}` },
    body: JSON.stringify({ commands: [[command, ...args]] })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Upstash request failed');
  const result = Array.isArray(json) ? json[0]?.result : undefined;
  return result;
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_KEY) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  const tokens = await upstash('SMEMBERS', 'rsvp:index') || [];
  const items = await Promise.all(tokens.map(async t => {
    const str = await upstash('GET', `rsvp:${t}`);
    const r = str ? JSON.parse(str) : {};
    return { token: t, ...r };
  }));

  items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return res.json({ ok: true, items });
};


