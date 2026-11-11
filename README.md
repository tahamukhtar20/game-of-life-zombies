# Game of Life Zombies

Conway's Game of Life in the browser, with an optional infection rule that adds a third cell state. Built with Vite, TypeScript and Tailwind, drawn on a canvas.

Live at [life.tahamukhtar.com](https://life.tahamukhtar.com/).

## Rules

Cells are dead (white), alive (black) or infected (red). Each cell looks at its eight neighbours. The grid edges do not wrap.

With infection mode off, the classic rules apply:

- A live cell with 2 or 3 live neighbours survives, otherwise it dies.
- A dead cell with exactly 3 live neighbours becomes alive.

With infection mode on, these are added:

- A live cell that would die becomes infected if it has more infected than live neighbours.
- Any live cell becomes infected at random with probability 0.02 per generation.
- An infected cell with no live or infected neighbours dies.
- An infected cell stays infected if it has equal numbers of live and infected neighbours, recovers if live neighbours outnumber infected ones, and dies otherwise.
- After that, an infected cell recovers at random with probability 0.02 and dies at random with probability 0.1 (the random death wins if both happen).

Infected cells do not count towards births. Turning infection mode off turns every infected cell back into a live cell.

## Controls

- Click or tap a cell to cycle its state (dead, alive, and infected when infection mode is on). Dragging paints the state the first cell took.
- Start and Stop run and pause the simulation. Reset clears the grid.
- Randomize fills the grid with random states. Random patterns places gliders, blinkers and R-pentominoes, more of them on larger grids.
- Sliders set the step interval (20 to 1000 ms) and the grid size (10 to 250 rows and columns). Phones start with a smaller grid.

The canvas resizes to fit the window and stays sharp on high-DPI screens.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

The site is a static Cloudflare Worker (assets only), configured in `wrangler.jsonc`.

```bash
npm run build
npx wrangler deploy
```
