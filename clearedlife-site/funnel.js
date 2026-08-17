// ClearedLife readiness funnel extension.
// Load this AFTER script.js on index.html.

const assessmentAnswers = [];

if (typeof quizContent !== 'undefined' && quizContent) {
  quizContent.addEventListener('click', (event) => {
    const button = event.target.closest('.quiz-option');
    if (!button || typeof questions === 'undefined' || typeof qi === 'undefined') return;

    const currentQuestion = questions[qi];
    const selected = currentQuestion?.opts?.[Number(button.dataset.index)];
    if (!currentQuestion || !selected) return;

    assessmentAnswers.push({
      key: currentQuestion.k,
      question: currentQuestion.q,
      answer: selected[0],
      score: Number(selected[1]),
      maxScore: 3
    });
  }, true);
}

function readinessBand(pct) {
  if (pct >= 85) return {
    band: 'strong',
    label: 'Strong preparation',
    detail: 'Your records appear well organized. A structured consistency review is the next step.'
  };
  if (pct >= 60) return {
    band: 'developing',
    label: 'Good foundation',
    detail: 'You have a useful foundation. Focus on the categories where dates, contacts, or records still need reconstruction.'
  };
  return {
    band: 'priority',
    label: 'Preparation needed',
    detail: 'Your biggest opportunity is organization. Build a reliable history before you are under a submission deadline.'
  };
}

function trackFunnelEvent(name, data = {}) {
  if (typeof window.va === 'function') {
    window.va('event', { name, data });
  }
}

// Override the original inline result renderer from script.js.
// The existing quiz still handles the questions; this extension sends users to a full results page.
renderResult = function () {
  const max = questions.length * 3;
  const pct = Math.round((score / max) * 100);
  const band = readinessBand(pct);

  const result = {
    version: 1,
    completedAt: new Date().toISOString(),
    score: pct,
    band: band.band,
    label: band.label,
    detail: band.detail,
    answers: assessmentAnswers,
    priorities: [...assessmentAnswers]
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(item => item.key)
  };

  try {
    sessionStorage.setItem('clearedlifeAssessment', JSON.stringify(result));
  } catch (error) {
    console.warn('Unable to save assessment result for this browser session.');
  }

  trackFunnelEvent('Readiness Completed', {
    score_band: band.band,
    score_range: pct >= 85 ? '85-100' : pct >= 60 ? '60-84' : '0-59'
  });

  quizStep.textContent = 'Building your result…';
  quizBar.style.width = '100%';
  quizContent.innerHTML = `
    <div class="quiz-result">
      <div class="result-score" style="--score-angle:${pct * 3.6}deg">
        <strong>${pct}</strong><small>READINESS</small>
      </div>
      <h3>${band.label}</h3>
      <p>Building your personalized readiness plan…</p>
    </div>`;

  window.setTimeout(() => window.location.assign('results.html'), 350);
};
