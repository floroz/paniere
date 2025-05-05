import { useTranslations } from "../../i18n/translations";

/**
 * Language selector component props
 */
interface LanguageSelectorProps {
  currentLanguage: "en" | "it";
  onChange: (language: "en" | "it") => void;
}

/**
 * SVG component for the UK flag
 */
const UKFlagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 60 30"
    width="24"
    height="12"
  >
    <clipPath id="a">
      <path d="M0 0v30h60V0z" />
    </clipPath>
    <clipPath id="b">
      <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
    </clipPath>
    <g clipPath="url(#a)">
      <path d="M0 0v30h60V0z" fill="#012169" />
      <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
      <path
        d="M0 0l60 30m0-30L0 30"
        clipPath="url(#b)"
        stroke="#C8102E"
        strokeWidth="4"
      />
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

/**
 * SVG component for the Italian flag
 */
const ItalianFlagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 3 2"
    width="24"
    height="16"
  >
    <rect width="1" height="2" fill="#009246" />
    <rect width="1" height="2" x="1" fill="#fff" />
    <rect width="1" height="2" x="2" fill="#CE2B37" />
  </svg>
);

/**
 * Language selector component that allows switching between English and Italian
 * using flag icons
 */
const LanguageSelector = ({
  currentLanguage,
  onChange,
}: LanguageSelectorProps) => {
  const t = useTranslations(currentLanguage);

  const handleKeyDown = (e: React.KeyboardEvent, language: "en" | "it") => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(language);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={() => onChange("en")}
        className={`
          h-8 px-2 sm:px-3 flex items-center gap-2 border rounded
          transition-all duration-200 overflow-hidden
          ${
            currentLanguage === "en"
              ? "border-amber-500 dark:border-amber-600 ring-2 ring-amber-200 dark:ring-amber-900 scale-105"
              : "border-gray-300 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-700"
          }
        `}
        aria-label={t.switchToEnglish}
        aria-pressed={currentLanguage === "en"}
        tabIndex={0}
        onKeyDown={(e) => handleKeyDown(e, "en")}
      >
        <UKFlagIcon />
        <span className="text-xs font-medium hidden sm:inline">English</span>
      </button>

      <button
        onClick={() => onChange("it")}
        className={`
          h-8 px-2 sm:px-3 flex items-center gap-2 border rounded
          transition-all duration-200 overflow-hidden
          ${
            currentLanguage === "it"
              ? "border-amber-500 dark:border-amber-600 ring-2 ring-amber-200 dark:ring-amber-900 scale-105"
              : "border-gray-300 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-700"
          }
        `}
        aria-label={t.switchToItalian}
        aria-pressed={currentLanguage === "it"}
        tabIndex={0}
        onKeyDown={(e) => handleKeyDown(e, "it")}
      >
        <ItalianFlagIcon />
        <span className="text-xs font-medium hidden sm:inline">Italiano</span>
      </button>
    </div>
  );
};

export default LanguageSelector;
