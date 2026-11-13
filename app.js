const translations = [
  {
    code: 'fr', brand: 'Recherche documentaire', languages: 'Langue', pilot: 'Pilote',
    title: ['Quel document', 'cherchez-vous ?'], subtitle: 'Décrivez ce dont vous vous souvenez. Un sujet, un nom ou une année peut suffire.',
    chat: 'Conversation', collection: 'Mémoires de l’UEH', reset: 'Nouvelle recherche',
    greeting: 'Bonjour ! Décrivez le document que vous cherchez, même si vous avez oublié son titre.',
    input: 'Décrivez le document recherché…', send: 'Rechercher',
    foot: 'École normale supérieure · Département de philosophie',
    found: 'Ce document correspond à votre description.',
    clarify: 'Pouvez-vous préciser le sujet, le nom de l’auteur ou l’année ?',
    none: 'Je n’ai pas trouvé de correspondance. Vous pouvez essayer avec un autre indice.',
    open: 'Ouvrir le PDF', page: 'p.', examples: ['Un mémoire sur Hobbes', 'L’écologie chez Jacques Roumain', 'La lutte pour l’existence chez Darwin']
  },
  {
    code: 'ht', brand: 'Rechèch dokiman', languages: 'Lang', pilot: 'Pilòt · Dokiman UEH',
    title: ['Ki dokiman', 'w ap chèche ?'], subtitle: 'Di sa w sonje. Yon sijè, yon non oswa yon ane ka sifi.',
    chat: 'Konvèsasyon', collection: 'Memwa UEH', reset: 'Nouvo rechèch',
    greeting: 'Bonjou ! Dekri dokiman w ap chèche a, menm si w bliye tit li.',
    input: 'Dekri dokiman w ap chèche a…', send: 'Chèche',
    foot: 'École normale supérieure · Depatman filozofi',
    found: 'Men yon dokiman ki koresponn ak sa w dekri a.',
    clarify: 'Èske w ka bay plis detay sou sijè a, non otè a oswa ane a ?',
    none: 'Mwen pa jwenn dokiman ki koresponn. Ou ka eseye ak yon lòt endis.',
    open: 'Louvri PDF la', page: 'p.', examples: ['Yon memwa sou Hobbes', 'Ekoloji kay Jacques Roumain', 'Lit pou egzistans kay Darwin']
  },
  {
    code: 'en', brand: 'Research discovery', languages: 'Language', pilot: 'Pilot · UEH collection',
    title: ['Which document', 'are you looking for?'], subtitle: 'Describe what you remember. A topic, a name, or a year may be enough.',
    chat: 'Conversation', collection: 'UEH theses', reset: 'New search',
    greeting: 'Hi! Describe the document you’re looking for, even if you’ve forgotten its title.',
    input: 'Describe the document you’re looking for…', send: 'Search',
    foot: 'École normale supérieure · Department of Philosophy',
    found: 'This document matches your description.',
    clarify: 'Could you tell me more about the topic, the author, or the year?',
    none: 'I couldn’t find a match. Try another detail if you have one.',
    open: 'Open PDF', page: 'p.', examples: ['A thesis on Hobbes', 'Ecology in Jacques Roumain', 'Darwin’s struggle for existence']
  }
];

const byId = (id) => document.getElementById(id);
const messages = byId('messages');
const query = byId('query');
let language = 0;
let history = [];
let previousQuery = '';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function pdfLink(doc, label, page) {
  const link = element('a', '', label);
  link.href = doc.id + '.pdf' + (page ? '#page=' + doc.page : '');
  link.target = '_blank';
  link.rel = 'noopener';
  return link;
}

function resultCard(doc, t) {
  const card = element('div', 'result');
  card.append(element('h3', '', doc.title[language]));
  card.append(element('p', '', [doc.author, doc.year].filter(Boolean).join(' · ')));
  card.append(element('p', 'description', doc.summary[language]));
  card.append(pdfLink(doc, t.open + ' · ' + t.page + ' ' + doc.page + ' ↗', true));
  return card;
}

function appendTurn(turn) {
  const t = translations[language];
  const block = element('div', 'turn' + (turn.kind === 'user' ? ' user' : ''));
  block.append(element('p', '', turn.kind === 'user' ? turn.text : t[turn.kind]));
  if (turn.kind === 'found') block.append(resultCard(turn.documents[0], t));
  if (turn.kind === 'clarify' && turn.documents.length > 1) {
    const options = element('div', 'options');
    turn.documents.forEach((doc) => {
      const button = element('button', 'example', doc.title[language]);
      button.addEventListener('click', () => submit(doc.title[language]));
      options.append(button);
    });
    block.append(options);
  }
  messages.append(block);
}

function renderChrome() {
  const t = translations[language];
  document.documentElement.lang = t.code;
  document.title = 'CRIA · ' + t.brand;
  const labels = { 'brand-label': t.brand, pilot: t.pilot, subtitle: t.subtitle, 'chat-title': t.chat,
    'collection-title': t.collection, reset: t.reset, footnote: t.foot, 'query-label': t.input };
  for (const [id, label] of Object.entries(labels)) byId(id).textContent = label;
  byId('languages').setAttribute('aria-label', t.languages);
  byId('title').replaceChildren(t.title[0], element('br'), ' ' + t.title[1]);
  query.placeholder = t.input;
  const arrow = element('span', '', '↗');
  arrow.setAttribute('aria-hidden', 'true');
  byId('send').replaceChildren(t.send + ' ', arrow);
  document.querySelectorAll('[data-language]').forEach((button) => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.language) === language));
  });
  const examples = t.examples.map((example) => {
    const button = element('button', 'example', example);
    button.addEventListener('click', () => submit(example));
    return button;
  });
  byId('examples').replaceChildren(...examples);
  byId('documents').replaceChildren(...globalThis.catalogue.map((doc) => {
    const li = element('li');
    const link = pdfLink(doc);
    const mark = element('span', '', '↗');
    mark.setAttribute('aria-hidden', 'true');
    link.append(element('span', 'document-title', doc.title[language]), mark);
    li.append(link);
    return li;
  }));
}

function renderHistory() {
  messages.replaceChildren();
  appendTurn({ kind: 'greeting' });
  history.forEach(appendTurn);
  messages.scrollTop = messages.scrollHeight;
  byId('reset').hidden = history.length === 0;
  byId('examples').hidden = history.length > 0;
}

function submit(value) {
  const text = value.trim();
  if (!text) return;
  const result = globalThis.findDocument(text, previousQuery);
  previousQuery = result.kind === 'clarify' ? (previousQuery + ' ' + text).trim() : '';
  const prompt = { kind: 'user', text };
  history.push(prompt, result);
  appendTurn(prompt);
  appendTurn(result);
  byId('reset').hidden = false;
  byId('examples').hidden = true;
  messages.scrollTop = messages.scrollHeight;
  query.value = '';
  query.focus({ preventScroll: true });
}

byId('query-form').addEventListener('submit', (event) => {
  event.preventDefault();
  submit(query.value);
});
byId('reset').addEventListener('click', () => {
  history = [];
  previousQuery = '';
  query.value = '';
  renderHistory();
  query.focus();
});
byId('languages').addEventListener('click', (event) => {
  const button = event.target.closest('[data-language]');
  if (!button) return;
  language = Number(button.dataset.language);
  renderChrome();
  renderHistory();
});

renderChrome();
renderHistory();
