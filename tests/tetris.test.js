// Tetris BD unit tests. Run: node tests/tetris.test.js (exit non-zero on failure).
const assert = require('assert');
const T = require('../js/tetris.js');
const I18N = require('../js/i18n.js');

let n = 0;
function check(name, fn) { n++; fn(); console.log('ok - ' + name); }

function fullRowGame(fillRows, seed) {
  const g = T.createGame({ seedQueue: seed });
  for (const y of fillRows) {
    for (let x = 0; x < T.COLS; x++) g.board[y][x] = 'Z';
  }
  return g;
}

// --- Shapes ---
check('7 pieces, each exactly 4 cells', () => {
  assert.deepStrictEqual(Object.keys(T.SHAPES).sort(), ['I', 'J', 'L', 'O', 'S', 'T', 'Z']);
  for (const k of Object.keys(T.SHAPES)) {
    let cells = 0;
    for (const row of T.SHAPES[k]) for (const c of row) cells += c;
    assert.strictEqual(cells, 4, k);
  }
});

check('rotateMatrix: T clockwise hand-computed', () => {
  const out = T.rotateMatrix(T.SHAPES.T);
  assert.deepStrictEqual(out, [[0, 1, 0], [0, 1, 1], [0, 1, 0]]);
});

check('4 rotations return the original matrix', () => {
  for (const k of Object.keys(T.SHAPES)) {
    let m = T.SHAPES[k];
    for (let i = 0; i < 4; i++) m = T.rotateMatrix(m);
    assert.deepStrictEqual(m, T.SHAPES[k], k);
  }
});

check('drawBag contains all 7 pieces exactly once', () => {
  for (let i = 0; i < 20; i++) {
    const bag = T.drawBag();
    assert.strictEqual(bag.length, 7);
    assert.deepStrictEqual(bag.slice().sort(), ['I', 'J', 'L', 'O', 'S', 'T', 'Z']);
  }
});

// --- Spawn / movement ---
check('spawn: I at x=3, O at x=4, both y=0', () => {
  const g1 = T.createGame({ seedQueue: ['I', 'T'] });
  assert.strictEqual(g1.current.type, 'I');
  assert.strictEqual(g1.current.x, 3);
  assert.strictEqual(g1.current.y, 0);
  const g2 = T.createGame({ seedQueue: ['O', 'T'] });
  assert.strictEqual(g2.current.x, 4);
});

check('left wall: I stops at x=0', () => {
  const g = T.createGame({ seedQueue: ['I', 'T'] });
  assert.strictEqual(T.tryMove(g, -1, 0), true);
  assert.strictEqual(T.tryMove(g, -1, 0), true);
  assert.strictEqual(T.tryMove(g, -1, 0), true);
  assert.strictEqual(g.current.x, 0);
  assert.strictEqual(T.tryMove(g, -1, 0), false);
  assert.strictEqual(g.current.x, 0);
});

check('floor: I falls to y=18 and stops (occupies row 19)', () => {
  const g = T.createGame({ seedQueue: ['I', 'T'] });
  let moved = 0;
  while (T.tryMove(g, 0, 1)) moved++;
  assert.strictEqual(moved, 18);
  assert.strictEqual(g.current.y, 18);
  assert.strictEqual(T.tryMove(g, 0, 1), false);
});

check('wall kick: vertical I at x=7 rotates with -1 kick to x=6', () => {
  const g = T.createGame({ seedQueue: ['I', 'T'] });
  g.current.matrix = T.rotateMatrix(T.SHAPES.I); // vertical, column 2 filled
  g.current.x = 7;
  g.current.y = 0;
  assert.strictEqual(T.tryRotate(g), true);
  assert.strictEqual(g.current.x, 6);
  // Clockwise rotation of the vertical I lands on row 2, not row 1.
  assert.deepStrictEqual(g.current.matrix, [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]]);
});

check('ghostY on empty board: I ghost at y=18', () => {
  const g = T.createGame({ seedQueue: ['I', 'T'] });
  assert.strictEqual(T.ghostY(g), 18);
});

// --- Locking, clears, scoring ---
check('lockPiece stamps cells into the board', () => {
  const g = T.createGame({ seedQueue: ['O', 'T'] });
  T.hardDrop(g); // O lands at bottom
  assert.strictEqual(g.board[19][4], 'O');
  assert.strictEqual(g.board[19][5], 'O');
  assert.strictEqual(g.board[18][4], 'O');
  assert.strictEqual(g.board[18][5], 'O');
});

check('single line clear: score 100, lines 1', () => {
  const g = fullRowGame([19], ['O', 'T']);
  const cleared = T.lockPiece(g);
  assert.strictEqual(cleared, 1);
  assert.strictEqual(g.lines, 1);
  assert.strictEqual(g.score, 100);
  assert.ok(g.board[19].every((c) => c === null));
});

check('tetris: 4 lines cleared, score 800', () => {
  const g = fullRowGame([16, 17, 18, 19], ['O', 'T']);
  const cleared = T.lockPiece(g);
  assert.strictEqual(cleared, 4);
  assert.strictEqual(g.lines, 4);
  assert.strictEqual(g.score, 800);
});

check('double at level 3: 300 x 3 = 900', () => {
  const g = fullRowGame([18, 19], ['O', 'T']);
  g.level = 3;
  T.lockPiece(g);
  assert.strictEqual(g.score, 900);
  assert.strictEqual(g.lines, 2);
});

check('level up: 9 lines + 1 clear -> level 2, score uses old level', () => {
  const g = fullRowGame([19], ['O', 'T']);
  g.lines = 9;
  g.level = 1;
  T.lockPiece(g);
  assert.strictEqual(g.lines, 10);
  assert.strictEqual(g.level, 2);
  assert.strictEqual(g.score, 100);
});

check('hardDrop: I drops 18 cells, +36 points', () => {
  const g = T.createGame({ seedQueue: ['I', 'T'] });
  const dist = T.hardDrop(g);
  assert.strictEqual(dist, 18);
  assert.strictEqual(g.score, 36);
  assert.strictEqual(g.board[19][3], 'I');
  assert.strictEqual(g.board[19][6], 'I');
});

check('softDrop: +1 point per cell', () => {
  const g = T.createGame({ seedQueue: ['I', 'T'] });
  assert.strictEqual(T.softDrop(g), true);
  assert.strictEqual(g.score, 1);
  assert.strictEqual(g.current.y, 1);
});

check('stepDown locks when blocked and spawns the next piece', () => {
  const g = T.createGame({ seedQueue: ['I', 'T', 'S'] });
  let steps = 0;
  while (T.stepDown(g) && steps < 40) steps++;
  assert.strictEqual(g.current.type, 'T');
  assert.strictEqual(g.board[19][3], 'I');
});

// --- Hold ---
check('hold: first hold swaps in next piece, second hold refused', () => {
  const g = T.createGame({ seedQueue: ['T', 'S', 'Z'] });
  assert.strictEqual(T.holdPiece(g), true);
  assert.strictEqual(g.hold, 'T');
  assert.strictEqual(g.current.type, 'S');
  assert.strictEqual(T.holdPiece(g), false);
  assert.strictEqual(g.current.type, 'S');
});

check('hold re-arms after lock and swaps back', () => {
  const g = T.createGame({ seedQueue: ['T', 'S', 'Z'] });
  T.holdPiece(g); // hold T, current S
  T.hardDrop(g); // lock S, spawn Z
  assert.strictEqual(T.holdPiece(g), true);
  assert.strictEqual(g.hold, 'Z');
  assert.strictEqual(g.current.type, 'T');
});

// --- Game over ---
check('game over: spawn collides after lock (hand-built near-full top)', () => {
  const g = T.createGame({ seedQueue: ['I', 'T', 'S'] });
  // Row 0: full except col 4. Row 1: full except col 3. Neither row clears.
  for (let x = 0; x < T.COLS; x++) {
    if (x !== 4) g.board[0][x] = 'Z';
    if (x !== 3) g.board[1][x] = 'Z';
  }
  T.hardDrop(g); // locks I at the bottom, spawns T -> collides at (4,1)
  assert.strictEqual(g.gameOver, true);
});

// --- Speed curve ---
check('dropIntervalMs: 1000 at level 1, 40 soft, decreasing with level', () => {
  assert.strictEqual(T.dropIntervalMs(1, false), 1000);
  assert.strictEqual(T.dropIntervalMs(5, true), 40);
  assert.ok(T.dropIntervalMs(10, false) < T.dropIntervalMs(1, false));
  assert.ok(T.dropIntervalMs(10, false) >= 60);
});

// --- i18n ---
check('EN and BN string tables have identical keys', () => {
  assert.deepStrictEqual(
    Object.keys(I18N.STR.en).sort(), Object.keys(I18N.STR.bn).sort());
  for (const k of Object.keys(I18N.STR.en)) {
    assert.ok(I18N.STR.en[k].length > 0, 'en.' + k);
    assert.ok(I18N.STR.bn[k].length > 0, 'bn.' + k);
  }
});

check('Bengali digits: 2026 -> \u09e8\u09e6\u09e8\u09ec; fmtNum EN groups, BN converts', () => {
  assert.strictEqual(I18N.toBnDigits('2026'), '\u09e8\u09e6\u09e8\u09ec');
  assert.strictEqual(I18N.fmtNum(12400, 'en'), '12,400');
  assert.strictEqual(I18N.fmtNum(12400, 'bn'), '\u09e7\u09e8\u09ea\u09e6\u09e6');
});

console.log('ALL ' + n + ' CHECKS PASSED');
