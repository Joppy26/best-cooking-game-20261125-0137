# Dapur Kilat — Lightning Kitchen

![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)
![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Joppy26/best-cooking-game-20261125-0137/rank.svg)
![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Joppy26/best-cooking-game-20261125-0137/reward.svg)

Run Bu Sari's little warung against the clock. Orders land on the board, you
build each dish on the plate from the ingredients on the counter, grill the
chicken on the panggangan, then ring the bell to serve before the customer's
patience runs out. Fast serves earn patience bonuses, chained serves build a
combo, and every five dishes the warung levels up and orders come faster.

[Play it on make.fun](https://make.fun/bounty/best-cooking-game-20261125-0137)

## How to play

- **Orders** appear on the board on the left, each with its recipe and a
  patience bar that drains. An expired order walks away and breaks your combo.
- **Ingredients** sit on the counter at the bottom: Nasi, Ayam, Telur, Sayur,
  Sambal, Kerupuk. Click one (or press its number key) to add it to the plate.
- **Ayam goes on the grill first.** Click Ayam (or press G) and it cooks for
  about four seconds; click it again once it is done to put Ayam Bakar on the
  plate. The grill holds two pieces at once, so plan ahead.
- **Serve** with the bell or Space when the plate matches an order exactly.
  A wrong plate just shakes and breaks the combo — nothing is lost but time.
- **Score**: dish price + a patience bonus + a combo bonus. Survive the full
  3-minute shift and the final score is yours.
- **Keys**: 1–6 ingredients, G grill chicken, Space serve, Backspace clear
  plate, P pause, M mute, R restart, Enter start.

## The menu

- Nasi Ayam Bakar — Nasi + Ayam Bakar + Sambal (Rp 120)
- Nasi Telur Dadar — Nasi + Telur + Sayur (Rp 100)
- Nasi Sayur Lodeh — Nasi + Sayur + Kerupuk (Rp 110)
- Nasi Komplit — Nasi + Ayam Bakar + Telur + Kerupuk (Rp 150)
- Nasi Pedas — Nasi + Sambal + Telur + Sayur (Rp 130)

## Tech

Plain HTML, CSS and JavaScript on a canvas — no libraries, no build step, no
network. Serve `game/` with any static server and open `game/index.html`.
Sounds are synthesized live with WebAudio; all art is drawn in code.

- `game/js/main.js` — boot and frame loop, screenshot staging
- `game/js/state.js` — orders, grill, plate, serving, scoring, shift timer
- `game/js/render.js` — canvas drawing of the kitchen, board, bins and bell
- `game/js/recipes.js` — ingredients and dishes
- `game/js/input.js` — mouse and keyboard input, hit-testing
- `game/js/audio.js` — synthesized sound effects
- `game/js/rng.js` — seeded random numbers
- `game/js/shots.js` — staged scenes for the screenshots
