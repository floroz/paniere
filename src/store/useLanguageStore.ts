import { create } from "zustand";
import { persist } from "zustand/middleware";

const LOCAL_STORAGE_KEY = "paniere-language";

export type Language = "en" | "it";

interface LanguageState {
  language: Language;
}

interface LanguageStateWithActions extends LanguageState {
  setLanguage: (language: Language) => void;
}

const initialState: LanguageState = {
  language: "en",
};

/**
 * Store for managing language preferences
 */
export const useLanguageStore = create<LanguageStateWithActions>()(
  persist(
    (set) => ({
      ...initialState,

      setLanguage: (language: Language) => {
        set({ language });
      },
    }),
    {
      name: LOCAL_STORAGE_KEY,
    },
  ),
);
