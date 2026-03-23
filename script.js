function calculateScore() {
  const answers = document.querySelectorAll('input[name^="q"]:checked');
  let total = 0;
  answers.forEach(a => total += Number(a.value || 0));

  const tier = document.getElementById('scoreTier');
  const note = document.getElementById('scoreNote');
  const result = document.getElementById('diagResult');
  const pkg = document.getElementById('diagPackage');
  const summary = document.getElementById('diagSummary');
  if (!tier || !note) return;

  if (answers.length < 10) {
    tier.textContent = 'Complete the diagnostic';
    note.textContent = 'Answer all items to receive a recommended engagement level.';
    if (result) result.style.display = 'none';
    return;
  }

  let packageName = 'Foundation';
  let packageSummary = 'A diagnostic-led starting point suited to lower complexity and a clearer initial path.';

  if (total <= 15) {
    packageName = 'Foundation';
    packageSummary = 'This suggests a lighter-touch starting point focused on clarity, baseline assessment, and a practical roadmap.';
  } else if (total <= 25) {
    packageName = 'Structured';
    packageSummary = 'This suggests targeted support is likely appropriate, with stronger system reinforcement and guided implementation.';
  } else {
    packageName = 'Embedded';
    packageSummary = 'This suggests broader pressure or higher complexity, with deeper involvement likely to create traction and follow-through.';
  }

  tier.textContent = packageName + ' is likely the best starting point';
  note.textContent = 'Your recommendation is based on the overall operating picture rather than a single issue.';
  if (pkg) pkg.textContent = packageName + ' package recommended';
  if (summary) summary.textContent = packageSummary;
  if (result) result.style.display = 'block';
}

function calculateAcquisition() {
  const answers = document.querySelectorAll('input[name^="aq"]:checked');
  let total = 0;
  answers.forEach(a => total += Number(a.value || 0));

  const tier = document.getElementById('acqTier');
  const note = document.getElementById('acqNote');
  const result = document.getElementById('acqResult');
  const range = document.getElementById('acqRange');
  const summary = document.getElementById('acqSummary');
  if (!tier || !note) return;

  if (answers.length < 4) {
    tier.textContent = 'Complete the questionnaire';
    note.textContent = 'Your answers will estimate likely assessment scope and fee band. Final fees would be confirmed after discussion.';
    if (result) result.style.display = 'none';
    return;
  }

  let feeRange = 'Indicative fee range: Entry level';
  let feeSummary = 'Likely suited to a narrower review scope with a lighter commercial and operational scan.';

  if (total <= 5) {
    feeRange = 'Indicative fee range: Entry level';
    feeSummary = 'Likely suited to a narrower review scope with a lighter commercial and operational scan.';
  } else if (total <= 8) {
    feeRange = 'Indicative fee range: Standard';
    feeSummary = 'Likely suited to a broader review with moderate complexity and some operating-depth analysis.';
  } else {
    feeRange = 'Indicative fee range: Expanded';
    feeSummary = 'Likely suited to a more involved pre-acquisition assessment with greater complexity, urgency, or diligence depth.';
  }

  tier.textContent = 'Scope estimate ready';
  note.textContent = 'This is an indicative fee guide only. Final scope and pricing would be confirmed after discussion.';
  if (range) range.textContent = feeRange;
  if (summary) summary.textContent = feeSummary;
  if (result) result.style.display = 'block';
}

document.addEventListener('change', function(e){
  if (e.target.matches('input[name^="q"]')) calculateScore();
  if (e.target.matches('input[name^="aq"]')) calculateAcquisition();
});
