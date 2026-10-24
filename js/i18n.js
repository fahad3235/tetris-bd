// Tetris BD \u2014 UI strings (EN + Bengali). This file is the ONLY source file
// carrying Bengali text; the build step converts it to \uXXXX escapes so
// every shipped JS file stays pure ASCII (factory push lesson, run #25).
(function (global) {
  'use strict';

  var STR = {
    en: {
      tagline: 'Stack the blocks. Clear the lines.',
      score: 'Score',
      lines: 'Lines',
      level: 'Level',
      best: 'Best',
      next: 'Next',
      hold: 'Hold',
      empty: 'Empty',
      start: 'Start',
      pause: 'Pause',
      resume: 'Resume',
      restart: 'Restart',
      gameOver: 'Game Over',
      paused: 'Paused',
      pressStart: 'Press Start and stack the falling blocks. Fill a row to clear it.',
      gameOverMsg: 'No more room \u2014 the stack reached the top.',
      finalScore: 'Final score',
      newBest: 'New best!',
      howTo: 'How to play',
      ctlMove: '\u2190 \u2192  move',
      ctlRotate: '\u2191 / X  rotate',
      ctlSoft: '\u2193  soft drop',
      ctlHard: 'Space  hard drop',
      ctlHold: 'C  hold piece',
      ctlPause: 'P  pause',
      disclaimer: '100% offline \u2014 no account, no data leaves your device. Best score is saved only in this browser.',
      controls: 'Controls'
    },
    bn: {
      tagline: '\u09ac\u09cd\u09b2\u0995 \u09b8\u09be\u099c\u09be\u0993, \u09b2\u09be\u0987\u09a8 \u09ae\u09c1\u099b\u09cb\u0964',
      score: '\u09b8\u09cd\u0995\u09cb\u09b0',
      lines: '\u09b2\u09be\u0987\u09a8',
      level: '\u09b2\u09c7\u09ad\u09c7\u09b2',
      best: '\u09b8\u09c7\u09b0\u09be',
      next: '\u09aa\u09b0\u09c7\u09b0',
      hold: '\u09a7\u09b0\u09c7 \u09b0\u09be\u0996\u09be',
      empty: '\u0996\u09be\u09b2\u09bf',
      start: '\u09b6\u09c1\u09b0\u09c1',
      pause: '\u09ac\u09bf\u09b0\u09a4\u09bf',
      resume: '\u099a\u09be\u09b2\u09bf\u09af\u09bc\u09c7 \u09af\u09be\u0993',
      restart: '\u0986\u09ac\u09be\u09b0 \u0996\u09c7\u09b2\u09cb',
      gameOver: '\u0996\u09c7\u09b2\u09be \u09b6\u09c7\u09b7',
      paused: '\u09ac\u09bf\u09b0\u09a4\u09bf\u09a4\u09c7',
      pressStart: '\u09b6\u09c1\u09b0\u09c1 \u099a\u09be\u09aa\u09c1\u09a8 \u098f\u09ac\u0982 \u09aa\u09a1\u09bc\u09a8\u09cd\u09a4 \u09ac\u09cd\u09b2\u0995 \u09b8\u09be\u099c\u09be\u09a8\u0964 \u098f\u0995\u099f\u09bf \u09b8\u09be\u09b0\u09bf \u09aa\u09c2\u09b0\u09cd\u09a3 \u09b9\u09b2\u09c7 \u09a4\u09be \u09ae\u09c1\u099b\u09c7 \u09af\u09be\u09ac\u09c7\u0964',
      gameOverMsg: '\u0986\u09b0 \u099c\u09be\u09af\u09bc\u0997\u09be \u09a8\u09c7\u0987 \u2014 \u09b8\u09cd\u09a4\u09c2\u09aa \u0989\u09aa\u09b0\u09c7 \u09aa\u09cc\u0981\u099b\u09c7 \u0997\u09c7\u099b\u09c7\u0964',
      finalScore: '\u099a\u09c2\u09a1\u09bc\u09be\u09a8\u09cd\u09a4 \u09b8\u09cd\u0995\u09cb\u09b0',
      newBest: '\u09a8\u09a4\u09c1\u09a8 \u09b8\u09c7\u09b0\u09be!',
      howTo: '\u0995\u09c0\u09ad\u09be\u09ac\u09c7 \u0996\u09c7\u09b2\u09ac\u09c7\u09a8',
      ctlMove: '\u2190 \u2192  \u09b8\u09b0\u09be\u09a8\u09cb',
      ctlRotate: '\u2191 / X  \u0998\u09cb\u09b0\u09be\u09a8\u09cb',
      ctlSoft: '\u2193  \u09a7\u09c0\u09b0\u09c7 \u09a8\u09be\u09ae\u09be\u09a8\u09cb',
      ctlHard: 'Space  \u09a6\u09cd\u09b0\u09c1\u09a4 \u09a8\u09be\u09ae\u09be\u09a8\u09cb',
      ctlHold: 'C  \u09a7\u09b0\u09c7 \u09b0\u09be\u0996\u09be',
      ctlPause: 'P  \u09ac\u09bf\u09b0\u09a4\u09bf',
      disclaimer: '\u09e7\u09e6\u09e6% \u0985\u09ab\u09b2\u09be\u0987\u09a8 \u2014 \u0995\u09cb\u09a8\u09cb \u0985\u09cd\u09af\u09be\u0995\u09be\u0989\u09a8\u09cd\u099f \u09a8\u09c7\u0987, \u0986\u09aa\u09a8\u09be\u09b0 \u09a1\u09bf\u09ad\u09be\u0987\u09b8\u09c7\u09b0 \u09ac\u09be\u0987\u09b0\u09c7 \u0995\u09cb\u09a8\u09cb \u09a4\u09a5\u09cd\u09af \u09af\u09be\u09af\u09bc \u09a8\u09be\u0964 \u09b8\u09c7\u09b0\u09be \u09b8\u09cd\u0995\u09cb\u09b0 \u09b6\u09c1\u09a7\u09c1 \u098f\u0987 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7\u0987 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09af\u09bc\u0964',
      controls: '\u0995\u09a8\u09cd\u099f\u09cd\u09b0\u09cb\u09b2'
    }
  };

  var BN_DIGITS = '\u09e6\u09e7\u09e8\u09e9\u09ea\u09eb\u09ec\u09ed\u09ee\u09ef';

  function toBnDigits(value) {
    return String(value).replace(/[0-9]/g, function (d) {
      return BN_DIGITS[Number(d)];
    });
  }

  function fmtNum(value, lang) {
    var s = String(value);
    if (lang === 'bn') return toBnDigits(s);
    // English: thousands separators, e.g. 12,400.
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  var api = { STR: STR, toBnDigits: toBnDigits, fmtNum: fmtNum };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    global.TetrisI18n = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
