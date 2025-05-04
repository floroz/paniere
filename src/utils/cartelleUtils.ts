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
 * Following the constraints of Neapolitan Tombola:
 * - Each cartella has 3 rows, 5 columns (15 numbers total)
 * - Numbers are arranged according to their tens (1-9 in first column, 10-19 in second, etc.)
 * - Each row has 5 numbers, with certain positions left blank
 * 
 * @param count Number of cartelle to generate (1-10)
 * @returns Array of randomly generated cartelle
 */
export const generateRandomCartelle = (count: number): CartellaData[] => {
  // Validate count range
  const validCount = Math.min(Math.max(1, count), 10);
  const cartelle: CartellaData[] = [];
  
  for (let cartellaId = 1; cartellaId <= validCount; cartellaId++) {
    // Create a 3×5 grid initially filled with zeros (representing empty spaces)
    const numbers: number[][] = Array(3).fill(0).map(() => Array(5).fill(0));
    
    // Fill each column with numbers from the appropriate range
    for (let col = 0; col < 5; col++) {
      // Determine number range for this column (1-9, 10-19, 20-29, etc.)
      // For the last column (col=4), the range is 81-90
      const minNum = col * 10 + 1;
      const maxNum = col === 4 ? 90 : minNum + 9;
      
      // Create array of all possible numbers for this column
      const availableNumbers = Array.from(
        { length: maxNum - minNum + 1 },
        (_, i) => minNum + i
      );
      
      // Shuffle the available numbers
      const shuffled = availableNumbers.sort(() => Math.random() - 0.5);
      
      // Pick the first 1-3 numbers for this column (randomly decide)
      const numToUse = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 numbers
      const selectedNumbers = shuffled.slice(0, numToUse);
      
      // Assign numbers to rows, ensuring each row has at most 5 numbers
      const rowAssignments = Array(3).fill(0);
      selectedNumbers.forEach(num => {
        // Find row with fewest numbers assigned
        let targetRow = 0;
        for (let row = 0; row < 3; row++) {
          // Count non-zero entries in this row
          const filledCount = numbers[row].filter(n => n !== 0).length;
          if (filledCount < 5 && 
              (rowAssignments[row] < rowAssignments[targetRow] || 
               filledCount < numbers[targetRow].filter(n => n !== 0).length)) {
            targetRow = row;
          }
        }
        
        // Place number in the identified row
        numbers[targetRow][col] = num;
        rowAssignments[targetRow]++;
      });
    }
    
    // Create the cartella object
    cartelle.push({
      id: cartellaId,
      startRow: 0, // Not relevant for player mode
      startCol: 0, // Not relevant for player mode
      numbers
    });
  }
  
  return cartelle;
};
