import { useGameStore } from "../../store/useGameStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import BaseButton from "../BaseButton";

/**
 * Main button for drawing numbers in the game
 */
const DrawButton = () => {
  const drawNumber = useGameStore((state) => state.drawNumber);
  const drawnNumbers = useGameStore((state) => state.drawnNumbers);
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);

  const remainingNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(
    (num) => !drawnNumbers.includes(num),
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && remainingNumbers.length > 0) {
      drawNumber();
    }
  };

  return (
    <BaseButton
      onClick={drawNumber}
      disabled={remainingNumbers.length === 0}
      variant="primary"
      size="lg"
      className="group relative max-w-[180px] h-14 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-md hover:shadow-lg active:scale-[0.98]"
      aria-label={t.draw}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      leftIcon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      }
    >
      {t.draw}
    </BaseButton>
  );
};

export default DrawButton;
