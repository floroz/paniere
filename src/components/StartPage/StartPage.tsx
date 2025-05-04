import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useTranslations } from '../../i18n/translations';
import LanguageSelector from '../../components/LanguageSelector';

/**
 * Props for the StartPage component
 */
interface StartPageProps {
  onStart: () => void;
}

/**
 * Start Page component that allows selecting game mode and language
 */
const StartPage = ({ onStart }: StartPageProps) => {
  const setGameMode = useGameStore(state => state.setGameMode);
  const generateCartelle = useGameStore(state => state.generateCartelle);
  const language = useLanguageStore(state => state.language);
  const setLanguage = useLanguageStore(state => state.setLanguage);
  const t = useTranslations(language);
  
  // Local state for the start page
  const [selectedMode, setSelectedMode] = useState<'tabellone' | 'player' | null>(null);
  const [cartelleCount, setCartelleCount] = useState(1);
  
  /**
   * Handle starting the game with the selected mode
   */
  const handleStartGame = () => {
    if (!selectedMode) return;
    
    // Set game mode in the store
    setGameMode(selectedMode);
    
    // Generate cartelle based on the mode
    if (selectedMode === 'tabellone') {
      generateCartelle(6); // Standard 6 cartelle for tabellone
    } else if (selectedMode === 'player') {
      generateCartelle(cartelleCount);
    }
    
    // Notify parent to proceed
    onStart();
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-gray-950 dark:via-gray-900 dark:to-amber-950 text-gray-900 dark:text-gray-100">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-amber-200 opacity-20 dark:bg-amber-700 dark:opacity-10"></div>
        <div className="absolute top-1/4 -left-12 w-24 h-24 rounded-full bg-amber-300 opacity-10 dark:bg-amber-600 dark:opacity-5"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-amber-100 opacity-30 dark:bg-amber-800 dark:opacity-10"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNmZmZmZmYiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTIgMmg1NnY1NkgyVjJ6IiBmaWxsLW9wYWNpdHk9Ii4xIiBmaWxsPSIjMDAwIi8+PC9nPjwvc3ZnPg==')] opacity-5 dark:opacity-[0.03]"></div>
      </div>
      
      <main className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center justify-center gap-8">
        {/* Header with logo and language selector */}
        <header className="w-full flex flex-col items-center justify-center mb-8 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/images/paniere.png" 
              alt="Paniere" 
              className="w-32 h-32 object-contain" 
              aria-hidden="true"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent font-serif">
            Paniere
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            {t.startPage}
          </p>
          <div className="absolute top-4 right-4">
            <LanguageSelector
              currentLanguage={language}
              onChange={setLanguage}
            />
          </div>
        </header>
        
        {/* Game mode selection */}
        <section className="w-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            {t.selectMode}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tabellone Mode */}
            <button
              className={`
                flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 transition-all duration-300
                ${selectedMode === 'tabellone' 
                  ? 'border-amber-500 dark:border-amber-600 ring-4 ring-amber-200 dark:ring-amber-900 scale-[1.02]' 
                  : 'border-gray-200 dark:border-gray-700 hover:scale-[1.01] hover:shadow-lg'}
              `}
              onClick={() => setSelectedMode('tabellone')}
              aria-label={t.tabelloneMode}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedMode('tabellone')}
            >
              <div className="mb-4 flex justify-center">
                <div className="w-48 h-36 overflow-hidden rounded-lg shadow-md">
                  <img 
                    src="/images/tabellone.webp" 
                    alt="Tabellone preview" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.tabelloneMode}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                {t.tabelloneDescription}
              </p>
            </button>
            
            {/* Player Mode */}
            <button
              className={`
                flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 transition-all duration-300
                ${selectedMode === 'player' 
                  ? 'border-amber-500 dark:border-amber-600 ring-4 ring-amber-200 dark:ring-amber-900 scale-[1.02]' 
                  : 'border-gray-200 dark:border-gray-700 hover:scale-[1.01] hover:shadow-lg'}
              `}
              onClick={() => setSelectedMode('player')}
              aria-label={t.playerMode}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedMode('player')}
            >
              <div className="mb-4 flex justify-center">
                <div className="w-48 h-36 overflow-hidden rounded-lg shadow-md">
                  <img 
                    src="/images/cartelle.jpg" 
                    alt="Cartelle preview" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.playerMode}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                {t.playerDescription}
              </p>
            </button>
          </div>
        </section>
        
        {/* Cartelle count selection (only for Player mode) */}
        {selectedMode === 'player' && (
          <section className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {t.selectCartelle}
            </h2>
            
            <div className="flex flex-col items-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t.howManyCartelle}
              </p>
              
              <div className="flex gap-2 flex-wrap justify-center">
                {Array.from({ length: 10 }, (_, idx) => idx + 1).map(count => (
                  <button
                    key={`cartelle-count-${count}`}
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                      transition-all duration-200
                      ${cartelleCount === count 
                        ? 'bg-amber-500 dark:bg-amber-600 text-white transform scale-110' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                    `}
                    onClick={() => setCartelleCount(count)}
                    aria-label={`${count} ${t.cartelle}`}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setCartelleCount(count)}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Start game button */}
        <div className="w-full flex flex-col items-center mt-4">
          <button
            className={`
              group relative flex w-full max-w-xs items-center justify-center overflow-hidden rounded-xl
              p-4 text-lg font-medium text-white shadow-lg transition-all duration-300 
              hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
              ${selectedMode 
                ? 'bg-gradient-to-br from-red-500 to-orange-500' 
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
            `}
            onClick={handleStartGame}
            disabled={!selectedMode}
            aria-label={t.startGame}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && selectedMode && handleStartGame()}
          >
            {selectedMode && (
              <span className="absolute inset-0 h-full w-full bg-white/10 scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            )}
            <span className="relative flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              {t.startGame}
            </span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default StartPage;
