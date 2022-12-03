export const getNewBoard = (maxSize: number) => {
  return Array.from(Array(maxSize).keys()).slice(1);
};

export const generateRandomNumberInRange = (
  min: number,
  max: number
): number => {
  return Math.floor(Math.random() * (max - min) + min);
};
