import { hintContent } from './hint-content.js';

function select(parent, add, label, options, selected) {
  const field = add(parent, 'label', label + ' ');
  const input = add(field, 'select', '');
  options.forEach((option) => input.add(new Option(option, option)));
  input.value = selected ?? options[0];
  return input;
}

export function renderHints(panel, id, problem, state, add) {
  panel.replaceChildren();
  state.hints ??= {};
  const content = hintContent[id];
  if (!content) {
    contentBlocks(panel, [['toggle', '考え方のヒントを見る', [['text', problem.hint]]]], state.hints, add, 'bubble');
    return;
  }
  const [labels, start, introduction, topicLabel, topics] = content;
  const mode = select(panel, add, 'どこで困っていますか？', labels, state.hintMode);
  const body = add(panel, 'div', '');
  function showMode() {
    body.replaceChildren();
    if (mode.value === labels[0]) {
      contentBlocks(body, start, state.hints, add, 'start');
      return;
    }
    contentBlocks(body, introduction, state.hints, add, 'intro');
    const topic = select(body, add, topicLabel, Object.keys(topics), state.hintTopic);
    const exercises = add(body, 'div', '');
    function showTopic() {
      exercises.replaceChildren();
      contentBlocks(exercises, topics[topic.value], state.hints, add, topic.value);
    }
    topic.onchange = () => { state.hintTopic = topic.value; showTopic(); };
    showTopic();
  }
  mode.onchange = () => { state.hintMode = mode.value; showMode(); };
  showMode();
}

function contentBlocks(parent, blocks, saved, add, prefix) {
  blocks.forEach(([kind, ...args], index) => {
    const key = prefix + ':' + index;
    if (kind === 'text') {
      const [text] = args;
      if (text.startsWith('**') && text.endsWith('**')) {
        add(add(parent, 'p', ''), 'strong', text.slice(2, -2));
      } else {
        add(parent, 'p', text);
      }
    } else if (kind === 'toggle') {
      const [label, children] = args;
      const row = add(parent, 'label', '');
      const checkbox = add(row, 'input', '');
      checkbox.type = 'checkbox';
      checkbox.checked = Boolean(saved[key]);
      row.append(' ' + label);
      const explanation = add(parent, 'div', '', 'hint-explanation');
      explanation.hidden = !checkbox.checked;
      checkbox.onchange = () => {
        saved[key] = checkbox.checked;
        explanation.hidden = !checkbox.checked;
      };
      contentBlocks(explanation, children, saved, add, key);
    } else {
      const [question, template, prompt, answers, good, bad, ignoreSpaces] = args;
      add(parent, 'p', question);
      add(parent, 'pre', template);
      const input = add(add(parent, 'label', prompt + ' '), 'input', '');
      const feedback = add(parent, 'p', '');
      feedback.setAttribute('aria-live', 'polite');
      input.value = saved[key] ?? '';
      function showFeedback() {
        const answer = ignoreSpaces ? input.value.replaceAll(' ', '') : input.value.trim().replace(/\s+/g, ' ');
        const correct = answers.includes(answer);
        feedback.textContent = answer.trim() ? (correct ? good : bad) : '';
        feedback.className = correct ? 'pass' : 'fail';
      }
      input.oninput = () => { saved[key] = input.value; showFeedback(); };
      showFeedback();
    }
  });
}
