// Tetris BD \u2014 browser app: canvas rendering, input, game loop, language.
// Depends on window.Tetris (js/tetris.js) and window.TetrisI18n (js/i18n.js).
(function () {
  'use strict';

  var T = window.Tetris;
  var I18N = window.TetrisI18n;
  var CELL = 30;

  var game = null;
  var playing = false;
  var paused = false;
  var soft = false;
  var lang = 'en';
  var best = 0;
  var lastTs = 0;
  var acc = 0;
  var rafId = 0;

  function $(id) { return document.getElementById(id); }

  function loadPersisted() {
    try {
      var b = window.localStorage.getItem('tetris-bd-best');
      if (b !== null && !isNaN(Number(b))) best = Number(b);
      var l = window.localStorage.getItem('tetris-bd-lang');
      if (l === 'en' || l === 'bn') lang = l;
    } catch (e) { /* private mode: play without persistence */ }
  }

  function saveBest() {
    try { window.localStorage.setItem('tetris-bd-best', String(best)); } catch (e) {}
  }

  function saveLang() {
    try { window.localStorage.setItem('tetris-bd-lang', lang); } catch (e) {}
  }

  function t(key) {
    return I18N.STR[lang][key];
  }

  function applyLang() {
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      els[i].textContent = t(key);
    }
    $('langBtn').textContent = lang === 'en' ? '\u09ac\u09be\u0982\u09b2\u09be' : 'English';
    renderStats();
    drawAll();
  }

  function renderStats() {
    $('statScore').textContent = I18N.fmtNum(game ? game.score : 0, lang);
    $('statLines').textContent = I18N.fmtNum(game ? game.lines : 0, lang);
    $('statLevel').textContent = I18N.fmtNum(game ? game.level : 1, lang);
    $('statBest').textContent = I18N.fmtNum(best, lang);
  }

  function drawCell(ctx, x, y, color, ghost) {
    var px = x * CELL;
    var py = y * CELL;
    ctx.beginPath();
    ctx.roundRect(px + 1, py + 1, CELL - 2, CELL - 2, 5);
    if (ghost) {
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.fillRect(px + 5, py + 5, CELL - 10, 5);
    }
  }

  function drawBoard() {
    var canvas = $('board');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (var gx = 1; gx < T.COLS; gx++) {
      ctx.beginPath(); ctx.moveTo(gx * CELL, 0); ctx.lineTo(gx * CELL, canvas.height); ctx.stroke();
    }
    for (var gy = 1; gy < T.ROWS; gy++) {
      ctx.beginPath(); ctx.moveTo(0, gy * CELL); ctx.lineTo(canvas.width, gy * CELL); ctx.stroke();
    }
    if (!game) return;
    for (var y = 0; y < T.ROWS; y++) {
      for (var x = 0; x < T.COLS; x++) {
        var cell = game.board[y][x];
        if (cell) drawCell(ctx, x, y, T.COLORS[cell], false);
      }
    }
    var c = game.current;
    if (c) {
      var gy2 = T.ghostY(game);
      if (gy2 !== c.y) {
        for (var yy = 0; yy < c.matrix.length; yy++) {
          for (var xx = 0; xx < c.matrix[yy].length; xx++) {
            if (c.matrix[yy][xx]) drawCell(ctx, c.x + xx, gy2 + yy, T.COLORS[c.type], true);
          }
        }
      }
      for (var y2 = 0; y2 < c.matrix.length; y2++) {
        for (var x2 = 0; x2 < c.matrix[y2].length; x2++) {
          if (c.matrix[y2][x2]) drawCell(ctx, c.x + x2, c.y + y2, T.COLORS[c.type], false);
        }
      }
    }
  }

  function drawPreview(canvas, type) {
    var ctx = canvas.getContext('2d');
    var S = 16;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!type) {
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t('empty'), canvas.width / 2, canvas.height / 2 + 4);
      return;
    }
    var m = T.SHAPES[type];
    var w = m[0].length;
    var h = m.length;
    var ox = Math.round((canvas.width - w * S) / 2);
    var oy = Math.round((canvas.height - h * S) / 2);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        if (!m[y][x]) continue;
        ctx.beginPath();
        ctx.roundRect(ox + x * S + 1, oy + y * S + 1, S - 2, S - 2, 4);
        ctx.fillStyle = T.COLORS[type];
        ctx.fill();
      }
    }
  }

  function drawAll() {
    drawBoard();
    drawPreview($('holdCanvas'), game ? game.hold : null);
    var next = game ? game.queue.slice(0, 3) : [];
    drawPreview($('next0'), next[0] || null);
    drawPreview($('next1'), next[1] || null);
    drawPreview($('next2'), next[2] || null);
  }

  function showOverlay(titleKey, msg, btnKey) {
    $('overlayTitle').textContent = titleKey ? t(titleKey) : '';
    $('overlayMsg').textContent = msg || '';
    $('overlayBtn').textContent = btnKey ? t(btnKey) : '';
    $('overlay').classList.remove('hidden');
  }

  function hideOverlay() {
    $('overlay').classList.add('hidden');
  }

  function syncButtons() {
    $('pauseBtn').textContent = paused ? t('resume') : t('pause');
    $('pauseBtn').disabled = !playing;
  }

  function endGame() {
    playing = false;
    cancelAnimationFrame(rafId);
    var isBest = game && game.score > best;
    if (isBest) { best = game.score; saveBest(); }
    renderStats();
    drawAll();
    var msg = t('finalScore') + ': ' + I18N.fmtNum(game.score, lang);
    if (isBest) msg += ' \u2014 ' + t('newBest');
    showOverlay('gameOver', t('gameOverMsg') + ' ' + msg, 'restart');
    syncButtons();
  }

  function newGame() {
    game = T.createGame();
    playing = true;
    paused = false;
    soft = false;
    acc = 0;
    lastTs = performance.now();
    hideOverlay();
    renderStats();
    drawAll();
    syncButtons();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  function togglePause() {
    if (!playing) return;
    paused = !paused;
    if (paused) {
      showOverlay('paused', '', 'resume');
    } else {
      hideOverlay();
      lastTs = performance.now();
    }
    syncButtons();
  }

  function loop(ts) {
    if (!playing) return;
    if (!paused) {
      var dt = ts - lastTs;
      lastTs = ts;
      if (dt > 250) dt = 250;
      acc += dt;
      var interval = T.dropIntervalMs(game.level, soft);
      while (acc >= interval) {
        acc -= interval;
        if (!T.stepDown(game)) {
          if (game.gameOver) { endGame(); return; }
        }
        interval = T.dropIntervalMs(game.level, soft);
      }
      if (game.gameOver) { endGame(); return; }
      renderStats();
      drawAll();
    } else {
      lastTs = ts;
    }
    rafId = requestAnimationFrame(loop);
  }

  function act(name) {
    if (name === 'start') {
      if (playing && paused) { togglePause(); return; }
      newGame();
      return;
    }
    if (!playing || paused || !game || game.gameOver) return;
    if (name === 'left') T.tryMove(game, -1, 0);
    else if (name === 'right') T.tryMove(game, 1, 0);
    else if (name === 'down') { T.softDrop(game); }
    else if (name === 'rotate') T.tryRotate(game);
    else if (name === 'drop') {
      T.hardDrop(game);
      if (game.gameOver) { endGame(); return; }
    }
    else if (name === 'hold') T.holdPiece(game);
    else if (name === 'pause') { togglePause(); return; }
    renderStats();
    drawAll();
  }

  function onKey(e) {
    if (e.repeat) {
      if (e.key === 'ArrowDown') soft = true;
      return;
    }
    var k = e.key;
    if (k === 'ArrowLeft') { e.preventDefault(); act('left'); }
    else if (k === 'ArrowRight') { e.preventDefault(); act('right'); }
    else if (k === 'ArrowDown') { e.preventDefault(); soft = true; act('down'); }
    else if (k === 'ArrowUp' || k === 'x' || k === 'X') { e.preventDefault(); act('rotate'); }
    else if (k === ' ') { e.preventDefault(); act('drop'); }
    else if (k === 'c' || k === 'C') { act('hold'); }
    else if (k === 'p' || k === 'P') { act('pause'); }
    else if (k === 'Enter') { act('start'); }
  }

  function onKeyUp(e) {
    if (e.key === 'ArrowDown') soft = false;
  }

  function bindBtn(id, name) {
    $(id).addEventListener('click', function () { act(name); });
  }

  function init() {
    loadPersisted();
    $('board').width = T.COLS * CELL;
    $('board').height = T.ROWS * CELL;
    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKeyUp);
    $('langBtn').addEventListener('click', function () {
      lang = lang === 'en' ? 'bn' : 'en';
      saveLang();
      applyLang();
    });
    $('overlayBtn').addEventListener('click', function () { act('start'); });
    $('pauseBtn').addEventListener('click', function () { act('pause'); });
    $('restartBtn').addEventListener('click', function () { newGame(); });
    $('holdBtn').addEventListener('click', function () { act('hold'); });
    bindBtn('btnLeft', 'left');
    bindBtn('btnRight', 'right');
    bindBtn('btnRotate', 'rotate');
    bindBtn('btnDrop', 'drop');
    var downBtn = $('btnDown');
    downBtn.addEventListener('pointerdown', function (e) {
      e.preventDefault(); soft = true; act('down');
    });
    downBtn.addEventListener('pointerup', function () { soft = false; });
    downBtn.addEventListener('pointerleave', function () { soft = false; });
    applyLang();
    showOverlay(null, t('pressStart'), 'start');
    $('overlayTitle').textContent = 'Tetris BD';
    syncButtons();
    renderStats();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
