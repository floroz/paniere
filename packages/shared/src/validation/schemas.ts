import { z } from "zod";

export const gameIdSchema = z
  .string()
  .length(6)
  .regex(/^[A-Z0-9]{6}$/);

export const playerNameSchema = z.string().min(1).max(20).optional();
