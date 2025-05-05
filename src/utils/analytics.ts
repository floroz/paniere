import ReactGA from "react-ga4";
import { GameMode } from "../store/useGameStore";

/**
 * Initializes GA4 using the Measurement ID from environment variables.
 * Should be called once when the application loads.
 */
export const initializeGA = (): void => {
  // Vite exposes env variables through import.meta.env
  const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (gaMeasurementId) {
    try {
      ReactGA.initialize(gaMeasurementId);
      console.log(`GA Initialized with ID: ${gaMeasurementId}`); // Log for debugging
    } catch (error) {
      console.error("Failed to initialize GA:", error);
    }
  } else {
    console.warn(
      "VITE_GA_MEASUREMENT_ID not found in .env file. Google Analytics tracking disabled.",
    );
  }
};

/**
 * Tracks the start_game event when a user selects a mode and starts.
 * @param mode - The game mode selected ('master' or 'player').
 */
export const trackStartGame = (mode: GameMode): void => {
  try {
    ReactGA.event("start_game", { mode });
  } catch (error) {
    console.error("Failed to track start_game event:", error);
  }
};

/**
 * Tracks a simulated page view for single-page applications where URL doesn't change.
 * @param path - The virtual path to track (e.g., '/game-master', '/player-mode').
 * @param title - Optional title for the page view. Defaults to the path.
 */
export const trackPageView = (path: string, title?: string): void => {
  try {
    ReactGA.send({ hitType: "pageview", page: path, title: title || path });
  } catch (error) {
    console.error("Failed to track pageview event:", error);
  }
};

/**
 * Tracks the time spent in a specific game mode.
 * @param mode - The game mode the user was in ('master' or 'player').
 * @param durationSeconds - The duration spent in the mode, in seconds.
 */
export const trackModeTimeSpent = (
  mode: GameMode,
  durationSeconds: number,
): void => {
  // Only send the event if the duration is meaningful (e.g., more than 0 seconds)
  if (durationSeconds > 0) {
    try {
      ReactGA.event("mode_time_spent", {
        mode,
        duration_seconds: durationSeconds,
      });
    } catch (error) {
      console.error("Failed to track mode_time_spent event:", error);
    }
  }
};

/**
 * Tracks the reset_game event when the user resets the game state.
 */
export const trackResetGame = (): void => {
  try {
    ReactGA.event("reset_game");
  } catch (error) {
    console.error("Failed to track reset_game event:", error);
  }
};

/**
 * Tracks the undo_last_draw event when the user undoes the last number drawn.
 */
export const trackUndoLastDraw = (): void => {
  try {
    ReactGA.event("undo_last_draw");
  } catch (error) {
    console.error("Failed to track undo_last_draw event:", error);
  }
};
