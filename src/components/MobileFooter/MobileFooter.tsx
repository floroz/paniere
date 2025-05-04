import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useTranslations } from '../../i18n/translations';
import ConfirmationDialog from '../ConfirmationDialog';

/**
 * Mobile footer component that displays game controls and last drawn number
 * Only visible on small screens (below sm breakpoint)
 */
type MobileFooterProps = {
  onOpenLastDraws: () => void;
  onReset: () => void;
  onReturnToStartPage?: () => void;
};

/**
 * Mobile footer with game controls for small screens
 */
const MobileFooter = ({ onOpenLastDraws, onReset, onReturnToStartPage }: MobileFooterProps) => {
  const drawnNumbers = useGameStore((state) => state.drawnNumbers);
  const lastDrawn = drawnNumbers.length > 0 ? drawnNumbers[drawnNumbers.length - 1] : null;
  const drawNumber = useGameStore((state) => state.drawNumber);
  const undoLastDraw = useGameStore((state) => state.undoLastDraw);
  const resetGame = useGameStore((state) => state.resetGame);
  const language = useLanguageStore((state) => state.language);
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

  const handleResetConfirm = () => {
    resetGame();
    onReset();
  };
  
  const handleReturnConfirm = () => {
    if (onReturnToStartPage) {
      onReturnToStartPage();
    }
  };
  
  // Calculate remaining numbers
  const remainingNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(
    (num) => !drawnNumbers.includes(num)
  );

  // We'll rely on CSS to hide/show based on screen size instead of JS
  
  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-50/90 to-white/95 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-sm border-t border-amber-100 dark:border-gray-700 shadow-lg px-3 py-2 z-40">
        <div className="flex justify-between items-center">
          {/* Left section: Controls */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center mb-1 gap-1">
              <div className="text-xs font-medium text-amber-700 dark:text-amber-400">
                {t.remaining}:
              </div>
              <div className="text-sm font-bold bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent">
                {remainingNumbers.length}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={drawNumber}
                disabled={remainingNumbers.length === 0}
                className="relative group px-3.5 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 text-white rounded-lg text-base font-medium disabled:opacity-50 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 overflow-hidden"
                aria-label={t.draw}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && remainingNumbers.length > 0 && drawNumber()}
              >
                <span className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left group-disabled:hidden"></span>
                <span className="relative">{t.draw}</span>
              </button>
              
              <div className="flex gap-1.5">
                <button 
                  onClick={handleOpenUndoDialog}
                  className="relative group flex items-center px-2 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all duration-200"
                  aria-label={t.undo}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenUndoDialog()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  {t.undo}
                </button>
                
                <div className="flex gap-1.5">
                  <button 
                    onClick={handleOpenResetDialog}
                    className="flex items-center gap-1 px-2 py-1.5 bg-red-500 dark:bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-600 dark:hover:bg-red-700 active:scale-95 transition-all duration-200"
                    aria-label={t.reset}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleOpenResetDialog()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    {t.reset}
                  </button>
                  
                  {onReturnToStartPage && (
                    <button 
                      onClick={handleOpenReturnDialog}
                      className="flex items-center gap-1 px-2 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all duration-200"
                      aria-label={t.returnToStartPage}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleOpenReturnDialog()}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      {t.back}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right section: Last drawn number and history */}
          <div className="flex items-center gap-2">
            {lastDrawn ? (
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/50 dark:to-amber-800/30 px-2 py-1 rounded-lg shadow-inner border border-amber-200/50 dark:border-amber-700/30">
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400 leading-none mb-0.5">
                  {t.last}
                </span>
                <span className="text-xl font-bold text-amber-800 dark:text-amber-300 leading-none">
                  {lastDrawn}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-none mb-0.5">
                  {t.last}
                </span>
                <span className="text-xl font-bold text-gray-400 dark:text-gray-500 leading-none">
                  -
                </span>
              </div>
            )}
            
            <button
              onClick={onOpenLastDraws}
              className="group flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 overflow-hidden"
              aria-label={`${t.lastDraws} 3`}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onOpenLastDraws()}
            >
              <span className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span className="relative">{t.last} 3</span>
            </button>
          </div>
        </div>
      </div>
      
      <ConfirmationDialog
        isOpen={isUndoDialogOpen}
        onClose={handleCloseUndoDialog}
        onConfirm={undoLastDraw}
        title={`${t.confirm} ${t.undo}`}
        message={t.undoConfirmMessage}
        confirmText={t.undo}
        cancelText={t.cancel}
      />
      
      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={handleCloseResetDialog}
        onConfirm={handleResetConfirm}
        title={`${t.confirm} ${t.reset}`}
        message={t.resetConfirmMessage}
        confirmText={t.reset}
        cancelText={t.cancel}
      />
      
      {onReturnToStartPage && (
        <ConfirmationDialog
          isOpen={isReturnDialogOpen}
          onClose={handleCloseReturnDialog}
          onConfirm={handleReturnConfirm}
          title={t.confirmAction}
          message={`${t.returnConfirmation} ${t.progressLost}`}
          confirmText={t.confirm}
          cancelText={t.cancel}
        />
      )}
    </>
  );
};

export default MobileFooter;
