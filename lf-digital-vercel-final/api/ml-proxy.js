export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Missing url param' });

    try {
      const u = new URL(url);
      const allowed = ['api.mercadolibre.com','http2.mlstatic.com'];
      if (!allowed.includes(u.hostname)) {
        return res.status(400).json({ error: 'Domain not allowed' });
      }
    } catch (e) {
      return res.status(400).json({ error: 'Bad url' });
    }

    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const text = await r.text();
    try {
      const json = JSON.parse(text);
      return res.status(r.status).json(json);
    } catch (_) {
      return res.status(r.status).send(text);
    }
  } catch (e) {
    return res.status(500).json({ error: 'Proxy error', detail: String(e) });
  }
}