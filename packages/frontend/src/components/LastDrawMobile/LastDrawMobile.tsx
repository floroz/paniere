import { useMemo } from "react";
import { useGameStore } from "../../store/useGameStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import { neapolitanNames } from "../../data/neapolitanNames";
import BaseIconButton from "../BaseIconButton"; // Correct: default import
import { FaMapMarkerAlt } from "react-icons/fa"; // Removed FaHistory

type LastDrawMobileProps = {
  // Removed onShowLast3Click prop
  onScrollToNumberClick: (number: number) => void;
};

/**
 * Component for the mobile footer's top row, displaying last draw info and scroll action.
 */
export const LastDrawMobile = ({
  // Removed onShowLast3Click prop
  onScrollToNumberClick,
}: LastDrawMobileProps) => {
  const drawnNumbers = useGameStore((state) => state.drawnNumbers);
  const lastDrawnNumber = useMemo(
    () =>
      drawnNumbers.length > 0 ? drawnNumbers[drawnNumbers.length - 1] : null,
    [drawnNumbers],
  );
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);

  // Simplified name logic: Directly use Italian name for now.
  // Translation might need adjustment based on how t() function works or where English names are stored.
  const lastDrawnName = useMemo(() => {
    if (lastDrawnNumber === null) return "-";
    // TODO: Integrate proper translation if needed, maybe using t(`number_${lastDrawnNumber}_name`)
    return neapolitanNames[lastDrawnNumber] || "-";
  }, [lastDrawnNumber]);

  const handleScrollClick = () => {
    if (lastDrawnNumber !== null) {
      onScrollToNumberClick(lastDrawnNumber);
    }
  };

  // Rewriting the return block to ensure correct JSX structure
  return (
    <div className="flex justify-between items-center w-full px-1 py-1 border-b border-red-100 dark:border-red-800/50 mb-2">
      {/* Last Drawn Info */}
      <div className="flex flex-col items-start overflow-hidden mr-2">
        <span className="text-xs font-medium text-red-700 dark:text-red-400 leading-tight">
          {t.lastDraws}: {/* Corrected key */}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-red-800 dark:text-red-300 leading-none truncate">
            {lastDrawnNumber ?? "-"}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400 leading-none truncate">
            {lastDrawnName}
          </span>
        </div>
      </div>

      {/* Action Icons with Labels */}
      {/* Removed History Button */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Locate/Scroll Button */}
        <BaseIconButton
          onClick={handleScrollClick}
          aria-label={t.goToCard} // Use new key
          label={t.goToCard} // Use new key
          disabled={lastDrawnNumber === null}
          className="h-11 px-2 py-1 text-xs flex items-center justify-center" // Use h-11 (44px) and flex centering
          size="sm" // Keep size sm for text/icon scaling
          icon={<FaMapMarkerAlt className="h-4 w-4" />} // Use react-icon
        />
      </div>
    </div>
  );
};
