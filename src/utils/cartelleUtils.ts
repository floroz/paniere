/**
 * Utility functions and types for Cartelle (game cards) in Tombola
 */

/**
 * Represents a position in the Tabellone
 */
export type NumberPosition = {
  cartellaId: number; // Which Cartella (1-6)
  row: number;        // Which row (0-2)
  col: number;        // Which column (0-4)
};

/**
 * Represents a single Cartella (game card)
 */
export type CartellaData = {
  id: number;           // Unique identifier (1-6)
  startRow: number;     // Starting row in the Tabellone (0-based)
  startCol: number;     // Starting column in the Tabellone (0-based)
  numbers: number[][];  // 3×5 grid of numbers
};

/**
 * Creates the traditional 6 Cartelle layout for Tombola
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
      const numbers: number[][] = Array(3).fill(0).map((_, row) => 
        Array(5).fill(0).map((_, col) => {
          const actualRow = startRow + row;
          const actualCol = startCol + col;
          // Handle edge case for the last number (90)
          if (actualRow === 8 && actualCol === 9) return 90;
          return actualRow * 10 + actualCol + 1;
        })
      );
      
      cartelle.push({
        id: cartellaId,
        startRow,
        startCol,
        numbers
      });
    }
  }
  
  return cartelle;
};

/**
 * Map of number (1-90) to its position in the Cartelle structure
 */
export const createNumberToPositionMap = (): Record<number, NumberPosition> => {
  const cartelle = createCartelle();
  const map: Record<number, NumberPosition> = {};
  
  cartelle.forEach(cartella => {
    cartella.numbers.forEach((row, rowIndex) => {
      row.forEach((number, colIndex) => {
        map[number] = {
          cartellaId: cartella.id,
          row: rowIndex,
          col: colIndex
        };
      });
    });
  });
  
  return map;
};

// Create the number to position map once
export const numberToPositionMap = createNumberToPositionMap();

/**
 * Gets all numbers in a specific row of a Cartella
 */
export const getNumbersInCartellaRow = (cartellaId: number, rowIndex: number): number[] => {
  const cartelle = createCartelle();
  const cartella = cartelle.find(c => c.id === cartellaId);
  
  if (!cartella) return [];
  
  return cartella.numbers[rowIndex];
};

/**
 * Checks if a row in a Cartella has achieved a specific prize based on drawn numbers
 */
export const checkPrizeInRow = (
  cartellaId: number, 
  rowIndex: number, 
  drawnNumbers: number[]
) => {
  const rowNumbers = getNumbersInCartellaRow(cartellaId, rowIndex);
  const drawnInRow = rowNumbers.filter(num => drawnNumbers.includes(num));
  
  return {
    ambo: drawnInRow.length >= 2,
    terno: drawnInRow.length >= 3,
    quaterna: drawnInRow.length >= 4,
    cinquina: drawnInRow.length === 5
  };
};
