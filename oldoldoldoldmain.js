let questions = [];

// Kérdések betöltése JSON-ból
fetch('startTest.json')
  .then(res => res.json())
  .then(data => {
    questions = data;
    renderQuiz();
  });

// Kvíz kirajzolása
function renderQuiz() {
  const quizDiv = document.getElementById('quiz');
  quizDiv.innerHTML = '';
  questions.forEach((q) => {
    const qDiv = createQuestionElement(q);
    quizDiv.appendChild(qDiv);
  });
  document.getElementById('result').innerHTML = '';
  document.getElementById('retry').style.display = 'none';
}

// Kérdés HTML létrehozása
function createQuestionElement(q) {
  const qDiv = document.createElement('div');
  qDiv.className = 'question';
  qDiv.setAttribute('data-qid', q.id);
  qDiv.innerHTML = `<div><b>${q.id}. ${q.question}</b></div>`;
  const optsDiv = createOptionsElement(q);
  qDiv.appendChild(optsDiv);
  return qDiv;
}

// Opciók HTML létrehozása
function createOptionsElement(q) {
  const optsDiv = document.createElement('div');
  optsDiv.className = 'options';
  Object.entries(q.options).forEach(([key, val]) => {
    const label = createOptionLabel(q, key, val);
    optsDiv.appendChild(label);
  });
  return optsDiv;
}

// Egyetlen válasz HTML létrehozása
function createOptionLabel(q, key, val) {
  const optId = `q${q.id}_${key}`;
  const label = document.createElement('label');
  label.innerHTML = `
    <input type="radio" name="q${q.id}" value="${key}" id="${optId}">
    <span class="icon"></span> ${val}
  `;
  return label;
}

// Eredmény kiértékelés
document.getElementById('submit').onclick = function () {
  let correct = 0;
  let practiceList = [];

  questions.forEach(q => {
    const selected = document.querySelector(`input[name="q${q.id}"]:checked`);
    const userAnswer = selected ? selected.value : null;
    const wasCorrect = userAnswer === q.correct;

    if (wasCorrect) {
      correct++;
    } else if (q.practice && q.practice.length > 0) {
      practiceList.push(`${q.id}. kérdés: Gyakorlás javasolt fejezet(ek): ${q.practice.join(', ')}`);
    }

    updateQuestionStyle(q, userAnswer, wasCorrect);
  });

  displayResult(correct, practiceList);
};

// Kérdések stílusának frissítése
function updateQuestionStyle(q, userAnswer, wasCorrect) {
  const qDiv = document.querySelector(`.question[data-qid="${q.id}"]`);
  const optsDiv = qDiv.querySelector('.options');
  const labels = optsDiv.querySelectorAll('label');

  labels.forEach(label => {
    label.classList.remove('option-correct', 'option-wrong', 'option-correct-answer');
    label.style.fontWeight = '';
    if (label.querySelector('.icon')) label.querySelector('.icon').textContent = '';
  });

  Object.entries(q.options).forEach(([key]) => {
    const label = optsDiv.querySelector(`input[name="q${q.id}"][value="${key}"]`).parentElement;
    let icon = '';
    if (userAnswer === key && wasCorrect) {
      icon = '✅';
      label.classList.add('option-correct');
    } else if (userAnswer === key && !wasCorrect) {
      icon = '❌';
      label.classList.add('option-wrong');
    }
    if (!wasCorrect && key === q.correct) {
      label.classList.add('option-correct-answer');
      label.style.fontWeight = 'bold';
    }
    label.querySelector('.icon').textContent = icon;
  });
}

// Eredmény megjelenítése
function displayResult(correct, practiceList) {
  let resultText = `Eredmény: ${correct} / ${questions.length}`;
  if (practiceList.length > 0) {
    resultText += '<br><br><b>Gyakorlási javaslatok hibás vagy üres válaszokhoz:</b><br>' + practiceList.join('<br>');
    document.getElementById('retry').style.display = 'inline-block'; // Ha van hibás kérdés, megjelenik a gomb
  } else {
    document.getElementById('retry').style.display = 'none';
  }
  document.getElementById('result').innerHTML = resultText;
}

// Hibás kérdések újra kirajzolása
document.getElementById('retry').onclick = function () {
  const retryQuestions = questions.filter(q => {
    const selected = document.querySelector(`input[name="q${q.id}"]:checked`);
    const userAnswer = selected ? selected.value : null;
    return userAnswer !== q.correct;
  });

  renderRetryQuiz(retryQuestions);
};

// Csak hibás kérdések kirajzolása
function renderRetryQuiz(retryList) {
  const quizDiv = document.getElementById('quiz');
  quizDiv.innerHTML = '';
  retryList.forEach((q) => {
    const qDiv = createQuestionElement(q);
    quizDiv.appendChild(qDiv);
  });
  document.getElementById('result').innerHTML = '';
  document.getElementById('retry').style.display = 'none';
}
