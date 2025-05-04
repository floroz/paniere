import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useTranslations } from '../../i18n/translations';
import ConfirmationDialog from '../ConfirmationDialog';

/**
 * Main game control panel that provides buttons to draw numbers,
 * undo last draw, and reset the game
 */
interface PaniereProps {
  onReset: () => void;
}

export default function Paniere({ onReset }: PaniereProps) {
  const drawNumber = useGameStore((state) => state.drawNumber);
  const drawn = useGameStore((state) => state.drawnNumbers);
  const resetGame = useGameStore((state) => state.resetGame);
  const undoLastDraw = useGameStore((state) => state.undoLastDraw);
  const language = useLanguageStore((state) => state.language);
  const t = useTranslations(language);
  
  // State for confirmation dialogs
  const [isUndoDialogOpen, setIsUndoDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  // Handlers for dialog actions
  const handleOpenUndoDialog = () => setIsUndoDialogOpen(true);
  const handleCloseUndoDialog = () => setIsUndoDialogOpen(false);
  const handleOpenResetDialog = () => setIsResetDialogOpen(true);
  const handleCloseResetDialog = () => setIsResetDialogOpen(false);
  
  /**
   * Handle reset with parent notification
   */
  const handleReset = () => {
    resetGame();
    onReset();
  };

  const remainingNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(
    (num) => !drawn.includes(num)
  );
  
  return (
    <>
      <div className="p-3 border rounded-md bg-white dark:bg-gray-800 shadow-md">
        <p className="mb-3">{t.remaining}: {remainingNumbers.length}</p>
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={drawNumber}
            disabled={remainingNumbers.length === 0}
            className="col-span-2 px-4 py-3 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600 text-lg font-medium"
            aria-label={t.draw}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && drawNumber()}
          >
            {t.draw}
          </button>
          
          <div className="col-span-1 flex flex-col space-y-2">
            <button 
              onClick={handleOpenUndoDialog}
              className="px-2 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
              aria-label={t.undo}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleOpenUndoDialog()}
            >
              {t.undo}
            </button>
            <button 
              onClick={handleOpenResetDialog}
              className="px-2 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
              aria-label={t.reset}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleOpenResetDialog()}
            >
              {t.reset}
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
        onConfirm={handleReset}
        title={`${t.confirm} ${t.reset}`}
        message={t.resetConfirmMessage}
        confirmText={t.reset}
        cancelText={t.cancel}
      />
    </>
  );
}
