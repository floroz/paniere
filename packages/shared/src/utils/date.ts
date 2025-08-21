import dayjs from "dayjs";

export const formatGameTime = (date: Date): string => {
  return dayjs(date).format("HH:mm:ss");
};

export const formatGameDate = (date: Date): string => {
  return dayjs(date).format("DD/MM/YYYY");
};

export const getGameDuration = (startDate: Date, endDate: Date): string => {
  const duration = dayjs(endDate).diff(dayjs(startDate), "minute");
  return `${duration} minutes`;
};
