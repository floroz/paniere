import { useGameStore } from '../../store/useGameStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useTranslations } from '../../i18n/translations';
import CartellaNumerata from '../CartellaNumerata/CartellaNumerata';

/**
 * PlayerMode component that displays the player's cartelle
 * and allows them to mark numbers
 */
const PlayerMode = () => {
  const cartelle = useGameStore(state => state.cartelle);
  const language = useLanguageStore(state => state.language);
  const t = useTranslations(language);
  
  return (
    <div className="max-h-full w-full h-auto overflow-auto py-4">
      <div className="flex flex-col items-center gap-4">
        {cartelle.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-gray-600 dark:text-gray-400">
              {t.noCartelleFound}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl mx-auto px-2">
            {cartelle.map(cartella => (
              <div key={`cartella-${cartella.id}`} className="flex justify-center">
                <CartellaNumerata cartella={cartella} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerMode;
