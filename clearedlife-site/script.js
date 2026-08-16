const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));
}

document.querySelectorAll('[data-scroll-target]').forEach(button => {
  button.addEventListener('click', () => document.getElementById(button.dataset.scrollTarget)?.scrollIntoView({behavior:'smooth'}));
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, {threshold:.08});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const questions = [
  {k:'RESIDENCE HISTORY', q:'Can you account for your residences for the time periods you expect to be asked about?', opts:[['Yes — dates, addresses, and verifiers are organized',3],['Mostly — I would need to fill a few gaps',2],['Not really — I would be reconstructing it',0]]},
  {k:'EMPLOYMENT HISTORY', q:'Do you have reliable dates and supervisor or verifier information for past employment?', opts:[['Yes — it is organized and easy to verify',3],['Mostly — a few contacts or dates are missing',2],['No — I would need significant research',0]]},
  {k:'FOREIGN TRAVEL', q:'If asked, could you reconstruct your international travel dates and destinations?', opts:[['Yes — I maintain a travel record',3],['Mostly — I can reconstruct it with some work',2],['No — I do not have a reliable record',0]]},
  {k:'CONTACTS & REFERENCES', q:'Are the people you may need as verifiers or references current and reachable?', opts:[['Yes — I have current contact information',3],['Some are current; others need work',2],['No — I have not organized this yet',0]]},
  {k:'CONSISTENCY', q:'Have you reviewed your timeline for unexplained gaps or conflicting dates?', opts:[['Yes — I have reviewed the full timeline',3],['Partially',1],['No',0]]},
  {k:'PRIOR RECORDS', q:'Do you have access to copies or records from prior clearance paperwork, if applicable?', opts:[['Yes, or this is my first submission',3],['I have some prior records',2],['No — I would need to locate/request them',0]]}
];
let qi = 0;
let score = 0;
const quizContent = document.getElementById('quiz-content');
const quizStep = document.getElementById('quiz-step');
const quizBar = document.getElementById('quiz-progress-bar');
function renderQuestion(){
  if(!quizContent) return;
  if(qi >= questions.length){ renderResult(); return; }
  const item = questions[qi];
  quizStep.textContent = `Question ${qi+1} of ${questions.length}`;
  quizBar.style.width = `${((qi+1)/questions.length)*100}%`;
  quizContent.innerHTML = `<div class="quiz-question"><small>${item.k}</small><h3>${item.q}</h3><div class="quiz-options">${item.opts.map((o,i)=>`<button class="quiz-option" data-value="${o[1]}" data-index="${i}">${o[0]}</button>`).join('')}</div></div>`;
  quizContent.querySelectorAll('.quiz-option').forEach(btn=>btn.addEventListener('click',()=>{score += Number(btn.dataset.value);qi++;renderQuestion();}));
}
function renderResult(){
  const max = questions.length*3;
  const pct = Math.round((score/max)*100);
  const label = pct >= 85 ? 'Strong preparation' : pct >= 60 ? 'Good start' : 'Needs preparation';
  const detail = pct >= 85 ? 'Your records appear well organized. A structured review for consistency would be the next step.' : pct >= 60 ? 'You have a useful foundation. Focus next on the categories where you would still need to reconstruct dates or contacts.' : 'The biggest opportunity is organization. Start building a reliable timeline before you are under a submission deadline.';
  quizStep.textContent = 'Readiness result'; quizBar.style.width = '100%';
  quizContent.innerHTML = `<div class="quiz-result"><div class="result-score" style="--score-angle:${pct*3.6}deg"><strong>${pct}</strong><small>READINESS</small></div><h3>${label}</h3><p>${detail}</p><p><strong>This is a preparation score only.</strong> It does not predict or determine clearance eligibility.</p><div class="result-actions"><button class="button secondary" id="restart-quiz">Retake</button><a class="button primary" href="mailto:hello@clearedlife.com?subject=ClearedLife%20Early%20Access">Join early access</a></div></div>`;
  document.getElementById('restart-quiz').addEventListener('click',()=>{qi=0;score=0;renderQuestion();});
}
renderQuestion();

const eventGuidance = {
  travel:{title:'Foreign travel may trigger reporting requirements.',body:'Before or after unofficial foreign travel, follow your organization’s security procedures and contact your FSO/security office for the requirements that apply to you.',link:'https://www.dcsa.mil/Industrial-Security/National-Industrial-Security-Program-Oversight/SEAD-3-Unofficial-Foreign-Travel-Reporting/'},
  contact:{title:'Foreign contacts can be reportable depending on the circumstances.',body:'Document the contact accurately and ask your FSO/security office whether your situation meets the applicable reporting threshold.',link:'https://www.dcsa.mil/Personnel-Vetting/Background-Investigations-for-Applicants/Report-a-Security-Change-Concern-or-Threat/'},
  financial:{title:'Significant financial problems can require attention.',body:'Do not wait for a software score to tell you what to do. Preserve accurate records and contact the responsible security office for guidance on your reporting obligations.',link:'https://www.dcsa.mil/Personnel-Vetting/Background-Investigations-for-Applicants/Report-a-Security-Change-Concern-or-Threat/'},
  legal:{title:'Arrests or other legal events may require prompt reporting.',body:'Record what occurred accurately and contact your security office/FSO. For legal or adjudicative strategy, use qualified legal counsel rather than software guidance.',link:'https://www.dcsa.mil/Personnel-Vetting/Background-Investigations-for-Applicants/Report-a-Security-Change-Concern-or-Threat/'},
  marriage:{title:'Relationship changes can affect information your security office maintains.',body:'Keep your personal history current and ask your security office what information or reporting is required in your specific program and position.',link:'https://www.dcsa.mil/Personnel-Vetting/Background-Investigations-for-Applicants/Report-a-Security-Change-Concern-or-Threat/'}
};
const eventResult = document.getElementById('event-result');
function showEvent(key){const g=eventGuidance[key];if(!g||!eventResult)return;eventResult.innerHTML=`<strong>${g.title}</strong><p>${g.body}</p><a href="${g.link}" target="_blank" rel="noopener">Open official DCSA resource ↗</a>`;}
document.querySelectorAll('#event-buttons button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('#event-buttons button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');showEvent(btn.dataset.event);}));
showEvent('travel');
