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
  aceEditor.on('change', () => { states[id].code = aceEditor.getValue(); showResults(); });
} else {
  const textarea = document.createElement('textarea');
  textarea.id = editor.id;
  textarea.setAttribute('aria-label', 'Cコードの入力欄');
  editor.replaceWith(textarea);
  setCode = (value) => { textarea.value = value; };
  textarea.oninput = () => { states[id].code = textarea.value; showResults(); };
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

function showResults() {
  const state = states[id];
  const box = get('results');
  box.replaceChildren();
  get('test').disabled = Boolean(state.pending);
  if (state.pending) add(box, 'p', 'テスト中…');
  if (state.warning) add(box, 'p', state.warning, 'notice');
  if (!state.report) return;
  if (state.code !== state.testedCode) add(box, 'p', 'コードが変更されています。もう一度テストしてください。', 'notice');
  const { compileError, error, results } = state.report;
  if (compileError || error) return add(box, 'pre', compileError ? 'コンパイル失敗\n' + compileError : error, 'fail');
  add(box, 'p', 'コンパイル成功');
  results.forEach((result, i) => {
    const card = add(box, 'article', '');
    add(card, 'strong', `テスト${i + 1}（入力 ${result.input}）${result.passed ? '成功' : '失敗'}`, result.passed ? 'pass' : 'fail');
    if (!result.passed) {
      add(card, 'p', '期待した出力：' + result.expected);
      add(card, 'pre', result.runtimeError || '実際の出力：' + (result.actual || '（空）'));
      if (!result.runtimeError) add(card, 'p', result.hint);
    }
  });
  if (results.every((result) => result.passed)) add(box, 'strong', 'すべてのテストに成功しました。', 'pass');
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
  showResults();
}

get('grade').onclick = () => {
  const state = states[id];
  state.unanswered = state.answers.flatMap((answer, i) => answer.trim() ? [] : [i + 1]);
  if (!state.unanswered.length) state.graded = state.answers.slice();
  showPractice();
};
get('test').onclick = async () => {
  const problemId = id;
  const state = states[problemId];
  const code = state.code;
  state.warning = code.trim() ? '' : 'コードを入力してください。';
  if (state.warning) return showResults();
  state.pending = true;
  state.testedCode = code;
  state.report = null;
  showResults();
  try {
    const response = await fetch('/test', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: problemId, code })
    });
    state.report = await response.json();
  } catch {
    state.report = { error: '採点サーバーに接続できませんでした。' };
  } finally {
    state.pending = false;
    showResults();
  }
};
selector.onchange = () => { id = selector.value; showProblem(); };
get('hint-toggle').onchange = showHint;
get('hint-topic').onchange = showHint;
showProblem();
