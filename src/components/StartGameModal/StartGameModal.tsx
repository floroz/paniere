import { useEffect } from "react";
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
  
  // Handle ESC key press for closing modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleStartGame = () => {
    resetGame();
    onClose();
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="w-full max-w-md transform rounded-2xl bg-white p-8 shadow-2xl transition-all duration-500 dark:bg-gray-800 dark:text-white animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/images/paniere.png" 
              alt="Paniere" 
              className="w-32 h-32 object-contain" 
              aria-hidden="true"
            />
          </div>
          <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
            Paniere
          </h1>
          <h2 
            id="modal-title"
            className="mb-2 text-xl font-medium text-gray-700 dark:text-gray-300"
          >
            {t.startGame}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t.language === "Language" ? "Choose your language and start playing" : "Scegli la lingua e inizia a giocare"}
          </p>
        </div>
        
        <div className="mb-8">
          <p className="mb-3 font-medium text-gray-700 dark:text-gray-300">{t.language}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              className={`group relative flex items-center justify-center overflow-hidden rounded-xl p-4 transition-all duration-300 ${
                language === "en"
                  ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              }`}
              onClick={() => handleLanguageChange("en")}
              aria-pressed={language === "en"}
            >
              {language === "en" && (
                <span className="absolute inset-0 h-full w-full bg-white/10 scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              )}
              <span className="relative flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="22" height="11">
                  <clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath>
                  <clipPath id="b"><path d="M30 15h30v15zv15H0zH0V0zV0h30z"/></clipPath>
                  <g clipPath="url(#a)"><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6"/><path d="M0 0l60 30m0-30L0 30" clipPath="url(#b)" stroke="#C8102E" strokeWidth="4"/><path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/></g>
                </svg>
                {t.english}
              </span>
            </button>
            <button
              className={`group relative flex items-center justify-center overflow-hidden rounded-xl p-4 transition-all duration-300 ${
                language === "it"
                  ? "bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              }`}
              onClick={() => handleLanguageChange("it")}
              aria-pressed={language === "it"}
            >
              {language === "it" && (
                <span className="absolute inset-0 h-full w-full bg-white/10 scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              )}
              <span className="relative flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="22" height="15">
                  <path fill="#009246" d="M0 0h1v2H0z"/>
                  <path fill="#fff" d="M1 0h1v2H1z"/>
                  <path fill="#ce2b37" d="M2 0h1v2H2z"/>
                </svg>
                {t.italian}
              </span>
            </button>
          </div>
        </div>
        
        <button
          className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-orange-500 p-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          onClick={handleStartGame}
          tabIndex={0}
        >
          <span className="absolute inset-0 h-full w-full bg-white/10 scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
          <span className="relative flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            {t.newGame}
          </span>
        </button>
      </div>
    </div>
  );
};

export default StartGameModal;
