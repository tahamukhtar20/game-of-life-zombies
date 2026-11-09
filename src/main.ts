import "./index.css";
import { GameOfLife, Renderer } from "./setup";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>("gameCanvas");
const speedRange = $<HTMLInputElement>("speedRange");
const rowsRange = $<HTMLInputElement>("rowsRange");
const colsRange = $<HTMLInputElement>("colsRange");
const toggleInfection = $<HTMLInputElement>("toggleInfection");

// Phones start with a smaller grid, so cells are big enough to tap.
if (window.innerWidth < 640) {
  rowsRange.value = "36";
  colsRange.value = "30";
}

let speed = Number(speedRange.value);
const game = new GameOfLife(Number(rowsRange.value), Number(colsRange.value));
const renderer = new Renderer(
  canvas,
  { dead: "#ffffff", alive: "#000000", infected: "#ef4444", line: "rgba(0,0,0,0.18)" },
  () => Math.max(240, window.innerHeight * 0.65),
);

function showValues() {
  $("speedValue").textContent = `${speed}ms`;
  $("rowsValue").textContent = String(game.rows);
  $("colsValue").textContent = String(game.cols);
}

// One requestAnimationFrame loop: steps the game when `speed` ms have passed and redraws
// only when something changed.
let running = false;
let dirty = true;
let last = 0;
let acc = 0;
function frame(now: number) {
  if (running) {
    acc += now - last;
    if (acc >= speed) {
      game.nextGeneration();
      acc = Math.min(acc - speed, speed); // never build up a backlog of steps
      dirty = true;
    }
  }
  last = now;
  if (dirty) {
    renderer.draw(game);
    dirty = false;
  }
  requestAnimationFrame(frame);
}

function fit() {
  renderer.fit(game.rows, game.cols);
  dirty = true;
}

let fitQueued = false;
function queueFit() {
  if (fitQueued) return;
  fitQueued = true;
  requestAnimationFrame(() => {
    fitQueued = false;
    fit();
  });
}
new ResizeObserver(queueFit).observe(canvas.parentElement!);
window.addEventListener("resize", queueFit);

// Click or tap toggles a cell; dragging paints the state the first cell took.
let paint: number | null = null;
let lastCell = -1;
canvas.addEventListener("pointerdown", (e) => {
  const hit = renderer.cellAt(e.clientX, e.clientY);
  if (!hit) return;
  canvas.setPointerCapture(e.pointerId);
  game.toggleCell(hit[0], hit[1]);
  paint = game.get(hit[0], hit[1]);
  lastCell = hit[0] * game.cols + hit[1];
  dirty = true;
});
canvas.addEventListener("pointermove", (e) => {
  if (paint === null) return;
  const hit = renderer.cellAt(e.clientX, e.clientY);
  if (!hit) return;
  const key = hit[0] * game.cols + hit[1];
  if (key === lastCell) return;
  lastCell = key;
  game.set(hit[0], hit[1], paint);
  dirty = true;
});
const endPaint = () => (paint = null);
canvas.addEventListener("pointerup", endPaint);
canvas.addEventListener("pointercancel", endPaint);

speedRange.addEventListener("input", () => {
  speed = Number(speedRange.value);
  showValues();
});

const resize = () => {
  game.resize(Number(rowsRange.value), Number(colsRange.value));
  showValues();
  fit();
};
rowsRange.addEventListener("input", resize);
colsRange.addEventListener("input", resize);

toggleInfection.addEventListener("change", () => {
  game.infectionEnabled = toggleInfection.checked;
  dirty = true;
});

$("startButton").addEventListener("click", () => (running = true));
$("stopButton").addEventListener("click", () => (running = false));
$("resetButton").addEventListener("click", () => {
  running = false;
  game.reset();
  dirty = true;
});
$("randomizeButton").addEventListener("click", () => {
  game.randomize();
  dirty = true;
});
$("randomPatternButton").addEventListener("click", () => {
  game.placeRandomPatterns();
  dirty = true;
});

showValues();
fit();
requestAnimationFrame(frame);
