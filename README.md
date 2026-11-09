# Game of Life Zombies

This project is a dynamic implementation of Conway's Game of Life with additional custom rules for an infection mechanic. The simulation is built with TypeScript and features configurable grid states, random patterns, and an interactive grid rendering system.

Hosted at: [life.tahamukhtar.com](https://life.tahamukhtar.com/)
---

## Features

### **Classic and Custom Rules**

- Implements the traditional Game of Life rules.
- Adds new infection mechanics for more complex and chaotic interactions.

### **States**

- **Dead (0):** The cell is not alive.
- **Alive (1):** The cell is alive.
- **Infected (2):** The cell is alive but infected, with additional rules for recovery and random death.

### **Custom Behaviors**

- **Infection Mechanic:** Toggleable infection behaviour.
- **Random Patterns:** Automatically generates random placements of classic patterns like Gliders, Blinkers, and R-pentomino.
- **Interactive Grid:** Click to cycle cell states between Dead, Alive, and Infected.
- **Randomization:** Initialize the grid with randomized states.

### **Custom Rendering**

- **Cell Colors:**
  - Dead: White
  - Alive: Black
  - Infected: Red
- Renders cells dynamically on an HTML canvas.

---

## Installation

### **Prerequisites**

Ensure you have the following installed:

- **Node.js**
- **npm** or **yarn**

### **Clone the Repository**

```bash
git clone https://github.com/tahamukhtar20/gameoflife-z.git
cd gameoflife-z
```

### **Install Dependencies**

```bash
npm install
```

---

## Usage

### **Start the Project**

Run the following command to start the simulation:

```bash
npm start
```

This will launch the game in your default browser.

---

## Game Rules

### **Alive Cells (1)**

- Survive with 2 or 3 alive neighbors.
- Become infected if:
  - Infected neighbours> Alive neighbours (infection enabled).
  - Random infection event (2% probability).
- Die due to:
  - Underpopulation (fewer than 2 alive neighbours).
  - Overpopulation (more than 3 alive neighbours).

### **Infected Cells (2)**

- Die if no neighbours (alive or infected).
- Remain infected if infected neighbours = alive neighbours.
- Recover to alive if alive neighbours> infected neighbours.
- Randomly recover (2% probability) or die (10% probability).

### **Dead Cells (0)**

- Become alive if exactly 3 neighbours are alive.

---

## Contributing

Contributions are welcome! If you have ideas for new features or optimizations, open an issue or create a pull request.

### **Steps to Contribute**

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgements

- Inspired by Conway's Game of Life.
- Extended with infection mechanics for added complexity and experimentation.
