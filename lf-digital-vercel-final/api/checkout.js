export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    return res.status(400).json({ error: 'Missing MP_ACCESS_TOKEN env var' });
  }
  try {
    const { title, price, quantity = 1 } = req.body || {};
    if (!title || !price) {
      return res.status(400).json({ error: 'Missing title or price' });
    }
    const body = {
      items: [{ title, unit_price: Number(price), quantity: Number(quantity) }],
      back_urls: {
        success: `${req.headers.origin || ''}/success`,
        failure: `${req.headers.origin || ''}/failure`,
        pending: `${req.headers.origin || ''}/pending`
      },
      auto_return: 'approved'
    };
    const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: 'MP error', detail: data });
    }
    return res.status(200).json({ init_point: data.init_point, id: data.id });
  } catch (e) {
    return res.status(500).json({ error: 'Checkout error', detail: String(e) });
  }
}