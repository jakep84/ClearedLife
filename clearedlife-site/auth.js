
let client;

async function initClient(){
  const r = await fetch('/api/public-config');
  const cfg = await r.json();
  if(!r.ok) throw new Error(cfg.error || 'Unable to load authentication configuration.');
  client = supabase.createClient(cfg.url, cfg.key);

  const params = new URLSearchParams(location.search);
  if(params.get('mode') === 'signin') {
    document.querySelector('[data-auth-tab="signin"]')?.click();
  }

  const { data:{ session } } = await client.auth.getSession();
  if(session) {
    await claimLead();
    location.replace('dashboard.html');
    return;
  }

  const leadEmail = sessionStorage.getItem('clearedlifeLeadEmail');
  if(leadEmail) {
    document.getElementById('signup-email').value = leadEmail;
    document.getElementById('signin-email').value = leadEmail;
  }
}

async function claimLead(){
  try { await client.rpc('claim_my_readiness_lead'); } catch {}
}

function status(message, kind=''){
  const el=document.getElementById('auth-status');
  el.className='auth-status '+kind;
  el.textContent=message;
}

document.querySelectorAll('[data-auth-tab]').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('[data-auth-tab]').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  const signup=btn.dataset.authTab==='signup';
  document.getElementById('signup-form').classList.toggle('hidden',!signup);
  document.getElementById('signin-form').classList.toggle('hidden',signup);
  status('');
}));

document.getElementById('signup-form').addEventListener('submit',async e=>{
  e.preventDefault();
  const firstName=document.getElementById('signup-name').value.trim();
  const email=document.getElementById('signup-email').value.trim();
  const password=document.getElementById('signup-password').value;

  status('Creating your account…');

  const { data,error }=await client.auth.signUp({
    email,
    password,
    options:{
      data:{first_name:firstName},
      emailRedirectTo:`${location.origin}/auth-return`
    }
  });

  if(error){
    status(error.message,'error');
    return;
  }

  if(data.session){
    await claimLead();
    location.assign('dashboard.html');
  } else {
    sessionStorage.setItem('clearedlifePendingEmail', email);
    status('Account created. Check your email and click the ClearedLife confirmation link. We’ll bring you straight to your dashboard.','success');
  }
});

document.getElementById('signin-form').addEventListener('submit',async e=>{
  e.preventDefault();

  const email=document.getElementById('signin-email').value.trim();
  const password=document.getElementById('signin-password').value;

  status('Signing in…');

  const { error }=await client.auth.signInWithPassword({email,password});

  if(error){
    status(error.message,'error');
    return;
  }

  await claimLead();
  location.assign('dashboard.html');
});

initClient().catch(err=>status(err.message,'error'));
