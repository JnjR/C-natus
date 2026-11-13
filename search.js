const words = (value) => value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').match(/[a-z0-9]+/g) ?? [];
const normalized = (value) => ' ' + words(value).join(' ') + ' ';
const stopWords = new Set(words(
  'avec apres aussi avant bien car cela cette comme dans dont elle encore entre etre fait leur leurs mais meme nous pour peut plus quel quelle quels quelles sans selon sont sous suis tout tous tres vous '
  + 'about after also another could does find from have into looking more paper please research show some study than that their them there these they this through want were what when where which will with would '
  + 'ap chache dokiman jwenn konnen la lan ladan mwen nan pale rapo rechèch sa sou tankou yon yo '
  + 'a au aux ce ces de des du en est et il je la le les lui ne on ou par pas qui que un une y '
  + 'and any are but can for had has how not of on or the to was who'
));

function getMatches(query) {
  const text = normalized(query);
  const includes = (phrase) => text.includes(normalized(phrase));
  const year = text.match(/\b(?:19|20)\d{2}\b/)?.[0];
  const terms = [...new Set(words(query).filter((term) => term.length > 2 && !stopWords.has(term) && !/^\d+$/.test(term)))];
  const index = globalThis.corpusIndex;
  return globalThis.catalogue.flatMap((doc) => {
    if (year && String(doc.year) !== year) return [];
    const title = doc.title.some(includes);
    const author = doc.author.split(' ').some(includes);
    const concepts = doc.concepts.filter((group) => group.split('|').some(includes)).length;
    const pages = index[doc.id];
    const pageHits = pages.map(([page, tokens]) => {
      const weight = terms.reduce((sum, term) => sum + (Object.hasOwn(tokens, term) ? Math.log1p(tokens[term]) : 0), 0);
      return { page, weight };
    });
    const bestPage = pageHits.reduce((best, next) => next.weight > best.weight ? next : best, { page: doc.page, weight: 0 });
    const foundTerms = terms.filter((term) => pages.some(([, tokens]) => Object.hasOwn(tokens, term)));
    if (!(title || author || concepts || foundTerms.length)) return [];
    const distinctive = foundTerms.filter((term) => Object.values(index).filter(
      (candidate) => candidate.some(([, tokens]) => Object.hasOwn(tokens, term))).length === 1).length;
    const score = Number(title) * 20 + Number(author) * 13 + concepts * 6
      + foundTerms.length + distinctive * 3 + (year ? 4 : 0);
    const matchedPage = title || author || bestPage.weight === 0 ? doc.page : bestPage.page;
    return [{ doc, score, page: matchedPage }];
  }).sort((a, b) => b.score - a.score);
}

globalThis.findDocument = function findDocument(query, previousQuery = '') {
  const ranked = getMatches(previousQuery ? previousQuery + ' ' + query : query);
  const [first, second] = ranked;
  if (!first || first.score < 5) return { kind: 'none', documents: [] };
  if (second && first.score - second.score < 3) {
    return { kind: 'clarify', documents: ranked.filter(({ score }) => score >= first.score - 3).map(({ doc }) => doc) };
  }
  return { kind: 'found', documents: [{ ...first.doc, page: first.page }] };
};
