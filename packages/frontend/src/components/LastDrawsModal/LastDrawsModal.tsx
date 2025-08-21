import { useEffect, useRef } from "react";
import { useGameStore } from "../../store/useGameStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import { neapolitanNames } from "../../data/neapolitanNames";
import { createPortal } from "react-dom";

type LastDrawsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Modal component that displays the last 3 drawn numbers
 */
export default function LastDrawsModal({
  isOpen,
  onClose,
}: LastDrawsModalProps) {
  const drawnNumbers = useGameStore((state) => state.drawnNumbers);
  const lastThreeDraws =
    drawnNumbers.length > 0 ? drawnNumbers.slice(-3).reverse() : [];
  const modalRef = useRef<HTMLDivElement>(null);
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-orange-50 dark:bg-orange-950 rounded-lg p-4 max-w-sm w-full mx-4 animate-fade-in shadow-xl border border-orange-200 dark:border-orange-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h3
            id="modal-title"
            className="text-lg font-medium text-red-800 dark:text-red-200"
          >
            {t.lastDraws} 3
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 p-1 rounded-full transition-colors"
            aria-label={t.close}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClose()}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {lastThreeDraws.length > 0 ? (
          <div className="space-y-3">
            {lastThreeDraws.map((num, index) => (
              <div
                key={`modal-draw-${num}-${index}`}
                className="flex items-center space-x-3 p-2 bg-red-50 dark:bg-red-900/30 rounded-md"
              >
                <span className="text-2xl font-bold text-red-800 dark:text-red-200">
                  {num}
                </span>
                <span className="text-sm text-red-700 dark:text-red-300">
                  {neapolitanNames[num]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            {t.noNumbersDrawn}
          </p>
        )}

        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-lg transition-colors"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClose()}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
