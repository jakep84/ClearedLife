
let client, session, latestAssessment = null;
const categoryCopy={
  'RESIDENCE HISTORY':'Resolve missing address dates and verifier details.',
  'EMPLOYMENT HISTORY':'Confirm employers, dates, supervisors/verifiers, and gaps.',
  'FOREIGN TRAVEL':'Maintain reliable travel dates, destinations, and context.',
  'CONTACTS & REFERENCES':'Update verifier/reference contact information.',
  'CONSISTENCY':'Cross-check residence, work, education and travel timelines.',
  'PRIOR RECORDS':'Gather prior records you are authorized to retain.'
};

async function init(){
  const r=await fetch('/api/public-config'); const cfg=await r.json();
  if(!r.ok) throw new Error(cfg.error||'Unable to load configuration.');
  client=supabase.createClient(cfg.url,cfg.key);
  const s=await client.auth.getSession(); session=s.data.session;
  if(!session){location.replace('account.html?mode=signin');return}
  document.getElementById('user-email').textContent=session.user.email;
  await client.rpc('claim_my_readiness_lead');
  await importBrowserAssessment();
  await loadDashboard();
}

async function importBrowserAssessment(){
  let browser=null; try{browser=JSON.parse(sessionStorage.getItem('clearedlifeAssessment')||'null')}catch{}
  if(!browser?.score || !Array.isArray(browser.answers)) return;
  const completedAt=browser.completedAt || new Date().toISOString();
  const payload={
    user_id:session.user.id,
    readiness_score:Number(browser.score),
    readiness_band:String(browser.band||'unknown'),
    category_scores:browser.answers.map(x=>({name:x.key,score:Number(x.score),maxScore:Number(x.maxScore||3)})),
    completed_at:completedAt,
    source:'browser-assessment'
  };
  await client.from('readiness_assessments').upsert(payload,{onConflict:'user_id,completed_at'});
}

async function loadDashboard(){
  const {data:assessments,error}=await client.from('readiness_assessments')
    .select('*').order('completed_at',{ascending:false}).limit(1);
  if(error) throw error;
  latestAssessment=assessments?.[0]||null;

  const {data:progress}=await client.from('ready_progress').select('*');
  const progressMap=Object.fromEntries((progress||[]).map(x=>[x.category_key,x.status]));
  renderAssessment();
  renderPriorities();
  renderTasks(progressMap);
}

function renderAssessment(){
  const el=document.getElementById('assessment-state');
  if(!latestAssessment){
    el.innerHTML='<div class="account-empty"><h3>No saved assessment yet.</h3><p>Take the free readiness check and your result will become your baseline here.</p><a class="button primary" href="index.html#assessment">Take readiness check</a></div>';return;
  }
  const score=latestAssessment.readiness_score;
  el.innerHTML=`<div class="score-wrap"><div class="score-ring" style="--angle:${score*3.6}deg"><strong>${score}</strong><small>READINESS</small></div><div><h3>${latestAssessment.readiness_band==='strong'?'Strong preparation':latestAssessment.readiness_band==='developing'?'Good foundation':'Preparation needed'}</h3><p>Baseline from ${new Date(latestAssessment.completed_at).toLocaleDateString()}.</p></div></div>`;
}

function renderPriorities(){
  const el=document.getElementById('priority-list');
  const cats=latestAssessment?.category_scores||[];
  if(!cats.length){el.innerHTML='<div class="account-empty">Complete an assessment to generate priorities.</div>';return}
  const sorted=[...cats].sort((a,b)=>Number(a.score)-Number(b.score)).slice(0,3);
  el.innerHTML=sorted.map((x,i)=>`<div class="priority"><strong>0${i+1} · ${x.name}</strong><span>${categoryCopy[x.name]||'Review this preparation category.'}</span></div>`).join('');
}

function renderTasks(progressMap){
  const el=document.getElementById('task-list');
  const cats=latestAssessment?.category_scores||[];
  const keys=cats.length?cats.map(x=>x.name):Object.keys(categoryCopy);
  el.innerHTML=keys.map(key=>`<div class="task"><div><strong>${key}</strong><span>${categoryCopy[key]||''}</span></div><select data-category="${key}"><option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="complete">Complete</option></select></div>`).join('');
  el.querySelectorAll('select').forEach(sel=>{
    sel.value=progressMap[sel.dataset.category]||'not_started';
    sel.addEventListener('change',()=>saveProgress(sel.dataset.category,sel.value));
  });
}

async function saveProgress(category,status){
  const {error}=await client.from('ready_progress').upsert({
    user_id:session.user.id,category_key:category,status,updated_at:new Date().toISOString()
  },{onConflict:'user_id,category_key'});
  if(error) console.error(error);
}

document.getElementById('sign-out').addEventListener('click',async()=>{
  await client.auth.signOut(); location.replace('account.html?mode=signin');
});

init().catch(err=>{
  console.error(err);
  document.getElementById('assessment-state').innerHTML=`<div class="account-empty"><h3>Unable to load dashboard.</h3><p>${err.message}</p></div>`;
});
