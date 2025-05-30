import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import { neapolitanNames } from "../../data/neapolitanNames";

/**
 * NumberDisplay component props
 */
interface NumberDisplayProps {
  /** Number to display */
  number: number;
  /** Whether this is the main/current number */
  isCurrent?: boolean;
  /** Optional animation class */
  animationClass?: string;
}

/**
 * Component to display a drawn number with its Neapolitan name
 */
const NumberDisplay = ({
  number,
  isCurrent = false,
  animationClass = "",
}: NumberDisplayProps) => {
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);

  if (!number) return null;

  return (
    <div
      className={`flex ${isCurrent ? "flex-col items-center justify-center" : "items-center justify-between gap-2"} ${animationClass}`}
      aria-label={`${t.lastDrawnNumber}: ${number}, ${neapolitanNames[number]}`}
    >
      <span
        className={`${
          isCurrent
            ? "text-4xl md:text-5xl font-bold text-red-800 dark:text-red-200 leading-none"
            : "text-base font-bold text-red-700 dark:text-red-300 min-w-[24px] text-right"
        }`}
      >
        {number}
      </span>

      <span
        className={`${
          isCurrent
            ? "mt-1 text-sm text-red-700 dark:text-red-300 text-center w-full max-w-[150px] line-clamp-1"
            : "text-xs text-red-600 dark:text-red-400 flex-1 truncate"
        }`}
      >
        {neapolitanNames[number]}
      </span>
    </div>
  );
};

export default NumberDisplay;
