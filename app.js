import { renderHints } from './hints.js';
import { showPractice, practiceRows, practiceTemplate } from './practice.js';
import { problems } from './problems.js';

const get = (id) => document.getElementById(id);
const selector = get('problem');
const states = Object.fromEntries(Object.entries(problems).map(([id, problem]) => {
  selector.add(new Option(problem.title, id));
  return [id, { code: '', answers: practiceRows(id, problem).map(() => '') }];
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

function showProblem() {
  const problem = problems[id];
  get('description').textContent = problem.description;
  get('template').textContent = practiceTemplate(id, problem);
  get('instructions').textContent = problem.signature + ' の定義だけを書いてください。';
  renderHints(get('hint-panel'), id, problem, states[id], add);

  const fields = get('blanks');
  fields.replaceChildren();
  states[id].answers.forEach((answer, i) => {
    const label = add(fields, 'label', `${i + 1}番目の回答`);
    const input = add(label, 'input', '');
    input.value = answer;
    input.oninput = () => { states[id].answers[i] = input.value; showPractice(id, states[id], problems[id], get, add); };
    add(label, 'small', '');
  });
  setCode(states[id].code);
  showPractice(id, states[id], problems[id], get, add);
  
}

get('grade').onclick = () => {
  const state = states[id];
  state.unanswered = state.answers.flatMap((answer, i) => answer.trim() ? [] : [i + 1]);
  if (!state.unanswered.length) state.graded = state.answers.slice();
  showPractice(id, states[id], problems[id], get, add);
};
selector.onchange = () => { id = selector.value; showProblem(); };
showProblem();
