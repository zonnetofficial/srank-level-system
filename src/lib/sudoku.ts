export type SudokuGrid = number[][];

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function isValidPlacement(grid: SudokuGrid, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let i = br; i < br + 3; i++)
    for (let j = bc; j < bc + 3; j++)
      if (grid[i][j] === num) return false;
  return true;
}

function solve(grid: SudokuGrid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
          if (isValidPlacement(grid, r, c, n)) {
            grid[r][c] = n;
            if (solve(grid)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export function generateSudoku(difficulty: 'medium' | 'hard'): {
  puzzle: SudokuGrid;
  solution: SudokuGrid;
} {
  const grid: SudokuGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
  solve(grid);
  const solution = grid.map(r => [...r]);
  const remove = difficulty === 'medium' ? 42 : 52;
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
  );
  for (let i = 0; i < remove; i++) {
    const [r, c] = positions[i];
    grid[r][c] = 0;
  }
  return { puzzle: grid.map(r => [...r]), solution };
}

export function checkSudoku(grid: SudokuGrid, solution: SudokuGrid): boolean {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (grid[r][c] !== solution[r][c]) return false;
  return true;
}
