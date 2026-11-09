export const DEAD = 0;
export const ALIVE = 1;
export const INFECTED = 2;

// The grid lives in one flat byte array (index = row * cols + col). Each generation is
// written into a second array and the two are swapped, so stepping allocates nothing.
export class GameOfLife {
  public rows: number;
  public cols: number;
  private cells: Uint8Array;
  private next: Uint8Array;
  private infection: boolean;

  constructor(rows: number, cols: number, infectionEnabled = false) {
    this.rows = rows;
    this.cols = cols;
    this.infection = infectionEnabled;
    this.cells = new Uint8Array(rows * cols);
    this.next = new Uint8Array(rows * cols);
  }

  get infectionEnabled(): boolean {
    return this.infection;
  }

  // Turning infection off makes every infected cell a plain live cell, so none are left
  // frozen on the grid.
  set infectionEnabled(enabled: boolean) {
    this.infection = enabled;
    if (!enabled) {
      for (let i = 0; i < this.cells.length; i++) {
        if (this.cells[i] === INFECTED) this.cells[i] = ALIVE;
      }
    }
  }

  public get(row: number, col: number): number {
    return this.cells[row * this.cols + col];
  }

  public set(row: number, col: number, state: number): void {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    this.cells[row * this.cols + col] = state;
  }

  public getCells(): Uint8Array {
    return this.cells;
  }

  /** Changes the grid size and keeps whatever fits in the overlapping corner. */
  public resize(rows: number, cols: number): void {
    const old = this.cells;
    const oldCols = this.cols;
    const keepRows = Math.min(rows, this.rows);
    const keepCols = Math.min(cols, this.cols);
    this.rows = rows;
    this.cols = cols;
    this.cells = new Uint8Array(rows * cols);
    this.next = new Uint8Array(rows * cols);
    for (let r = 0; r < keepRows; r++) {
      this.cells.set(old.subarray(r * oldCols, r * oldCols + keepCols), r * cols);
    }
  }

  public reset(): void {
    this.cells.fill(DEAD);
  }

  public randomize(): void {
    const states = this.infection ? 3 : 2;
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i] = Math.floor(Math.random() * states);
    }
  }

  public toggleCell(row: number, col: number): void {
    const states = this.infection ? 3 : 2;
    this.set(row, col, (this.get(row, col) + 1) % states);
  }

  public placeRandomPatterns(): void {
    // Scale the number of patterns with the grid, so big grids don't look empty.
    const amount = Math.max(5, Math.round((this.rows * this.cols) / 1500));
    for (const pattern of [GLIDER, BLINKER, R_PENTOMINO]) this.placePattern(pattern, amount);
  }

  private placePattern(pattern: number[][], amount: number): void {
    const h = pattern.length;
    const w = pattern[0].length;
    if (h > this.rows || w > this.cols) return;
    for (let i = 0; i < amount; i++) {
      const top = Math.floor(Math.random() * (this.rows - h + 1));
      const left = Math.floor(Math.random() * (this.cols - w + 1));
      for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) this.set(top + r, left + c, pattern[r][c]);
      }
    }
  }

  public nextGeneration(): void {
    const { rows, cols, cells, next } = this;
    const infection = this.infection;

    for (let row = 0; row < rows; row++) {
      const up = row > 0;
      const down = row < rows - 1;
      for (let col = 0; col < cols; col++) {
        // Count live and infected neighbours. Edges don't wrap around.
        let alive = 0;
        let infected = 0;
        const left = col > 0;
        const right = col < cols - 1;
        const i = row * cols + col;
        let n: number;
        if (up) {
          const j = i - cols;
          if (left) { n = cells[j - 1]; if (n === ALIVE) alive++; else if (n === INFECTED) infected++; }
          n = cells[j]; if (n === ALIVE) alive++; else if (n === INFECTED) infected++;
          if (right) { n = cells[j + 1]; if (n === ALIVE) alive++; else if (n === INFECTED) infected++; }
        }
        if (left) { n = cells[i - 1]; if (n === ALIVE) alive++; else if (n === INFECTED) infected++; }
        if (right) { n = cells[i + 1]; if (n === ALIVE) alive++; else if (n === INFECTED) infected++; }
        if (down) {
          const j = i + cols;
          if (left) { n = cells[j - 1]; if (n === ALIVE) alive++; else if (n === INFECTED) infected++; }
          n = cells[j]; if (n === ALIVE) alive++; else if (n === INFECTED) infected++;
          if (right) { n = cells[j + 1]; if (n === ALIVE) alive++; else if (n === INFECTED) infected++; }
        }

        const cell = cells[i];
        let out = DEAD;
        if (cell === ALIVE) {
          if (alive === 2 || alive === 3) out = ALIVE; // survives
          else if (infection && infected > alive) out = INFECTED; // overrun by the infected
          if (infection && Math.random() < 0.02) out = INFECTED; // random infection
        } else if (cell === INFECTED) {
          if (!infection) out = ALIVE;
          else {
            if (alive + infected === 0) out = DEAD; // alone
            else if (infected === alive) out = INFECTED; // stalemate
            else if (alive > infected) out = ALIVE; // nursed back
            if (Math.random() < 0.02) out = ALIVE; // random recovery
            if (Math.random() < 0.1) out = DEAD; // random death
          }
        } else if (alive === 3) {
          out = ALIVE; // birth
        }
        next[i] = out;
      }
    }

    this.cells = next;
    this.next = cells;
  }
}

const GLIDER = [
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 1],
];
const BLINKER = [
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
];
const R_PENTOMINO = [
  [0, 1, 1],
  [1, 1, 0],
  [0, 1, 0],
];

export interface Palette {
  dead: string;
  alive: string;
  infected: string;
  line: string;
}

// Draws the grid on a canvas that fills its container, sharp on high-DPI screens.
// Grid lines are drawn once per size change into a cached layer; each frame only paints
// the background, the live and infected cells, and that layer on top.
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private lines = document.createElement("canvas");
  private cell = 0; // cell size in device pixels
  private rows = 0;
  private cols = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    public palette: Palette,
    private maxHeight: () => number,
  ) {
    this.ctx = canvas.getContext("2d", { alpha: false })!;
  }

  /** Fits the canvas to its container for a rows × cols grid. Call on resize. */
  public fit(rows: number, cols: number): void {
    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.parentElement!.clientWidth;
    const cssCell = Math.min(width / cols, this.maxHeight() / rows);
    this.cell = Math.max(1, Math.floor(cssCell * dpr));
    this.rows = rows;
    this.cols = cols;

    const w = this.cell * cols;
    const h = this.cell * rows;
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.width = `${w / dpr}px`;
    this.canvas.style.height = `${h / dpr}px`;
    this.drawLines(w, h);
  }

  private drawLines(w: number, h: number): void {
    this.lines.width = w;
    this.lines.height = h;
    const ctx = this.lines.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    if (this.cell < 5) return; // too dense for lines to help
    ctx.fillStyle = this.palette.line;
    for (let c = 1; c < this.cols; c++) ctx.fillRect(c * this.cell, 0, 1, h);
    for (let r = 1; r < this.rows; r++) ctx.fillRect(0, r * this.cell, w, 1);
  }

  public draw(game: GameOfLife): void {
    const { ctx, cell } = this;
    const cells = game.getCells();
    const cols = game.cols;
    ctx.fillStyle = this.palette.dead;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (const [state, color] of [
      [ALIVE, this.palette.alive],
      [INFECTED, this.palette.infected],
    ] as const) {
      ctx.fillStyle = color;
      for (let i = 0; i < cells.length; i++) {
        if (cells[i] === state) ctx.fillRect((i % cols) * cell, Math.floor(i / cols) * cell, cell, cell);
      }
    }
    ctx.drawImage(this.lines, 0, 0);
  }

  /** The cell under a pointer position, or null outside the grid. */
  public cellAt(clientX: number, clientY: number): [number, number] | null {
    const rect = this.canvas.getBoundingClientRect();
    const col = Math.floor(((clientX - rect.left) / rect.width) * this.cols);
    const row = Math.floor(((clientY - rect.top) / rect.height) * this.rows);
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
    return [row, col];
  }
}
