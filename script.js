
function calculateScore() {
  const answers = document.querySelectorAll('input[type="radio"]:checked');
  let total = 0;
  answers.forEach(a => total += Number(a.value || 0));

  const score = document.getElementById('scoreValue');
  const tier = document.getElementById('scoreTier');
  const note = document.getElementById('scoreNote');
  if (!score || !tier || !note) return;

  score.textContent = total;

  if (answers.length < 10) {
    tier.textContent = 'Incomplete';
    note.textContent = 'Answer all questionnaire items to estimate your fit and indicative package range.';
    return;
  }

  if (total <= 15) {
    tier.textContent = 'Foundation';
    note.textContent = 'Best suited to a diagnostic-led entry point with lower complexity and a clearer initial path.';
  } else if (total <= 25) {
    tier.textContent = 'Guided Improvement';
    note.textContent = 'Moderate complexity. Strong fit for targeted support, clarified priorities, and selected implementation help.';
  } else if (total <= 35) {
    tier.textContent = 'Implementation Intensive';
    note.textContent = 'Higher involvement required. Multiple stability pillars likely need reinforcement and closer delivery support.';
  } else {
    tier.textContent = 'Full Partnership';
    note.textContent = 'High complexity / urgency / implementation risk. Best suited to full-system engagement and active partnership.';
  }
}

document.addEventListener('change', function(e){
  if (e.target.matches('input[type="radio"]')) calculateScore();
});
