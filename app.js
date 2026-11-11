import { problems } from './problems.js';

const get = (id) => document.getElementById(id);
const selector = get('problem');
const states = Object.fromEntries(Object.entries(problems).map(([id, problem]) => {
  selector.add(new Option(problem.title, id));
  return [id, { code: '', answers: problem.blanks.map(() => '') }];
}));
let id = selector.value;
let editor = get('editor');
let setCode;
if (window.ace) {
  const aceEditor = window.ace.edit(editor, { mode: 'ace/mode/c_cpp', theme: 'ace/theme/monokai' });
  aceEditor.textInput.getElement().setAttribute('aria-label', 'Cコードの入力欄');
  setCode = (value) => aceEditor.setValue(value, -1);
  aceEditor.on('change', () => { states[id].code = aceEditor.getValue();  });
} else {
  const textarea = document.createElement('textarea');
  textarea.id = editor.id;
  textarea.setAttribute('aria-label', 'Cコードの入力欄');
  editor.replaceWith(textarea);
  setCode = (value) => { textarea.value = value; };
  textarea.oninput = () => { states[id].code = textarea.value;  };
}

function add(parent, tag, content, className = '') {
  const element = document.createElement(tag);
  element.textContent = content;
  element.className = className;
  parent.append(element);
  return element;
}

function showHint() {
  const problem = problems[id];
  get('hint').hidden = !get('hint-toggle').checked;
  get('hint').textContent = get('hint-topic').value === 'start'
    ? problem.hint : '関数の形は ' + problem.signature + ' です。';
}

function showPractice() {
  const state = states[id];
  const box = get('practice');
  box.replaceChildren();
  const fields = get('blanks').querySelectorAll('small');
  fields.forEach((field) => { field.textContent = ''; field.className = ''; });
  if (state.unanswered?.length) add(box, 'p', '未回答の問題：' + state.unanswered.join('、') + '番', 'notice');
  if (!state.graded) return;
  if (state.answers.some((answer, i) => answer !== state.graded[i])) {
    add(box, 'p', '回答が変更されています。以下は前回の採点結果です。', 'notice');
  }
  let count = 0;
  problems[id].blanks.forEach((options, i) => {
    const normalize = (value) => options[0] === 'int n' ? value.trim().replace(/\s+/g, ' ') : value.replace(/\s+/g, '');
    const correct = options.includes(normalize(state.graded[i]));
    if (correct) count += 1;
    fields[i].textContent = correct ? '正解' : '不正解';
    fields[i].className = correct ? 'pass' : 'fail';
  });
  add(box, 'p', count === fields.length ? '全問正解です！' : `${fields.length}問中${count}問正解です。`);
}

function showProblem() {
  const problem = problems[id];
  get('description').textContent = problem.description;
  get('template').textContent = problem.template;
  get('instructions').textContent = problem.signature + ' の定義だけを書いてください。';
  get('hint-toggle').checked = false;
  showHint();
  const fields = get('blanks');
  fields.replaceChildren();
  states[id].answers.forEach((answer, i) => {
    const label = add(fields, 'label', `${i + 1}番目の回答`);
    const input = add(label, 'input', '');
    input.value = answer;
    input.oninput = () => { states[id].answers[i] = input.value; showPractice(); };
    add(label, 'small', '');
  });
  setCode(states[id].code);
  showPractice();
  
}

get('grade').onclick = () => {
  const state = states[id];
  state.unanswered = state.answers.flatMap((answer, i) => answer.trim() ? [] : [i + 1]);
  if (!state.unanswered.length) state.graded = state.answers.slice();
  showPractice();
};
selector.onchange = () => { id = selector.value; showProblem(); };
get('hint-toggle').onchange = showHint;
get('hint-topic').onchange = showHint;
showProblem();
