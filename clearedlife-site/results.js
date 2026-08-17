const categoryCopy = {
  'RESIDENCE HISTORY': {good:'Your residence history appears organized.',mid:'Fill remaining date, address, or verifier gaps.',low:'Reconstruct residence dates, addresses, and people who can verify them.',action:'Build a residence timeline with dates, full addresses, and verifier contact information.'},
  'EMPLOYMENT HISTORY': {good:'Your employment history appears well documented.',mid:'Tighten up missing supervisor contacts or dates.',low:'Reconstruct employment dates and supervisor or verifier details.',action:'Create one employment timeline and resolve missing dates, supervisors, and contact information.'},
  'FOREIGN TRAVEL': {good:'Your travel history appears easy to reconstruct.',mid:'Consolidate travel dates and destinations into one record.',low:'Build a reliable international travel history.',action:'Use passports, calendars, email, and travel accounts to build a single travel log.'},
  'CONTACTS & REFERENCES': {good:'Your verifier and reference information appears current.',mid:'Refresh stale contact information.',low:'Identify and update the people you may need to contact or list.',action:'Update names, phone numbers, email addresses, and your relationship to likely verifiers or references.'},
  'CONSISTENCY': {good:'You have already reviewed the timeline for conflicts.',mid:'Do a complete cross-check for gaps and overlaps.',low:'Your timeline has not yet had a consistency review.',action:'Lay residence, employment, education, and travel dates side-by-side and investigate unexplained gaps or conflicts.'},
  'PRIOR RECORDS': {good:'Prior records are available, or this is your first submission.',mid:'Gather the prior records you still have access to.',low:'Locate or request prior clearance paperwork and supporting records where available.',action:'Collect prior submissions or records you are authorized to retain so future updates start from a known baseline.'}
};

function track(name, data = {}) {
  if (typeof window.va === 'function') window.va('event', { name, data });
}

function getResult() {
  try { return JSON.parse(sessionStorage.getItem('clearedlifeAssessment') || 'null'); }
  catch { return null; }
}

function categoryStatus(score) {
  if (score >= 3) return {label:'Organized',cls:'good',pct:100};
  if (score >= 1) return {label:'Needs review',cls:'mid',pct:score === 2 ? 67 : 34};
  return {label:'Priority',cls:'priority',pct:10};
}

function actionFor(item, index) {
  const copy = categoryCopy[item.key] || {};
  return `<div class="action-item"><div class="action-number">0${index+1}</div><div><strong>${item.key}</strong><p>${copy.action || 'Review and organize this category before you are under a submission deadline.'}</p></div></div>`;
}

const result = getResult();

if (!result) {
  document.querySelector('main').innerHTML = `<section class="empty-result"><div class="eyebrow" style="justify-content:center">ClearedLife Ready</div><h1>No readiness result found.</h1><p>Your assessment is stored only for this browser session. Take the free readiness check to generate your report.</p><a class="button primary" href="index.html#assessment">Take the readiness check</a></section>`;
} else {
  document.getElementById('score-number').textContent = result.score;
  document.getElementById('score-ring').style.setProperty('--score-angle', `${result.score * 3.6}deg`);
  document.getElementById('result-label').textContent = result.label;
  document.getElementById('result-detail').textContent = result.detail;
  document.getElementById('score-band').textContent = result.band === 'strong' ? 'Strong preparation' : result.band === 'developing' ? 'Good foundation' : 'Build your foundation';
  document.getElementById('result-headline').textContent = result.band === 'strong' ? 'strong foundation.' : result.band === 'developing' ? 'good foundation.' : 'clear starting point.';

  document.getElementById('category-results').innerHTML = result.answers.map(item => {
    const status = categoryStatus(item.score);
    const copy = categoryCopy[item.key] || {};
    const description = status.cls === 'good' ? copy.good : status.cls === 'mid' ? copy.mid : copy.low;
    return `<div class="category-row ${status.cls === 'priority' ? 'priority' : ''}"><div class="category-head"><strong>${item.key}</strong><span>${status.label}</span></div><div class="category-bar"><i style="width:${status.pct}%"></i></div><p>${description || ''}</p></div>`;
  }).join('');

  const priorities = [...result.answers].sort((a,b) => a.score - b.score).slice(0,3);
  document.getElementById('action-plan').innerHTML = priorities.map(actionFor).join('');

  track('Readiness Results Viewed', {score_band:result.band,score_range:result.score >= 85 ? '85-100' : result.score >= 60 ? '60-84' : '0-59'});

  const form = document.getElementById('lead-form');
  const submit = document.getElementById('lead-submit');
  const status = document.getElementById('form-status');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    const email = document.getElementById('email').value.trim();
    const firstName = document.getElementById('first-name').value.trim();
    const consent = document.getElementById('consent').checked;
    const company = document.getElementById('company').value.trim();

    if (!email || !consent) {
      status.className = 'form-status error';
      status.textContent = 'Enter a valid email and confirm the opt-in.';
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Saving…';

    try {
      const response = await fetch('/api/lead', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          email,firstName,consent,company,source:'readiness-results',score:result.score,band:result.band,
          categories:result.answers.map(item => ({name:item.key,score:item.score,maxScore:item.maxScore}))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save your result.');

      status.className = 'form-status success';
      status.textContent = 'Saved. You’re on the ClearedLife founding list.';
      submit.textContent = 'Saved ✓';
      track('Readiness Lead Captured', {score_band:result.band,source:'readiness-results'});
    } catch (error) {
      status.className = 'form-status error';
      status.textContent = error.message || 'Something went wrong. Please try again.';
      submit.disabled = false;
      submit.textContent = 'Save result & join early access';
    }
  });
}
