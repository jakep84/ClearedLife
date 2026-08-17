
(async function(){
  const message = document.getElementById('confirm-message');
  const actions = document.getElementById('confirm-actions');

  function fallback(text){
    message.textContent = text;
    actions.innerHTML = `
      <a class="button primary" href="account.html?mode=signin">Sign in to ClearedLife</a>
      <a class="button secondary" href="index.html">Back home</a>
    `;
  }

  try {
    const response = await fetch('/api/public-config');
    const cfg = await response.json();
    if(!response.ok) throw new Error(cfg.error || 'Unable to load configuration.');

    const client = supabase.createClient(cfg.url, cfg.key);
    await new Promise(resolve => setTimeout(resolve, 250));

    const { data: { session } } = await client.auth.getSession();

    if(!session) {
      fallback('Your email has been confirmed. Sign in to open your ClearedLife dashboard.');
      return;
    }

    try { await client.rpc('claim_my_readiness_lead'); } catch {}

    message.textContent = 'Email confirmed. Opening your ClearedLife dashboard…';

    if(typeof window.va === 'function'){
      window.va('event', { name:'Account Confirmed' });
    }

    setTimeout(() => location.replace('dashboard.html'), 450);
  } catch(error) {
    fallback('Your confirmation was received, but we could not open the dashboard automatically. Sign in to continue.');
  }
})();
