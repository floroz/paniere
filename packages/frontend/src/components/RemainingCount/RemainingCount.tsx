import { useGameStore } from "../../store/useGameStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import BaseBadge from "../BaseBadge";

/**
 * Component to display the count of remaining numbers
 */
const RemainingCount = () => {
  const drawnNumbers = useGameStore((state) => state.drawnNumbers);
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);

  const remainingNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(
    (num) => !drawnNumbers.includes(num),
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {t.remaining}:
      </span>
      <BaseBadge
        variant="red"
        size="md"
        className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-800 dark:from-red-400 dark:to-red-600 bg-clip-text text-transparent"
      >
        {remainingNumbers.length}
      </BaseBadge>
    </div>
  );
};

export default RemainingCount;
