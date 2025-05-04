/**
 * Utility functions and types for Cartelle (game cards) in Tombola
 * Support for both Tabellone Mode and Player Mode
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

/**
 * Generate random cartelle for Player Mode
 * 
 * Following the constraints of traditional Tombola cartelle:
 * - Each cartella has 3 rows, 9 columns
 * - Each row has exactly 5 numbers and 4 empty spaces
 * - Numbers are placed in their corresponding column based on their tens digit:
 *   - Column 1: numbers 1-9
 *   - Column 2: numbers 10-19
 *   - Column 3: numbers 20-29, etc.
 * 
 * @param count Number of cartelle to generate (1-10)
 * @returns Array of randomly generated cartelle
 */
export const generateRandomCartelle = (count: number): CartellaData[] => {
  // Validate count range
  const validCount = Math.min(Math.max(1, count), 10);
  const cartelle: CartellaData[] = [];
  
  for (let cartellaId = 1; cartellaId <= validCount; cartellaId++) {
    // Create a 3×9 grid initially filled with zeros (representing empty spaces)
    const grid: number[][] = Array(3).fill(0).map(() => Array(9).fill(0));
    
    // First, decide which columns will have numbers in each row
    // We need exactly 5 columns filled in each row
    const selectedColumns: number[][] = [];
    
    for (let row = 0; row < 3; row++) {
      // Create array of column indices (0-8) and shuffle them
      const columnIndices = Array.from({ length: 9 }, (_, i) => i)
        .sort(() => Math.random() - 0.5);
      
      // Select the first 5 columns to fill for this row
      selectedColumns.push(columnIndices.slice(0, 5).sort((a, b) => a - b));
    }
    
    // Now fill each column with appropriate numbers
    // First, generate all possible numbers for each column
    const columnNumbers: number[][] = [];
    
    for (let col = 0; col < 9; col++) {
      const minNum = col * 10 + 1;
      const maxNum = col === 8 ? 90 : minNum + 9;
      
      // Create all possible numbers for this column and shuffle them
      const numbers = Array.from(
        { length: maxNum - minNum + 1 },
        (_, i) => minNum + i
      ).sort(() => Math.random() - 0.5);
      
      columnNumbers.push(numbers);
    }
    
    // Count how many cells we need to fill in each column across all 3 rows
    const columnCounts = Array(9).fill(0);
    selectedColumns.forEach(rowColumns => {
      rowColumns.forEach(col => columnCounts[col]++);
    });
    
    // Now fill the grid based on selected columns
    for (let col = 0; col < 9; col++) {
      // Skip columns that don't need any numbers
      if (columnCounts[col] === 0) continue;
      
      // Take the first N numbers needed for this column
      const numbersToUse = columnNumbers[col].slice(0, columnCounts[col]);
      
      // Shuffle these numbers to randomize which rows they'll go in
      const shuffledNumbers = [...numbersToUse].sort(() => Math.random() - 0.5);
      
      // Assign numbers to rows that have this column selected
      let numberIndex = 0;
      for (let row = 0; row < 3; row++) {
        if (selectedColumns[row].includes(col)) {
          grid[row][col] = shuffledNumbers[numberIndex++];
        }
      }
    }
    
    // Create the cartella object with the complete 3x9 grid
    cartelle.push({
      id: cartellaId,
      startRow: 0, // Not relevant for player mode
      startCol: 0, // Not relevant for player mode
      numbers: grid
    });
  }
  
  return cartelle;
};
