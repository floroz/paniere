import { useState } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useTranslations } from '../../i18n/translations';
import ConfirmationDialog from '../ConfirmationDialog';

/**
 * Props for the PlayerFooter component
 */
interface PlayerFooterProps {
  onReturnToStartPage?: () => void;
}

/**
 * Simple PlayerFooter component that just contains the logo and a button to stop playing
 * Works across all viewport sizes
 */
const PlayerFooter = ({ onReturnToStartPage }: PlayerFooterProps) => {
  const language = useLanguageStore(state => state.language);
  const t = useTranslations(language);
  
  // State for confirmation dialog
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  
  const handleOpenReturnDialog = () => setIsReturnDialogOpen(true);
  const handleCloseReturnDialog = () => setIsReturnDialogOpen(false);
  
  const handleReturn = () => {
    if (onReturnToStartPage) {
      onReturnToStartPage();
    }
  };
  
  return (
    <>
      <div className="row-start-2 row-end-3 col-span-full flex p-3 border-t border-amber-100/50 dark:border-gray-700/50">
        <div className="w-full flex items-center justify-between">
          {/* Paniere logo */}
          <div className="flex-shrink-0">
            <img 
              src="/images/paniere.png" 
              alt="" 
              className="h-12 w-12 object-contain" 
              aria-hidden="true" 
            />
          </div>
          
          {/* Stop playing button */}
          {onReturnToStartPage && (
            <button 
              onClick={handleOpenReturnDialog}
              className="flex items-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium transition-all duration-200"
              aria-label={t.stopPlaying}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleOpenReturnDialog()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {t.stopPlaying}
            </button>
          )}
        </div>
      </div>
      
      {onReturnToStartPage && (
        <ConfirmationDialog
          isOpen={isReturnDialogOpen}
          onClose={handleCloseReturnDialog}
          onConfirm={handleReturn}
          title={t.confirmAction}
          message={`${t.returnConfirmation} ${t.progressLost}`}
          confirmText={t.confirm}
          cancelText={t.cancel}
        />
      )}
    </>
  );
};

export default PlayerFooter;
