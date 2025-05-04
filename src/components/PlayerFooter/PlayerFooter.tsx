import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
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
  const undoLastNumber = useGameStore(state => state.undoLastNumber);
  const drawnNumbers = useGameStore(state => state.drawnNumbers);
  
  // State for confirmation dialogs
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isUndoDialogOpen, setIsUndoDialogOpen] = useState(false);
  
  const handleOpenReturnDialog = () => setIsReturnDialogOpen(true);
  const handleCloseReturnDialog = () => setIsReturnDialogOpen(false);
  const handleOpenUndoDialog = () => setIsUndoDialogOpen(true);
  const handleCloseUndoDialog = () => setIsUndoDialogOpen(false);
  
  const handleReturn = () => {
    if (onReturnToStartPage) {
      onReturnToStartPage();
    }
  };
  
  const handleUndo = () => {
    undoLastNumber();
    handleCloseUndoDialog();
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
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Undo button */}
            <button 
              onClick={handleOpenUndoDialog}
              disabled={drawnNumbers.length === 0}
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t.undoLastDraw}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && drawnNumbers.length > 0 && handleOpenUndoDialog()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              {t.undoLastDraw}
            </button>
            
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
      </div>
      
      {/* Return confirmation dialog */}
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
      
      {/* Undo confirmation dialog */}
      <ConfirmationDialog
        isOpen={isUndoDialogOpen}
        onClose={handleCloseUndoDialog}
        onConfirm={handleUndo}
        title={t.confirmAction}
        message={t.undoConfirmMessage}
        confirmText={t.confirm}
        cancelText={t.cancel}
      />
    </>
  );
};

export default PlayerFooter;
