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
  questions.forEach((q, idx) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'question';
    qDiv.setAttribute('data-qid', q.id);
    qDiv.innerHTML = `<div><b>${idx + 1}. ${q.question}</b></div>`;
    const optsDiv = document.createElement('div');
    optsDiv.className = 'options';
    // Válaszlehetőségek kirajzolása
    Object.entries(q.options).forEach(([key, val]) => {
      const optId = `q${q.id}_${key}`;
      const label = document.createElement('label');
      label.innerHTML = `
        <input type="radio" name="q${q.id}" value="${key}" id="${optId}">
        <span class="icon"></span> ${val}
      `;
      optsDiv.appendChild(label);
    });
    qDiv.appendChild(optsDiv);
    quizDiv.appendChild(qDiv);
  });
}

// Kiértékelés gomb eseménykezelője
document.getElementById('submit').onclick = function() {
  let correct = 0;
  let practiceList = [];

  questions.forEach(q => {
    const selected = document.querySelector(`input[name="q${q.id}"]:checked`);
    const qDiv = document.querySelector(`.question[data-qid="${q.id}"]`);
    const optsDiv = qDiv.querySelector('.options');
    const labels = optsDiv.querySelectorAll('label');

    // Előző ikonok és stílusok törlése
    labels.forEach(label => {
      label.classList.remove('option-correct', 'option-wrong', 'option-correct-answer');
      label.style.fontWeight = '';
      if (label.querySelector('.icon')) label.querySelector('.icon').textContent = '';
    });

    let userAnswer = selected ? selected.value : null;
    let wasCorrect = userAnswer === q.correct;
    if (wasCorrect) {
      correct++;
    } else if (q.practice && q.practice.length > 0) {
      practiceList.push(
        `${q.id}. kérdés: Gyakorlás javasolt fejezet(ek): ${q.practice.join(', ')}`
      );
    }

    // Opciók végigjárása, ikonok és kiemelés beállítása
    Object.entries(q.options).forEach(([key]) => {
      const label = optsDiv.querySelector(`input[name="q${q.id}"][value="${key}"]`).parentElement;
      let icon = '';
      if (userAnswer === key && wasCorrect) {
        // Helyes választás: zöld pipa
        icon = '✅';
        label.classList.add('option-correct');
      } else if (userAnswer === key && !wasCorrect) {
        // Hibás választás: piros X
        icon = '❌';
        label.classList.add('option-wrong');
      }
      if (!wasCorrect && key === q.correct) {
        // Hibás válasz esetén a helyes választ kiemeljük
        label.classList.add('option-correct-answer');
        label.style.fontWeight = 'bold';
      }
      label.querySelector('.icon').textContent = icon;
    });
  });

  // Eredmény és gyakorlási javaslatok megjelenítése
  let resultText = `Eredmény: ${correct} / ${questions.length}`;
  if (practiceList.length > 0) {
    resultText += '<br><br><b>Gyakorlási javaslatok hibás vagy üres válaszokhoz:</b><br>' + practiceList.join('<br>');
  }
  document.getElementById('result').innerHTML = resultText;
};