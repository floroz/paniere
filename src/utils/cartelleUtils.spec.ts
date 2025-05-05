import { describe, it, expect } from "vitest";
import {
  createCartelle,
  createNumberToPositionMap,
  getNumbersInCartellaRow,
  checkPrizeInRow,
  generateRandomCartelle,
  type CartellaData,
} from "../utils/cartelleUtils";

describe("cartelleUtils", () => {
  describe("createCartelle (Tabellone Mode)", () => {
    const cartelle = createCartelle();

    it("should create exactly 6 cartelle", () => {
      expect(cartelle).toHaveLength(6);
    });

    it("should assign correct IDs (1-6)", () => {
      const ids = cartelle.map((c) => c.id);
      expect(ids).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("each cartella should have a 3x5 number grid", () => {
      cartelle.forEach((c) => {
        expect(c.numbers).toHaveLength(3); // 3 rows
        c.numbers.forEach((row) => {
          expect(row).toHaveLength(5); // 5 columns
        });
      });
    });

    it("should calculate startRow and startCol correctly", () => {
      expect(cartelle[0].startRow).toBe(0); // Cartella 1
      expect(cartelle[0].startCol).toBe(0);
      expect(cartelle[1].startRow).toBe(0); // Cartella 2
      expect(cartelle[1].startCol).toBe(5);
      expect(cartelle[2].startRow).toBe(3); // Cartella 3
      expect(cartelle[2].startCol).toBe(0);
      // ... and so on
    });

    // Spot check a few numbers - this logic is deterministic
    it("should place numbers correctly based on formula", () => {
      expect(cartelle[0].numbers[0][0]).toBe(1); // Cartella 1, Row 0, Col 0 -> Actual Row 0, Col 0
      expect(cartelle[1].numbers[0][0]).toBe(6); // Cartella 2, Row 0, Col 0 -> Actual Row 0, Col 5
      expect(cartelle[5].numbers[2][4]).toBe(90); // Cartella 6, Row 2, Col 4 -> Actual Row 8, Col 9
    });
  });

  describe("createNumberToPositionMap", () => {
    const map = createNumberToPositionMap();

    it("should create a map with 90 entries (1-90)", () => {
      expect(Object.keys(map)).toHaveLength(90);
      for (let i = 1; i <= 90; i++) {
        expect(map[i]).toBeDefined();
      }
    });

    it("should map numbers to their correct Tabellone cartellaId, row, and col", () => {
      // Test boundaries and mid-points
      expect(map[1]).toEqual({ cartellaId: 1, row: 0, col: 0 });
      expect(map[5]).toEqual({ cartellaId: 1, row: 0, col: 4 });
      expect(map[6]).toEqual({ cartellaId: 2, row: 0, col: 0 });
      expect(map[10]).toEqual({ cartellaId: 2, row: 0, col: 4 });
      expect(map[45]).toEqual({ cartellaId: 3, row: 1, col: 4 }); // Example mid
      expect(map[46]).toEqual({ cartellaId: 4, row: 1, col: 0 }); // Example mid
      expect(map[81]).toEqual({ cartellaId: 5, row: 2, col: 0 });
      expect(map[90]).toEqual({ cartellaId: 6, row: 2, col: 4 });
    });
  });

  describe("getNumbersInCartellaRow", () => {
    it("should return the correct 5 numbers for a valid cartellaId and rowIndex", () => {
      // Based on createCartelle logic
      expect(getNumbersInCartellaRow(1, 0)).toEqual([1, 2, 3, 4, 5]);
      expect(getNumbersInCartellaRow(2, 1)).toEqual([16, 17, 18, 19, 20]);
      expect(getNumbersInCartellaRow(6, 2)).toEqual([86, 87, 88, 89, 90]);
    });

    it("should return an empty array for an invalid cartellaId", () => {
      expect(getNumbersInCartellaRow(0, 0)).toEqual([]);
      expect(getNumbersInCartellaRow(7, 1)).toEqual([]);
    });

    it("should return an empty array for an invalid rowIndex", () => {
      // Although the underlying access might error, the find would fail first
      // If cartella exists, accessing invalid index might yield undefined -> handled by filter?
      // Let's assume the function should handle this gracefully.
      // Note: Current implementation might allow invalid row index if cartella exists.
      // A stricter check could be added, but testing current behavior:
      const cartella1 = createCartelle().find((c) => c.id === 1);
      if (cartella1) {
        // Accessing potentially undefined row, filter handles it
        expect(getNumbersInCartellaRow(1, -1)).toEqual([]);
        expect(getNumbersInCartellaRow(1, 3)).toEqual([]);
      }
    });
  });

  describe("checkPrizeInRow", () => {
    // Using known rows from createCartelle logic for tests
    // const row1_0 = getNumbersInCartellaRow(1, 0); // [1, 2, 3, 4, 5] - Removed unused variable

    it("should return false for all prizes if fewer than 2 numbers are drawn", () => {
      expect(checkPrizeInRow(1, 0, [])).toEqual({
        ambo: false,
        terno: false,
        quaterna: false,
        cinquina: false,
      });
      expect(checkPrizeInRow(1, 0, [1])).toEqual({
        ambo: false,
        terno: false,
        quaterna: false,
        cinquina: false,
      });
      expect(checkPrizeInRow(1, 0, [6, 7])).toEqual({
        ambo: false,
        terno: false,
        quaterna: false,
        cinquina: false,
      });
    });

    it("should detect Ambo correctly", () => {
      expect(checkPrizeInRow(1, 0, [1, 3])).toEqual({
        ambo: true,
        terno: false,
        quaterna: false,
        cinquina: false,
      });
      expect(checkPrizeInRow(1, 0, [1, 3, 6])).toEqual({
        ambo: true,
        terno: false,
        quaterna: false,
        cinquina: false,
      }); // Only 2 in row
    });

    it("should detect Terno correctly", () => {
      expect(checkPrizeInRow(1, 0, [1, 3, 5])).toEqual({
        ambo: true,
        terno: true,
        quaterna: false,
        cinquina: false,
      });
      expect(checkPrizeInRow(1, 0, [1, 3, 5, 7])).toEqual({
        ambo: true,
        terno: true,
        quaterna: false,
        cinquina: false,
      }); // Only 3 in row
    });

    it("should detect Quaterna correctly", () => {
      expect(checkPrizeInRow(1, 0, [1, 2, 3, 4])).toEqual({
        ambo: true,
        terno: true,
        quaterna: true,
        cinquina: false,
      });
      expect(checkPrizeInRow(1, 0, [1, 2, 3, 4, 8])).toEqual({
        ambo: true,
        terno: true,
        quaterna: true,
        cinquina: false,
      }); // Only 4 in row
    });

    it("should detect Cinquina correctly", () => {
      expect(checkPrizeInRow(1, 0, [1, 2, 3, 4, 5])).toEqual({
        ambo: true,
        terno: true,
        quaterna: true,
        cinquina: true,
      });
      expect(checkPrizeInRow(1, 0, [1, 2, 3, 4, 5, 9])).toEqual({
        ambo: true,
        terno: true,
        quaterna: true,
        cinquina: true,
      }); // All 5 in row
    });

    it("should handle invalid cartellaId/rowIndex returning no prizes", () => {
      expect(checkPrizeInRow(7, 0, [1, 2])).toEqual({
        ambo: false,
        terno: false,
        quaterna: false,
        cinquina: false,
      });
      expect(checkPrizeInRow(1, 3, [1, 2])).toEqual({
        ambo: false,
        terno: false,
        quaterna: false,
        cinquina: false,
      });
    });
  });

  describe("generateRandomCartelle (Player Mode)", () => {
    const validateCartella = (cartella: CartellaData) => {
      const grid = cartella.numbers;
      expect(grid).toHaveLength(3); // 3 rows
      grid.forEach((row) => expect(row).toHaveLength(9)); // 9 columns

      const allNumbers = grid.flat().filter((n) => n !== 0);
      expect(allNumbers).toHaveLength(15); // Exactly 15 numbers

      // Check row counts
      grid.forEach((row, rowIndex) => {
        const rowCount = row.filter((n) => n !== 0).length;
        expect(rowCount, `Row ${rowIndex} count`).toBe(5);
      });

      // Check column counts, vertical sort, decade range, and last-digit rule
      for (let col = 0; col < 9; col++) {
        const colNumbers = [];
        for (let row = 0; row < 3; row++) {
          if (grid[row][col] !== 0) {
            colNumbers.push(grid[row][col]);
            // Check last-digit rule
            const lastDigit = grid[row][col] % 10;
            const expectedRow = lastDigit <= 3 ? 0 : lastDigit <= 6 ? 1 : 2;
            expect(row, `Number ${grid[row][col]} in col ${col}`).toBe(
              expectedRow,
            );
          }
        }
        expect(colNumbers.length, `Col ${col} count`).toBeGreaterThanOrEqual(1);
        expect(colNumbers.length, `Col ${col} count`).toBeLessThanOrEqual(3);

        // Check vertical sort
        for (let i = 0; i < colNumbers.length - 1; i++) {
          expect(colNumbers[i], `Col ${col} sort`).toBeLessThan(
            colNumbers[i + 1],
          );
        }

        // Check decade range
        const minRange = col * 10 + 1;
        const maxRange = col === 8 ? 90 : col * 10 + 10;
        colNumbers.forEach((num) => {
          expect(
            num,
            `Number ${num} in col ${col} range`,
          ).toBeGreaterThanOrEqual(minRange);
          expect(num, `Number ${num} in col ${col} range`).toBeLessThanOrEqual(
            maxRange,
          );
        });
      }

      // Check uniqueness
      const uniqueNumbers = new Set(allNumbers);
      expect(allNumbers.length).toBe(uniqueNumbers.size);

      // Check number range (1-90)
      allNumbers.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(90);
      });
    };

    it("should generate the specified number of valid cartelle", () => {
      const countsToTest = [1, 4, 10];
      countsToTest.forEach((count) => {
        const cartelle = generateRandomCartelle(count);
        expect(cartelle).toHaveLength(count);
        cartelle.forEach(validateCartella);
      });
    });

    it("should clamp count between 1 and 10", () => {
      const cartelleZero = generateRandomCartelle(0);
      expect(cartelleZero).toHaveLength(1);
      validateCartella(cartelleZero[0]);

      const cartelleNegative = generateRandomCartelle(-5);
      expect(cartelleNegative).toHaveLength(1);
      validateCartella(cartelleNegative[0]);

      const cartelleEleven = generateRandomCartelle(11);
      expect(cartelleEleven).toHaveLength(10);
      cartelleEleven.forEach(validateCartella);

      const cartelleLarge = generateRandomCartelle(100);
      expect(cartelleLarge).toHaveLength(10);
      cartelleLarge.forEach(validateCartella);
    });

    // Run validation multiple times to increase confidence in randomness
    it("should consistently generate valid cartelle (multiple runs)", () => {
      for (let i = 0; i < 10; i++) {
        // Run validation 10 times
        const cartelle = generateRandomCartelle(6); // Generate 6 each time
        expect(cartelle).toHaveLength(6);
        cartelle.forEach(validateCartella);
      }
    });
  });
});
