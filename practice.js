import { practiceContent } from './practice-content.js';

export function practiceRows(id, problem) {
  return practiceContent[id]?.[1] ?? problem.blanks.map((answers) => [answers, '正解です。', '空欄に入る処理を確認しましょう。']);
}

export function practiceTemplate(id, problem) {
  return practiceContent[id]?.[0] ?? problem.template;
}

export function showPractice(id, state, problem, get, add) {

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
  practiceRows(id, problem).forEach(([options, good, bad], i) => {
    const normalize = (value) => options[0] === 'int n' ? value.trim().replace(/\s+/g, ' ') : value.replace(/\s+/g, '');
    const correct = options.includes(normalize(state.graded[i]));
    if (correct) count += 1;
    fields[i].textContent = correct ? good : bad;
    fields[i].className = correct ? 'pass' : 'fail';
  });
  add(box, 'p', count === fields.length ? '全問正解です！' : `${fields.length}問中${count}問正解です。`);
}

