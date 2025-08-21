import { useGameStore } from "../../store/useGameStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { useTranslations } from "../../i18n/translations";
import BaseCard from "../BaseCard";
import NumberDisplay from "../NumberDisplay";

/**
 * Component to display the last drawn number and previous draws
 */
const LastDrawDisplay = () => {
  const drawn = useGameStore((state) => state.drawnNumbers);
  const lastDrawn = drawn[drawn.length - 1];
  const previousDraws = drawn.slice(-3, -1).reverse();
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);

  if (!lastDrawn) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <p className="text-gray-500 dark:text-gray-400 text-center font-medium">
          {t.noNumbersDrawn}
        </p>
      </div>
    );
  }

  return (
    <BaseCard variant="red" padding={false} className="h-full flex flex-col">
      <div className="h-full grid grid-cols-[60%_40%]">
        {/* Last drawn number */}
        <div
          key={`last-drawn-${lastDrawn}`}
          className="flex flex-col items-center justify-center animate-fade-in border-r border-red-200/70 dark:border-red-700/30"
        >
          <NumberDisplay
            number={lastDrawn}
            isCurrent={true}
            animationClass="animate-fade-in"
          />
        </div>

        {/* Previous draws */}
        <div className="flex flex-col justify-center pr-2 pl-2 space-y-3">
          <div className="text-xs uppercase tracking-wider text-red-600 dark:text-red-400 text-center font-medium">
            {t.previousDraw}
          </div>

          {previousDraws.length > 0 ? (
            <div className="flex flex-col gap-2.5 w-full">
              {previousDraws.map((num, index) => (
                <div
                  key={`prev-draw-${num}-${index}`}
                  className={`flex w-full items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-red-100/50 dark:bg-red-800/20 ${index === 0 ? "animate-fade-in" : "animate-slide-down"}`}
                >
                  <NumberDisplay
                    number={num}
                    animationClass={
                      index === 0 ? "animate-fade-in" : "animate-slide-down"
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-red-600 dark:text-red-400 text-center italic py-4">
              {t.noPreviousDraws}
            </div>
          )}
        </div>
      </div>
    </BaseCard>
  );
};

export default LastDrawDisplay;
