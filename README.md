# Tic-Tac-Toe

A browser Tic-Tac-Toe game with an unbeatable AI and a live "win odds" overlay
that shows your chance of winning from each square before you move.

**Live: [iamyvj.github.io/Guess-TicTacToe](https://iamyvj.github.io/Guess-TicTacToe)**

## Features

- **Two modes** — play against an unbeatable computer or a second player locally.
- **Win-odds overlay** — toggle it on to see, for every empty square, what happens
  if you play there: your win chance as a percentage, plus a color-coded bar that
  splits the outcome into win (green), draw (gray) and loss (red).
- **Two odds models** — assume both players move at random, or assume the opponent
  plays optimally while you keep playing at random.
- **Scoreboard** — tracks wins and draws across games.

## How it works

The computer plays perfectly using the **minimax** algorithm: it searches the full
game tree and always picks a move that can't lose. Because Tic-Tac-Toe is a solved
game, a perfect opponent can never be beaten — the best you can do is force a draw.

The win-odds overlay explores the game tree from each candidate move to compute the
full **win / draw / loss** distribution, so a likely draw and a likely loss look
different even when your win chance is the same.

## Files

| File | Purpose |
| --- | --- |
| `index.html`, `style.css`, `script.js` | The web game and its in-browser AI |
| `minimax.py` | The original Python minimax solver |
| `possibilities_generator.py` | Precomputes the optimal moves for every legal board |
| `best_moves.json` | Generated lookup table of best moves for each board state |
