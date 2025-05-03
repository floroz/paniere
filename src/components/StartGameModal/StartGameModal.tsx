import { useState } from "react";
import { Language, useLanguageStore } from "../../store/useLanguageStore";
import { useGameStore } from "../../store/useGameStore";
import { useTranslations } from "../../i18n/translations";

interface StartGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal displayed at the start of the game to configure language and start a new game
 */
const StartGameModal = ({ isOpen, onClose }: StartGameModalProps) => {
  const { language, setLanguage } = useLanguageStore();
  const resetGame = useGameStore((state) => state.resetGame);
  const t = useTranslations(language);
  
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  const handleStartGame = () => {
    setLanguage(selectedLanguage);
    resetGame();
    onClose();
  };

  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 
          id="modal-title"
          className="text-xl font-bold mb-4 text-center"
        >
          {t.startGame}
        </h2>
        
        <div className="mb-6">
          <p className="font-medium mb-2">{t.language}</p>
          <div className="flex gap-2">
            <button
              className={`flex-1 py-2 px-4 rounded-md ${
                selectedLanguage === "en"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
              onClick={() => handleLanguageChange("en")}
              aria-pressed={selectedLanguage === "en"}
            >
              {t.english}
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md ${
                selectedLanguage === "it"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
              onClick={() => handleLanguageChange("it")}
              aria-pressed={selectedLanguage === "it"}
            >
              {t.italian}
            </button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md font-medium"
            onClick={handleStartGame}
            tabIndex={0}
          >
            {t.newGame}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartGameModal;
