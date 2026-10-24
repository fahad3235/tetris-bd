# TEST RESULTS — tetris-bd (run #129, 2026-10-24 18:00 slot)

## Unit tests — 23/23 passed

Run: `node tests/tetris.test.js` — plain Node asserts, no dependencies.

- 7 pieces, each exactly 4 cells; T clockwise rotation hand-computed;
  4 rotations return the original matrix; 7-bag contains all 7 pieces (20 draws).
- Spawn: I at x=3, O at x=4, y=0. Left wall stops at x=0. Floor: I falls to
  y=18 (occupies row 19). Wall kick: vertical I at x=7 rotates to x=6.
  Ghost Y on an empty board: 18.
- Lock stamps cells. Single clear: 100 points, 1 line. Tetris: 800 points.
  Double at level 3: 900 points. Level-up: 9 lines + 1 clear -> level 2, with
  the clear scored at the old level (100).
- Hard drop: I drops 18 cells, +36 points, lands on row 19. Soft drop: +1/cell.
  stepDown locks and spawns the next piece.
- Hold: first hold swaps in the next piece, second hold refused, hold re-arms
  after a lock and swaps back.
- Game over: hand-built near-full top (row 0 full except col 4, row 1 full
  except col 3 — neither row clears) makes the spawned T collide at (4,1).
- Speed curve: 1000 ms at level 1, 40 ms soft drop, decreasing with level,
  floored at 60 ms.
- i18n: EN/BN tables have identical keys and non-empty values; Bengali digits
  (2026 -> ২০২৬ in source, escaped in shipped file); fmtNum EN groups
  (12,400), BN converts (১২৪০০).

Repairs: 1 test-side fix (the test's expected matrix for a rotated vertical I
was row 1; the engine correctly produces row 2 — rotation math verified by
hand from the rotateMatrix formula). 0 app-logic bugs.

## Headless-Chrome smoke — 13/13 passed, 0 console errors

Run: `node tests/smoke.mjs` (raw CDP, /opt/meta-chromium/chrome, file:// URL).

Title, 300x600 board canvas, idle overlay with Start, 3 next + hold canvases,
Start hides the overlay and paints a piece (pixel check vs background color),
ArrowLeft key, Hold + Rotate buttons, language toggle to Bengali and back to
English, pause overlay + resume, 390px mobile with no horizontal overflow
(scrollWidth <= 391), zero console errors / page exceptions.

Incident during testing: an ASCII-conversion script truncated index.html to
0 bytes (it opened the file for writing before the encode failed). The file
was rewritten ASCII-safe from scratch and the full smoke suite re-ran green;
the shipped index.html was verified non-empty (6,167 bytes) before publishing.

## Source hygiene

All shipped sources (index.html, js/*.js, tests/*) verified pure ASCII with
`grep -P '[^\x00-\x7F]'` returning zero matches. Bengali lives as \uXXXX
escapes in JS and numeric entities in HTML, so the GitHub push cannot corrupt
it (factory lesson, run #25).

## Publishing

- Repo: https://github.com/fahad3235/tetris-bd (PUBLIC)
- Live: https://fahad3235.github.io/tetris-bd/ (Pages, main branch, root)
- Verification: live page HTTP 200 + byte-identical index.html (see run log).
