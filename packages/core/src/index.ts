/*
 * Frecency
 *
 * Inspired by: https://wiki.mozilla.org/User:Jesse/NewFrecency
 */

// natural log2
const ln2 = 0.69314718055994530942; // Math.log1p(2)

interface FrecentScore {
  // Half-life used to compute the score; should be duration in milliseconds.
  // The half-life is retained so that we can update the value consistently
  // over subsequent visits.
  hl: number;
  // frecency score
  score: number;
}

export const decayRate = (hl: number): number => {
  return ln2 / hl;
};

export const decayFor = (t: number, hl: number): number => {
  return t * decayRate(hl);
};

export const init = (now: number, hl: number): FrecentScore => {
  return {
    hl,
    score: decayFor(now, hl),
  };
};

export const visit = (now: number, prev: FrecentScore): FrecentScore => {
  const decay = decayFor(now, prev.hl);

  return {
    ...prev,
    score: Math.log1p(Math.exp(prev.score - decay)) + decay,
  };
};
