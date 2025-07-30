let questions = [];

// Kérdések betöltése JSON-ból
// A fetch() függvénnyel lekérjük a startTest.json fájlt.
// A .then() blokkokban feldolgozzuk a választ.
// Az első .then() a választ JSON formátumra alakítja.
// A második .then() a JSON adatokat a 'questions' változóba tölti,
// majd meghívja a renderQuiz() függvényt a kvíz megjelenítéséhez.
fetch('startTest.json')
  .then(res => res.json())
  .then(data => {
    questions = data;
    renderQuiz();
  });

// Kvíz kirajzolása
// A renderQuiz() függvény felelős a kvíz kérdéseinek és válaszlehetőségeinek
// dinamikus létrehozásáért és megjelenítéséért a HTML-ben.
function renderQuiz() {
  const quizDiv = document.getElementById('quiz');
  quizDiv.innerHTML = '';
  questions.forEach((q, idx) => {
    const qDiv = createQuestionElement(q, idx);
    quizDiv.appendChild(qDiv);
  });
}

// Létrehoz egy HTML elemet egyetlen kérdéshez.
// A függvény létrehoz egy 'div' elemet a kérdésnek, beállítja az osztályát és egyedi azonosítóját,
// majd hozzáadja a kérdés szövegét. Meghívja a createOptionsElement() függvényt
// a válaszlehetőségek létrehozásához, és hozzáadja őket a kérdéshez.
function createQuestionElement(q, idx) {
  const qDiv = document.createElement('div');
  qDiv.className = 'question';
  qDiv.setAttribute('data-qid', q.id);
  qDiv.innerHTML = `<div><b>${idx + 1}. ${q.question}</b></div>`;
  const optsDiv = createOptionsElement(q);
  qDiv.appendChild(optsDiv);
  return qDiv;
}

// Létrehozza a válaszlehetőségek HTML elemét egy adott kérdéshez.
// A függvény létrehoz egy 'div' elemet a válaszlehetőségeknek,
// majd végigmegy az összes válaszlehetőségen, és mindegyikhez
// létrehoz egy címkét a createOptionLabel() függvénnyel.
function createOptionsElement(q) {
  const optsDiv = document.createElement('div');
  optsDiv.className = 'options';
  Object.entries(q.options).forEach(([key, val]) => {
    const label = createOptionLabel(q, key, val);
    optsDiv.appendChild(label);
  });
  return optsDiv;
}

// Létrehoz egy HTML címkét egyetlen válaszlehetőséghez.
// A függvény létrehoz egy 'label' elemet, amely tartalmaz egy rádiógombot
// és a válasz szövegét. A rádiógomb 'name' attribútuma biztosítja,
// hogy egy kérdéshez csak egy válasz legyen választható.
function createOptionLabel(q, key, val) {
  const optId = `q${q.id}_${key}`;
  const label = document.createElement('label');
  label.innerHTML = `
    <input type="radio" name="q${q.id}" value="${key}" id="${optId}">
    <span class="icon"></span> ${val}
  `;
  return label;
}

// Kiértékelés gomb eseménykezelője
// Az 'Eredmény kiértékelése' gombra kattintva lefutó függvény.
// Végigmegy az összes kérdésen, ellenőrzi a válaszokat,
// és frissíti a pontszámot és a gyakorlási javaslatok listáját.
document.getElementById('submit').onclick = function() {
  let correct = 0;
  let practiceList = [];

  questions.forEach(q => {
    const selected = document.querySelector(`input[name="q${q.id}"]:checked`);
    const userAnswer = selected ? selected.value : null;
    const wasCorrect = userAnswer === q.correct;

    if (wasCorrect) {
      correct++;
    } else if (q.practice && q.practice.length > 0) {
      practiceList.push(
        `${q.id}. kérdés: Gyakorlás javasolt fejezet(ek): ${q.practice.join(', ')}`
      );
    }

    updateQuestionStyle(q, userAnswer, wasCorrect);
  });

  displayResult(correct, practiceList);
};

// Frissíti a kérdés stílusát a felhasználó válasza alapján.
// A függvény eltávolítja a korábbi stílusokat, majd beállítja
// a helyes és helytelen válaszokhoz tartozó ikonokat és kiemeléseket.
function updateQuestionStyle(q, userAnswer, wasCorrect) {
  const qDiv = document.querySelector(`.question[data-qid="${q.id}"]`);
  const optsDiv = qDiv.querySelector('.options');
  const labels = optsDiv.querySelectorAll('label');

  // Előző ikonok és stílusok törlése
  labels.forEach(label => {
    label.classList.remove('option-correct', 'option-wrong', 'option-correct-answer');
    label.style.fontWeight = '';
    if (label.querySelector('.icon')) label.querySelector('.icon').textContent = '';
  });

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
}

// Megjeleníti a kvíz eredményét és a gyakorlási javaslatokat.
// A függvény kiírja a helyes válaszok számát és a teljes kérdésszámot,
// valamint a hibás válaszokhoz tartozó gyakorlási javaslatokat.
function displayResult(correct, practiceList) {
  // Eredmény és gyakorlási javaslatok megjelenítése
  let resultText = `Eredmény: ${correct} / ${questions.length}`;
  if (practiceList.length > 0) {
    resultText += '<br><br><b>Gyakorlási javaslatok hibás vagy üres válaszokhoz:</b><br>' + practiceList.join('<br>');
  }
  document.getElementById('result').innerHTML = resultText;
}