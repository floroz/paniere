export const getNewBoard = () => {
  return Array.from(Array(10).keys()).slice(1);
};

export const generateRandomNumberInRange = (
  min: number,
  max: number
): number => {
  return Math.floor(Math.random() * (max - min) + min);
};
