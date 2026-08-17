module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { email, firstName = '', consent, company = '', source = 'unknown', score, band, categories = [] } = req.body || {};

  // Simple bot honeypot. Real visitors never see or fill this field.
  if (company) return res.status(200).json({ ok: true });

  const safeEmail = normalizeEmail(email);
  if (!safeEmail) return res.status(400).json({ error: 'A valid email is required.' });
  if (consent !== true) return res.status(400).json({ error: 'Consent is required.' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseSecretKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY');
    return res.status(503).json({ error: 'Lead capture is not configured yet.' });
  }

  const numericScore = Number(score);
  const safeScore = Number.isFinite(numericScore) ? Math.max(0, Math.min(100, Math.round(numericScore))) : 0;
  const allowedBands = new Set(['strong','developing','priority']);
  const safeBand = allowedBands.has(String(band)) ? String(band) : 'unknown';
  const safeCategories = Array.isArray(categories) ? categories.slice(0,12).map(item => ({
    name:String(item?.name || '').slice(0,80),
    score:clampNumber(item?.score,0,3),
    maxScore:clampNumber(item?.maxScore,1,3)
  })) : [];

  const lead = {
    email:safeEmail,
    first_name:String(firstName || '').trim().slice(0,80) || null,
    readiness_score:safeScore,
    readiness_band:safeBand,
    source:String(source || 'unknown').slice(0,80),
    consent:true,
    category_scores:safeCategories,
    updated_at:new Date().toISOString()
  };

  try {
    const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/leads?on_conflict=email`;
    const response = await fetch(endpoint, {
      method:'POST',
      headers:{
        'apikey':supabaseSecretKey,
        'Content-Type':'application/json',
        'Prefer':'resolution=merge-duplicates,return=minimal'
      },
      body:JSON.stringify(lead)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase lead error:', response.status, errorText);
      return res.status(502).json({ error: 'Unable to save your result right now.' });
    }

    return res.status(200).json({ ok:true });
  } catch (error) {
    console.error('Lead capture exception:', error);
    return res.status(500).json({ error: 'Unable to save your result right now.' });
  }
};

function normalizeEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase().slice(0,254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function clampNumber(value,min,max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}
