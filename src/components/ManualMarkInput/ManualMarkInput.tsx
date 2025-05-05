import {
  useState,
  useCallback,
  ChangeEvent,
  KeyboardEvent,
  useRef,
} from "react";
import { useGameStore } from "../../store/useGameStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import BaseButton from "../BaseButton";

interface ManualMarkInputProps {
  /** Optional Tailwind class for input width. Defaults to 'w-16'. */
  inputWidthClass?: string;
}

/**
 * Component with an input field and button for manually marking numbers.
 */
const ManualMarkInput = ({
  inputWidthClass = "w-16", // Default width for mobile
}: ManualMarkInputProps) => {
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);
  const markNumber = useGameStore((state) => state.markNumber);
  const [manualNumberInput, setManualNumberInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the input element

  // Handler for manual number marking
  const handleManualMark = useCallback(() => {
    const num = parseInt(manualNumberInput, 10);
    if (!isNaN(num) && num >= 1 && num <= 90) {
      markNumber(num);
      setManualNumberInput(""); // Clear input after marking
      inputRef.current?.focus(); // Focus the input after marking
      // TODO: Consider adding a success toast notification
    } else {
      // TODO: Consider adding an error toast notification
      console.warn(
        "Invalid number entered for manual marking:",
        manualNumberInput,
      );
    }
  }, [manualNumberInput, markNumber]);

  // Handle Enter key in input field
  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleManualMark();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        min="1"
        max="90"
        value={manualNumberInput}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setManualNumberInput(e.target.value)
        }
        onKeyDown={handleInputKeyDown}
        placeholder={t.drawn}
        aria-label="Enter number to mark"
        className={`${inputWidthClass} h-11 px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-600 dark:focus:border-red-600 transition duration-200`}
      />
      <BaseButton
        onClick={handleManualMark}
        disabled={
          !manualNumberInput ||
          parseInt(manualNumberInput, 10) < 1 ||
          parseInt(manualNumberInput, 10) > 90
        }
        size="sm"
        className="h-11 px-3 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-lg shadow-sm active:scale-95 transition-all duration-200"
        aria-label={
          manualNumberInput
            ? `${t.markNumber} ${manualNumberInput}`
            : t.markNumber
        }
      >
        {t.markNumber}
      </BaseButton>
    </div>
  );
};

export default ManualMarkInput;
