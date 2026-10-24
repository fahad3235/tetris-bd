// Tetris BD - pure game engine (no DOM). Shared by the browser app and the
// Node unit tests. UMD-style export: window.Tetris in the browser,
// module.exports under Node.
(function (global) {
  'use strict';

  var COLS = 10;
  var ROWS = 20;

  // Rotation states are clockwise matrices. Row 0 of the I piece is empty so
  // the piece visually enters from the top row.
  var SHAPES = {
    I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]]
  };

  var COLORS = {
    I: '#00c8e0', O: '#e6b800', T: '#a855f7',
    S: '#22c55e', Z: '#ef4444', J: '#3b82f6', L: '#f97316'
  };

  var LINE_POINTS = [0, 100, 300, 500, 800];
  var PIECES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  // Simple wall kicks: no kick, then sideways, then up. Enough for an
  // honest arcade MVP (not full SRS).
  var KICKS = [[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1]];

  function emptyBoard() {
    var board = [];
    for (var y = 0; y < ROWS; y++) {
      var row = [];
      for (var x = 0; x < COLS; x++) row.push(null);
      board.push(row);
    }
    return board;
  }

  function cloneMatrix(m) {
    return m.map(function (row) { return row.slice(); });
  }

  function rotateMatrix(m) {
    // Clockwise: new[i][j] = m[n-1-j][i]
    var n = m.length;
    var out = [];
    for (var i = 0; i < n; i++) {
      var row = [];
      for (var j = 0; j < n; j++) row.push(m[n - 1 - j][i]);
      out.push(row);
    }
    return out;
  }

  function collides(board, matrix, px, py) {
    for (var y = 0; y < matrix.length; y++) {
      for (var x = 0; x < matrix[y].length; x++) {
        if (!matrix[y][x]) continue;
        var nx = px + x;
        var ny = py + y;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && board[ny][nx]) return true;
      }
    }
    return false;
  }

  function drawBag(randomFn) {
    var bag = PIECES.slice();
    var rnd = randomFn || Math.random;
    for (var i = bag.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var tmp = bag[i]; bag[i] = bag[j]; bag[j] = tmp;
    }
    return bag;
  }

  function spawnPiece(state) {
    if (state.queue.length < 7) {
      state.queue = state.queue.concat(drawBag(state.randomFn));
    }
    var type = state.queue.shift();
    var matrix = cloneMatrix(SHAPES[type]);
    var x = type === 'O' ? 4 : 3;
    state.current = { type: type, matrix: matrix, x: x, y: 0 };
    if (collides(state.board, matrix, x, 0)) state.gameOver = true;
  }

  function createGame(options) {
    var opts = options || {};
    var state = {
      board: emptyBoard(),
      queue: [],
      current: null,
      hold: null,
      canHold: true,
      score: 0,
      lines: 0,
      level: 1,
      gameOver: false,
      randomFn: opts.randomFn || null
    };
    if (opts.seedQueue) state.queue = opts.seedQueue.slice();
    spawnPiece(state);
    return state;
  }

  function tryMove(state, dx, dy) {
    if (!state.current || state.gameOver) return false;
    var c = state.current;
    if (collides(state.board, c.matrix, c.x + dx, c.y + dy)) return false;
    c.x += dx; c.y += dy;
    return true;
  }

  function tryRotate(state) {
    if (!state.current || state.gameOver) return false;
    var c = state.current;
    var rotated = rotateMatrix(c.matrix);
    for (var k = 0; k < KICKS.length; k++) {
      var kx = KICKS[k][0];
      var ky = KICKS[k][1];
      if (!collides(state.board, rotated, c.x + kx, c.y + ky)) {
        c.matrix = rotated; c.x += kx; c.y += ky;
        return true;
      }
    }
    return false;
  }

  function clearLines(state) {
    var kept = [];
    var cleared = 0;
    for (var y = 0; y < ROWS; y++) {
      var full = true;
      for (var x = 0; x < COLS; x++) {
        if (!state.board[y][x]) { full = false; break; }
      }
      if (full) cleared++;
      else kept.push(state.board[y]);
    }
    while (kept.length < ROWS) {
      var row = [];
      for (var x = 0; x < COLS; x++) row.push(null);
      kept.unshift(row);
    }
    state.board = kept;
    return cleared;
  }

  function lockPiece(state) {
    var c = state.current;
    if (!c) return 0;
    for (var y = 0; y < c.matrix.length; y++) {
      for (var x = 0; x < c.matrix[y].length; x++) {
        if (!c.matrix[y][x]) continue;
        var ny = c.y + y;
        var nx = c.x + x;
        if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
          state.board[ny][nx] = c.type;
        }
      }
    }
    var cleared = clearLines(state);
    state.score += LINE_POINTS[cleared] * state.level;
    state.lines += cleared;
    state.level = Math.floor(state.lines / 10) + 1;
    state.canHold = true;
    state.current = null;
    if (!state.gameOver) spawnPiece(state);
    return cleared;
  }

  // Returns true if the piece moved down; false if it locked.
  function stepDown(state) {
    if (!state.current || state.gameOver) return false;
    if (tryMove(state, 0, 1)) return true;
    lockPiece(state);
    return false;
  }

  function softDrop(state) {
    if (!state.current || state.gameOver) return false;
    if (tryMove(state, 0, 1)) { state.score += 1; return true; }
    lockPiece(state);
    return false;
  }

  function hardDrop(state) {
    if (!state.current || state.gameOver) return 0;
    var dist = 0;
    while (tryMove(state, 0, 1)) dist++;
    state.score += dist * 2;
    lockPiece(state);
    return dist;
  }

  function holdPiece(state) {
    if (!state.current || state.gameOver || !state.canHold) return false;
    var cur = state.current.type;
    if (!state.hold) {
      state.hold = cur;
      state.current = null;
      state.canHold = false;
      spawnPiece(state);
    } else {
      var tmp = state.hold;
      state.hold = cur;
      var matrix = cloneMatrix(SHAPES[tmp]);
      var x = tmp === 'O' ? 4 : 3;
      state.current = { type: tmp, matrix: matrix, x: x, y: 0 };
      state.canHold = false;
      if (collides(state.board, matrix, x, 0)) state.gameOver = true;
    }
    return true;
  }

  function ghostY(state) {
    if (!state.current) return 0;
    var c = state.current;
    var y = c.y;
    while (!collides(state.board, c.matrix, c.x, y + 1)) y++;
    return y;
  }

  function dropIntervalMs(level, soft) {
    if (soft) return 40;
    return Math.max(Math.round(1000 * Math.pow(0.82, level - 1)), 60);
  }

  var api = {
    COLS: COLS, ROWS: ROWS, SHAPES: SHAPES, COLORS: COLORS,
    LINE_POINTS: LINE_POINTS, PIECES: PIECES,
    emptyBoard: emptyBoard, cloneMatrix: cloneMatrix,
    rotateMatrix: rotateMatrix, collides: collides, drawBag: drawBag,
    createGame: createGame, tryMove: tryMove, tryRotate: tryRotate,
    clearLines: clearLines, lockPiece: lockPiece, stepDown: stepDown,
    softDrop: softDrop, hardDrop: hardDrop, holdPiece: holdPiece,
    ghostY: ghostY, dropIntervalMs: dropIntervalMs
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.Tetris = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
