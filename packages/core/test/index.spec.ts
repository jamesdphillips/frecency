import * as core from '../src/index';

const sec = 60 * 1000;
const hour = 60 * sec;
const day = 24 * hour;
const week = 7 * day;
const month = 24 * day;

const times = (n: number) => {
  let xs: Array<number> = [];
  for (let i = 0; i < n; i ++) {
    xs = [...xs, n + 1];
  }
  return xs;
};

describe('decayRate', () => {
  it('should output valid rates', () => {
    expect(core.decayRate(hour)).toEqual(1.925408834888737e-7);
    expect(core.decayRate(day)).toEqual(8.022536812036404e-9);
    expect(core.decayRate(week)).toEqual(1.146076687433772e-9);
    expect(core.decayRate(month)).toEqual(3.342723671681835e-10);
  });
});

describe('decayFor', () => {
  it('should return decay for given date', () => {
    expect(core.decayFor(0, hour)).toEqual(0);
    expect(core.decayFor(0, week)).toEqual(0);
    expect(core.decayFor(0 + week, hour)).toEqual(116.44872633407081);
    expect(core.decayFor(0 + week, week)).toEqual(0.6931471805599453);
    expect(core.decayFor(0 + month, week)).toEqual(2.3765046190626697);
  });
});

describe('init', () => {
  it('should return initial score', () => {
    expect(core.init(0, hour)).toEqual({ hl: hour, score: 0 });
    expect(core.init(0, week)).toEqual({ hl: week, score: 0 });
    expect(core.init(0 + week, hour)).toEqual({ hl: hour, score: 116.44872633407081 });
    expect(core.init(0 + week, week)).toEqual({ hl: week, score: 0.6931471805599453 });
    expect(core.init(0 + month, week)).toEqual({ hl: week, score: 2.3765046190626697 });
  });
});

describe('visit', () => {
  it('should update the given score', () => {
    expect(core.visit(day, core.init(0, week))).toEqual({ hl: week, score: 0.7438828384922449 });
    expect(core.visit(5 * day, core.init(0, week))).toEqual({ hl: week, score: 0.9710329424726063 });
    expect(core.visit(7 * day, core.init(5 * day, week))).toEqual({ hl: week, score: 1.2921679262172345 });
  });

  it('should increment', () => {
    const init = core.init(0, week);

    const nine = times(9).reduce((acc, n) => core.visit(n * day, acc), init);
    const four = times(4).reduce((acc, n) => core.visit(n * day, acc), init);

    const two = times(2).reduce((acc, n) => core.visit(n * day, acc), init);
    const ten = times(10).reduce((acc, n) => core.visit(n * day, acc), init);

    expect(nine.score).toBeGreaterThan(init.score);
    expect(four.score).toBeGreaterThan(init.score);
    expect(nine.score).toBeGreaterThan(four.score);
    expect(core.init(14 * day, week).score).toBeGreaterThan(two.score);
    expect(core.init(14 * day, week).score).toBeLessThan(four.score);
    expect(core.init(14 * day, week).score).toBeLessThan(nine.score);
    expect(core.init(30 * day, week).score).toBeLessThan(ten.score);
  });
});
