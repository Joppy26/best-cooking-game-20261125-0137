# Warung Rush — Make the Best Cooking Game

![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)
![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Joppy26/best-cooking-game-20261125-0137/rank.svg)
![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Joppy26/best-cooking-game-20261125-0137/reward.svg)

Run a tiny Indonesian warung kitchen against the clock. Orders land on the board, you click
ingredients on the counter (or press 1–6) to build the dish on the plate, then serve it before
the order timer runs out. Serve fast for time bonuses, chain serves for combos, and survive the
whole 150-second shift without losing all three hearts.

[Play it on make.fun](https://make.fun/bounty/best-cooking-game-20261125-0137)

## How to play

- **Orders** appear on the board on the left, each with its recipe and a countdown bar.
- **Ingredients** sit on the counter at the bottom: Nasi, Ayam, Telur, Sayur, Sambal, Kerupuk.
  Click one (or press its number key) to add it to the plate.
- **Serve** with the green button or Space when the plate matches an order. A wrong dish or an
  expired order costs a heart.
- **Score**: dish price + a time bonus + a combo bonus. Every 5 dishes served, the level rises
  and orders come faster. Lose all 3 hearts or run out of shift time and the shift ends.
- **Keys**: 1–6 ingredients, Space serve, Backspace clear plate, P pause, M mute, R restart.

## The menu

- Nasi Goreng — Nasi + Telur + Sambal (Rp 100)
- Ayam Geprek — Ayam + Sambal + Nasi (Rp 120)
- Gado-Gado — Sayur + Telur + Kerupuk (Rp 110)
- Soto Ayam — Ayam + Nasi + Sayur (Rp 130)

## Tech

Plain HTML, CSS and JavaScript on a canvas — no libraries, no build step, no network.
Serve `game/` with any static server and open `game/index.html`. Sounds are synthesized
live with WebAudio; all art is drawn in code.

- `game/js/recipes.js` — ingredients and dishes
- `game/js/audio.js` — synthesized sound effects
- `game/js/kitchen.js` — canvas drawing of the kitchen
- `game/js/game.js` — orders, timer, scoring and input
- `game/js/main.js` — boot and frame loop
