import { useGameStore } from '../../store/useGameStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useTranslations } from '../../i18n/translations';
import { neapolitanNames } from '../../data/neapolitanNames';

/**
 * Displays the last drawn number and previous draws
 */
const LastDraw = () => {
  const drawn = useGameStore((state) => state.drawn);
  const lastDrawn = drawn[drawn.length - 1];
  const previousDraws = drawn.slice(-3,-1).reverse();
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);

  if (!lastDrawn) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <p className="text-gray-500 dark:text-gray-400 text-center font-medium">{t.noNumbersDrawn}</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/50 dark:to-amber-800/20 rounded-xl shadow-sm border border-amber-200/50 dark:border-amber-800/30 overflow-hidden">
      <div className="h-full flex">
        {/* Last drawn number */}
        <div 
          key={`last-drawn-${lastDrawn}`} 
          className="flex-1 flex flex-col items-center justify-center animate-fade-in border-r border-amber-200/70 dark:border-amber-700/30"
        >
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1 font-medium">
              {t.last}
            </span>
            <span 
              className="text-5xl md:text-6xl font-bold text-amber-800 dark:text-amber-200 leading-none"
              aria-label={`${t.lastDrawnNumber}: ${lastDrawn}`}
            >
              {lastDrawn}
            </span>
            <span className="mt-1 text-base text-amber-700 dark:text-amber-300 text-center w-full max-w-[150px] line-clamp-1">
              {neapolitanNames[lastDrawn]}
            </span>
          </div>
        </div>
        
        {/* Previous draws */}
        <div className="w-28 flex flex-col justify-center pr-2 pl-2 space-y-3">
          <div className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 text-center font-medium">
            {t.previousDraw}
          </div>
          
          {previousDraws.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {previousDraws.map((num, index) => (
                <div 
                  key={`prev-draw-${num}-${index}`} 
                  className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-amber-100/50 dark:bg-amber-800/20 ${index === 0 ? 'animate-fade-in' : 'animate-slide-down'}`}
                  aria-label={`${t.previousDraw}: ${num}, ${neapolitanNames[num]}`}
                >
                  <span className="text-base font-bold text-amber-700 dark:text-amber-300 min-w-[24px] text-right">
                    {num}
                  </span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 flex-1 truncate">
                    {neapolitanNames[num]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-amber-600 dark:text-amber-400 text-center italic py-4">
              {t.noPreviousDraws}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LastDraw;
