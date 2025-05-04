import { useTranslations } from '../i18n/translations';

/**
 * Language selector component props
 */
interface LanguageSelectorProps {
  currentLanguage: 'en' | 'it';
  onChange: (language: 'en' | 'it') => void;
}

/**
 * Language selector component that allows switching between English and Italian
 */
const LanguageSelector = ({ currentLanguage, onChange }: LanguageSelectorProps) => {
  const t = useTranslations(currentLanguage);
  
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onChange('en')}
        className={`
          h-8 w-8 rounded-full overflow-hidden flex items-center justify-center border
          transition-all duration-200
          ${currentLanguage === 'en' 
            ? 'border-amber-500 dark:border-amber-600 ring-2 ring-amber-200 dark:ring-amber-900 scale-110' 
            : 'border-gray-300 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-700'
          }
        `}
        aria-label={t.switchToEnglish}
        aria-pressed={currentLanguage === 'en'}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onChange('en')}
      >
        <span className="text-xs font-bold">EN</span>
      </button>
      
      <button
        onClick={() => onChange('it')}
        className={`
          h-8 w-8 rounded-full overflow-hidden flex items-center justify-center border
          transition-all duration-200
          ${currentLanguage === 'it' 
            ? 'border-amber-500 dark:border-amber-600 ring-2 ring-amber-200 dark:ring-amber-900 scale-110' 
            : 'border-gray-300 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-700'
          }
        `}
        aria-label={t.switchToItalian}
        aria-pressed={currentLanguage === 'it'}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onChange('it')}
      >
        <span className="text-xs font-bold">IT</span>
      </button>
    </div>
  );
};

export default LanguageSelector;
