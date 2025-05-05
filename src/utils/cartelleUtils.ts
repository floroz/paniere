/**
 * Utility functions and types for Cartelle (game cards) in Tombola
 * Support for both Tabellone Mode and Player Mode
 */

/**
 * Represents a position in the Tabellone
 */
export type NumberPosition = {
  cartellaId: number; // Which Cartella (1-6)
  row: number; // Which row (0-2)
  col: number; // Which column (0-4)
};

/**
 * Represents a single Cartella (game card)
 */
export type CartellaData = {
  id: number; // Unique identifier (1-6)
  startRow: number; // Starting row in the Tabellone (0-based)
  startCol: number; // Starting column in the Tabellone (0-based)
  numbers: number[][]; // 3×5 or 3x9 grid of numbers
};

/**
 * Creates the traditional 6 Cartelle layout for Tombola (Tabellone Mode)
 * Each Cartella is a 3×5 grid, and they are arranged in a 2×3 grid
 */
export const createCartelle = (): CartellaData[] => {
  const cartelle: CartellaData[] = [];

  // Cartelle are arranged in a 2×3 grid (2 rows, 3 columns)
  for (let cartellaRow = 0; cartellaRow < 3; cartellaRow++) {
    for (let cartellaCol = 0; cartellaCol < 2; cartellaCol++) {
      const cartellaId = cartellaRow * 2 + cartellaCol + 1;
      const startRow = cartellaRow * 3;
      const startCol = cartellaCol * 5;

      // Initialize the 3×5 grid for this Cartella
      const numbers: number[][] = Array(3)
        .fill(0)
        .map((_, row) =>
          Array(5)
            .fill(0)
            .map((_, col) => {
              const actualRow = startRow + row;
              const actualCol = startCol + col;
              // Handle edge case for the last number (90)
              if (actualRow === 8 && actualCol === 9) return 90;
              return actualRow * 10 + actualCol + 1;
            }),
        );

      cartelle.push({
        id: cartellaId,
        startRow,
        startCol,
        numbers,
      });
    }
  }

  return cartelle;
};

/**
 * Map of number (1-90) to its position in the Tabellone Cartelle structure
 */
export const createNumberToPositionMap = (): Record<number, NumberPosition> => {
  const cartelle = createCartelle(); // Uses the Tabellone structure
  const map: Record<number, NumberPosition> = {};

  cartelle.forEach((cartella) => {
    cartella.numbers.forEach((row, rowIndex) => {
      row.forEach((number, colIndex) => {
        // Need to map back to the overall 9x10 Tabellone grid coordinates
        const actualRow = cartella.startRow + rowIndex;
        const actualCol = cartella.startCol + colIndex;
        // Find the corresponding Tabellone cartella ID based on actualRow/Col
        const tabelloneCartellaRow = Math.floor(actualRow / 3);
        const tabelloneCartellaCol = Math.floor(actualCol / 5);
        const tabelloneCartellaId =
          tabelloneCartellaRow * 2 + tabelloneCartellaCol + 1;

        map[number] = {
          cartellaId: tabelloneCartellaId, // ID within the 6-cartella Tabellone layout
          row: rowIndex, // Row within the 3x5 subgrid
          col: colIndex, // Col within the 3x5 subgrid
        };
      });
    });
  });

  return map;
};

// Create the number to position map once
export const numberToPositionMap = createNumberToPositionMap();

/**
 * Gets all numbers in a specific row of a Tabellone Cartella
 */
export const getNumbersInCartellaRow = (
  cartellaId: number,
  rowIndex: number,
): number[] => {
  const cartelle = createCartelle(); // Uses the Tabellone structure
  const cartella = cartelle.find((c) => c.id === cartellaId);

  // Return empty array if cartella not found OR rowIndex is out of bounds
  if (!cartella || rowIndex < 0 || rowIndex >= cartella.numbers.length) {
    return [];
  }

  return cartella.numbers[rowIndex];
};

/**
 * Checks if a row in a Tabellone Cartella has achieved a specific prize based on drawn numbers
 */
export const checkPrizeInRow = (
  cartellaId: number,
  rowIndex: number,
  drawnNumbers: number[],
) => {
  const rowNumbers = getNumbersInCartellaRow(cartellaId, rowIndex);
  const drawnInRow = rowNumbers.filter((num) => drawnNumbers.includes(num));

  return {
    ambo: drawnInRow.length >= 2,
    terno: drawnInRow.length >= 3,
    quaterna: drawnInRow.length >= 4,
    cinquina: drawnInRow.length === 5,
  };
};

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

// Define max attempts for grid generation globally for the helper function
const MAX_GRID_ATTEMPTS = 500; // Increased attempts

/**
 * Generates a single valid Tombola card grid (3x9).
 * Returns null if unable to generate a valid grid within MAX_GRID_ATTEMPTS.
 * New Algorithm: Focus on column constraints and row balancing.
 */
function createSingleCartellaGrid(): number[][] | null {
  for (let attempt = 0; attempt < MAX_GRID_ATTEMPTS; attempt++) {
    try {
      const grid: number[][] = Array(3)
        .fill(0)
        .map(() => Array(9).fill(0));
      const numbersByCol: number[][] = Array(9)
        .fill(0)
        .map(() => []);
      const colCounts = Array(9).fill(0);
      const rowCounts = Array(3).fill(0);

      // 1. Generate numbers for each column (decade) and shuffle them
      const decadeNumbers: number[][] = Array(9)
        .fill(0)
        .map(() => []);
      for (let i = 1; i <= 90; i++) {
        const colIndex = i === 90 ? 8 : Math.floor((i - 1) / 10);
        decadeNumbers[colIndex].push(i);
      }
      decadeNumbers.forEach(shuffleArray); // Shuffle within each decade

      // 2. Determine column counts (1-3 per column, sum 15)
      const currentCounts = [1, 1, 1, 1, 1, 1, 1, 1, 1]; // Start with 1 per column
      let remainingToAssign = 15 - 9;
      let assignAttempts = 0;
      while (remainingToAssign > 0 && assignAttempts < 100) {
        const randCol = Math.floor(Math.random() * 9);
        if (currentCounts[randCol] < 3) {
          currentCounts[randCol]++;
          remainingToAssign--;
        }
        assignAttempts++;
      }
      if (currentCounts.reduce((a, b) => a + b, 0) !== 15) continue; // Retry if sum isn't 15

      // 3. Select and sort numbers for each column based on determined counts
      for (let col = 0; col < 9; col++) {
        numbersByCol[col] = decadeNumbers[col]
          .slice(0, currentCounts[col])
          .sort((a, b) => a - b);
      }

      // 4. Place numbers onto grid, enforcing last-digit row rule and vertical sort
      for (let col = 0; col < 9; col++) {
        const numsToPlace = numbersByCol[col]; // Already sorted vertically

        for (const num of numsToPlace) {
          // Determine target row based on the last digit rule
          const lastDigit = num % 10;
          const targetRow = lastDigit <= 3 ? 0 : lastDigit <= 6 ? 1 : 2;

          // Validate placement
          if (rowCounts[targetRow] >= 5) {
            throw new Error(
              `Cannot place ${num} in row ${targetRow} (col ${col}): Row already has 5 numbers.`,
            );
          }
          if (grid[targetRow][col] !== 0) {
            // This should ideally not happen if column selection is correct
            throw new Error(
              `Cannot place ${num} in row ${targetRow} (col ${col}): Cell already occupied by ${grid[targetRow][col]}.`,
            );
          }

          // Place the number
          grid[targetRow][col] = num;
          rowCounts[targetRow]++;
          colCounts[col]++;
        }
      }

      // 5. Final Validation (Row counts and Col counts already checked implicitly during placement)
      // We still need to explicitly check the final counts and vertical sort as a safeguard.
      if (!rowCounts.every((c) => c === 5)) {
        // console.log("Row count validation failed:", rowCounts);
        continue; // Retry attempt
      }
      if (!colCounts.every((c) => c >= 1 && c <= 3)) {
        // console.log("Column count validation failed:", colCounts);
        continue; // Retry attempt
      }
      // Check vertical sort explicitly
      for (let c = 0; c < 9; c++) {
        const colNums = [grid[0][c], grid[1][c], grid[2][c]].filter(
          (n) => n !== 0,
        );
        for (let i = 0; i < colNums.length - 1; i++) {
          if (colNums[i] > colNums[i + 1]) {
            throw new Error(`Vertical sort failed in col ${c}: ${colNums}`);
          }
        }
      }

      return grid; // Valid grid found!
    } catch {
      // Remove unused 'e' parameter
      // console.warn(`Retrying cartella generation due to error:`);
    }
  } // End attempt loop

  console.error(
    `Failed to generate a valid single cartella grid after ${MAX_GRID_ATTEMPTS} attempts.`,
  );
  return null; // Failed to generate
}

/**
 * Generate random cartelle for Player Mode adhering to Tombola rules.
 *
 * @param count Number of cartelle to generate (1-10)
 * @returns Array of randomly generated cartelle
 */
export const generateRandomCartelle = (count: number): CartellaData[] => {
  const validCount = Math.min(Math.max(1, count), 10);
  const allGeneratedCartelle: CartellaData[] = [];
  let generationAttempts = 0;
  const MAX_TOTAL_ATTEMPTS = validCount * MAX_GRID_ATTEMPTS * 2; // Safety break

  for (let cartellaId = 1; cartellaId <= validCount; cartellaId++) {
    let grid: number[][] | null = null;
    while (grid === null && generationAttempts < MAX_TOTAL_ATTEMPTS) {
      grid = createSingleCartellaGrid();
      generationAttempts++;
      if (grid === null) {
        // Optional: Add a small delay or log if retrying frequently
        // console.warn(`Retrying grid generation for cartella ${cartellaId}...`);
      }
    }

    if (grid === null) {
      // This should ideally not happen if createSingleCartellaGrid is robust,
      // but it's a safeguard against infinite loops.
      console.error(
        `Failed to generate cartella ${cartellaId} after many attempts. Returning potentially incomplete set.`,
      );
      break; // Stop trying to generate more cartelle
    }

    allGeneratedCartelle.push({
      id: cartellaId,
      startRow: 0, // Not relevant for player mode
      startCol: 0, // Not relevant for player mode
      numbers: grid, // Assign the successfully generated grid
    });
  }
  return allGeneratedCartelle;
};
