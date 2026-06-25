// Tic-Tac-Toe UI + client-side minimax (ported from minimax.py).
// Board: flat array of 9 cells. 0 = empty, 1 = X, 2 = O.

const EMPTY = 0, X = 1, O = 2;
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diagonals
];

// ---- Core game logic ----

function getWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] !== EMPTY && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  return EMPTY;
}

function winningLine(board) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] !== EMPTY && board[a] === board[b] && board[b] === board[c]) {
      return line;
    }
  }
  return null;
}

function isFull(board) {
  return board.every((c) => c !== EMPTY);
}

const other = (p) => (p === X ? O : X);

// Minimax score for `forPlayer`: +1 win, -1 loss, 0 draw, with `mover` to play.
function minimax(board, mover, forPlayer) {
  const w = getWinner(board);
  if (w === forPlayer) return 1;
  if (w !== EMPTY) return -1;
  if (isFull(board)) return 0;

  const maximizing = mover === forPlayer;
  let best = maximizing ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (board[i] === EMPTY) {
      board[i] = mover;
      const score = minimax(board, other(mover), forPlayer);
      board[i] = EMPTY;
      best = maximizing ? Math.max(best, score) : Math.min(best, score);
    }
  }
  return best;
}

// Optimal move index for `player` (the unbeatable AI). Random among ties.
function bestMove(board, player) {
  let bestScore = -Infinity;
  let moves = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === EMPTY) {
      board[i] = player;
      const score = minimax(board, other(player), player);
      board[i] = EMPTY;
      if (score > bestScore) {
        bestScore = score;
        moves = [i];
      } else if (score === bestScore) {
        moves.push(i);
      }
    }
  }
  return moves[Math.floor(Math.random() * moves.length)];
}

// Outcome distribution {win, draw, loss} (summing to 1) for `me` from this
// position, with `mover` to play. `me` always moves at random. The opponent
// moves at random too, unless `optimal` is set, in which case the opponent
// plays to minimize `me`'s expected score (win=+1, draw=0, loss=-1), breaking
// ties by averaging. Memoized for speed.
const outcomeCache = new Map();
function outcome(board, mover, me, optimal) {
  const w = getWinner(board);
  if (w === me) return { win: 1, draw: 0, loss: 0 };
  if (w !== EMPTY) return { win: 0, draw: 0, loss: 1 };
  if (isFull(board)) return { win: 0, draw: 1, loss: 0 };

  const key = board.join("") + mover + me + (optimal ? "O" : "R");
  const cached = outcomeCache.get(key);
  if (cached) return cached;

  const next = other(mover);
  let win = 0, draw = 0, loss = 0;

  if (optimal && mover !== me) {
    let bestScore = Infinity, count = 0;
    for (let i = 0; i < 9; i++) {
      if (board[i] === EMPTY) {
        board[i] = mover;
        const c = outcome(board, next, me, optimal);
        board[i] = EMPTY;
        const score = c.win - c.loss;
        if (score < bestScore - 1e-9) {
          bestScore = score;
          win = c.win; draw = c.draw; loss = c.loss; count = 1;
        } else if (score <= bestScore + 1e-9) {
          win += c.win; draw += c.draw; loss += c.loss; count++;
        }
      }
    }
    win /= count; draw /= count; loss /= count;
  } else {
    let n = 0;
    for (let i = 0; i < 9; i++) {
      if (board[i] === EMPTY) {
        board[i] = mover;
        const c = outcome(board, next, me, optimal);
        board[i] = EMPTY;
        win += c.win; draw += c.draw; loss += c.loss; n++;
      }
    }
    win /= n; draw /= n; loss /= n;
  }

  const res = { win, draw, loss };
  outcomeCache.set(key, res);
  return res;
}

// Outcome distribution for `me` if they play square `i` now.
function squareOutcome(board, me, i, optimal) {
  board[i] = me;
  const r = outcome(board, other(me), me, optimal);
  board[i] = EMPTY;
  return r;
}

// ---- UI state ----

const els = {
  board: document.getElementById("board"),
  status: document.getElementById("status"),
  mode: document.getElementById("mode"),
  starts: document.getElementById("starts"),
  startsField: document.getElementById("starts-field"),
  oddsToggle: document.getElementById("odds-toggle"),
  oddsOptions: document.getElementById("odds-options"),
  oddsModel: document.getElementById("odds-model"),
  oddsHelp: document.getElementById("odds-help"),
  reset: document.getElementById("reset"),
};

let board, current, gameOver, locked;

function symbol(v) {
  return v === X ? "X" : v === O ? "O" : "";
}

function init() {
  board = new Array(9).fill(EMPTY);
  gameOver = false;
  locked = false;

  const mode = els.mode.value;
  els.startsField.classList.toggle("hidden", mode !== "ai");

  // X always moves first; "starts" only decides if the human is X or O vs AI.
  current = X;
  render();
  updateStatus();

  if (mode === "ai" && els.starts.value === "ai") {
    // Computer is X and moves first.
    locked = true;
    setTimeout(aiMove, 250);
  }
}

function humanIsX() {
  return !(els.mode.value === "ai" && els.starts.value === "ai");
}

function render() {
  els.board.innerHTML = "";
  const showOdds = els.oddsToggle.checked && !gameOver && !locked;
  const oddsForHuman = els.mode.value === "ai";
  // In PvP, show odds for whoever's turn it is. In AI mode, only on human's turn.
  const oddsPlayer = oddsForHuman ? (humanIsX() ? X : O) : current;
  const oddsActive = showOdds && (els.mode.value === "pvp" || current === oddsPlayer);

  const line = gameOver ? winningLine(board) : null;

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    const v = board[i];

    if (v !== EMPTY) {
      cell.classList.add("taken", v === X ? "x" : "o");
      cell.textContent = symbol(v);
    } else if (gameOver || locked) {
      cell.classList.add("disabled");
    }

    if (line && line.includes(i)) cell.classList.add("win-line");

    if (oddsActive && v === EMPTY) {
      const optimal = els.oddsModel.value === "optimal";
      const r = squareOutcome(board, current, i, optimal);
      const pct = (x) => Math.round(x * 100);

      cell.style.background = evColor(r.win - r.loss);
      cell.title = `Win ${pct(r.win)}%  ·  Draw ${pct(r.draw)}%  ·  Loss ${pct(r.loss)}%`;

      const badge = document.createElement("span");
      badge.className = "odds";
      badge.textContent = pct(r.win) + "%";
      cell.appendChild(badge);

      const bar = document.createElement("div");
      bar.className = "odds-bar";
      for (const k of ["win", "draw", "loss"]) {
        const seg = document.createElement("span");
        seg.className = "seg " + k;
        seg.style.width = r[k] * 100 + "%";
        bar.appendChild(seg);
      }
      cell.appendChild(bar);
    }

    cell.addEventListener("click", () => onCellClick(i));
    els.board.appendChild(cell);
  }
}

// expected value -1 -> red, 0 -> yellow, +1 -> green
function evColor(e) {
  const hue = Math.round((e + 1) * 60); // -1=red .. 0=yellow .. 1=green
  return `hsla(${hue}, 70%, 45%, 0.40)`;
}

function onCellClick(i) {
  if (gameOver || locked || board[i] !== EMPTY) return;

  board[i] = current;
  if (checkEnd()) return;

  current = other(current);

  if (els.mode.value === "ai") {
    locked = true;
    render();
    setTimeout(aiMove, 250);
  } else {
    updateStatus();
    render();
  }
}

function aiMove() {
  if (gameOver) return;
  const move = bestMove(board, current);
  board[move] = current;
  if (checkEnd()) return;
  current = other(current);
  locked = false;
  updateStatus();
  render();
}

// Returns true if the game ended (and handles end-state rendering).
function checkEnd() {
  const w = getWinner(board);
  if (w !== EMPTY) {
    gameOver = true;
    locked = false;
    showResult(w);
    render();
    return true;
  }
  if (isFull(board)) {
    gameOver = true;
    locked = false;
    els.status.textContent = "It's a draw.";
    els.status.className = "status draw";
    render();
    return true;
  }
  return false;
}

function showResult(winner) {
  if (els.mode.value === "pvp") {
    els.status.textContent = `${symbol(winner)} wins!`;
    els.status.className = "status win";
    return;
  }
  const humanWon = winner === (humanIsX() ? X : O);
  els.status.textContent = humanWon ? "You win!" : "Computer wins.";
  els.status.className = "status " + (humanWon ? "win" : "lose");
}

function updateStatus() {
  if (gameOver) return;
  if (els.mode.value === "pvp") {
    els.status.textContent = `${symbol(current)}'s turn`;
  } else {
    const human = humanIsX() ? X : O;
    els.status.textContent = current === human ? "Your turn" : "Computer thinking…";
  }
  els.status.className = "status";
}

// ---- Events ----

function updateOddsHelp() {
  const optimal = els.oddsModel.value === "optimal";
  const tail =
    " The number is your win chance; the bar splits the outcome into win (green), draw (gray) and loss (red).";
  els.oddsHelp.textContent =
    (optimal
      ? "Each empty square shows what happens if you play there, the opponent then plays optimally, and you keep playing at random."
      : "Each empty square shows what happens if you play there and both players move at random afterward.") + tail;
}

els.mode.addEventListener("change", init);
els.starts.addEventListener("change", init);
els.reset.addEventListener("click", init);
els.oddsToggle.addEventListener("change", () => {
  const on = els.oddsToggle.checked;
  els.oddsOptions.classList.toggle("hidden", !on);
  els.oddsHelp.classList.toggle("hidden", !on);
  render();
});
els.oddsModel.addEventListener("change", () => {
  updateOddsHelp();
  render();
});

updateOddsHelp();
init();
