import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useTranslations } from '../../i18n/translations';
import ConfirmationDialog from '../ConfirmationDialog';

/**
 * Main game control panel that provides buttons to draw numbers,
 * undo last draw, and reset the game
 */
interface PaniereControlsProps {
  onReset: () => void;
  onReturnToStartPage?: () => void;
}

/**
 * Redesigned game controls component optimized for visual appeal and space efficiency
 */
const PaniereControls = ({ onReset, onReturnToStartPage }: PaniereControlsProps) => {
  // Use the unified data model
  const drawNumber = useGameStore(state => state.drawNumber);
  const drawnNumbers = useGameStore(state => state.drawnNumbers);
  const resetGame = useGameStore(state => state.resetGame);
  const undoLastDraw = useGameStore(state => state.undoLastDraw);
  const language = useLanguageStore(state => state.language);
  const t = useTranslations(language);
  
  // State for confirmation dialogs
  const [isUndoDialogOpen, setIsUndoDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  
  const handleOpenUndoDialog = () => setIsUndoDialogOpen(true);
  const handleCloseUndoDialog = () => setIsUndoDialogOpen(false);
  const handleOpenResetDialog = () => setIsResetDialogOpen(true);
  const handleCloseResetDialog = () => setIsResetDialogOpen(false);
  const handleOpenReturnDialog = () => setIsReturnDialogOpen(true);
  const handleCloseReturnDialog = () => setIsReturnDialogOpen(false);
  
  const handleReset = () => {
    resetGame();
    onReset();
  };
  
  const handleReturn = () => {
    if (onReturnToStartPage) {
      onReturnToStartPage();
    }
  };

  const remainingNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(
    num => !drawnNumbers.includes(num)
  );
  
  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.remaining}:</span>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent">
              {remainingNumbers.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleOpenUndoDialog}
              className="group relative flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium transition-all duration-200 overflow-hidden"
              aria-label={t.undoLastDraw}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleOpenUndoDialog()}
            >
              <span className="relative z-10 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>{t.undoLastDraw}</span>
              </span>
            </button>
            
            <button 
              onClick={handleOpenResetDialog}
              className="group relative flex items-center px-2 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 rounded-lg text-xs font-medium transition-all duration-200 overflow-hidden"
              aria-label={t.reset}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleOpenResetDialog()}
            >
              <span className="relative z-10 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>{t.reset}</span>
              </span>
            </button>
            
            {onReturnToStartPage && (
              <button 
                onClick={handleOpenReturnDialog}
                className="group relative flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium transition-all duration-200 overflow-hidden"
                aria-label={t.returnToStartPage}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOpenReturnDialog()}
              >
                <span className="relative z-10 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  <span>{t.back}</span>
                </span>
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <button 
            onClick={drawNumber}
            disabled={remainingNumbers.length === 0}
            className="group relative max-w-[180px] h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white font-bold text-lg transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98] overflow-hidden px-6"
            aria-label={t.draw}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && remainingNumbers.length > 0 && drawNumber()}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {t.draw}
          </button>
        </div>
      </div>
      
      <ConfirmationDialog
        isOpen={isUndoDialogOpen}
        onClose={handleCloseUndoDialog}
        onConfirm={undoLastDraw}
        title={`${t.confirm} ${t.undoLastDraw}`}
        message={t.undoConfirmMessage}
        confirmText={t.undoLastDraw}
        cancelText={t.cancel}
      />
      
      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={handleCloseResetDialog}
        onConfirm={handleReset}
        title={`${t.confirm} ${t.reset}`}
        message={t.resetConfirmMessage}
        confirmText={t.reset}
        cancelText={t.cancel}
      />
      
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

export default PaniereControls;
