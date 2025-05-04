import { useGameStore } from '../../store/useGameStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useTranslations } from '../../i18n/translations';
import BaseButton from '../BaseButton';
import { useConfirmation } from '../../hooks/useConfirmation';
import BaseConfirmationDialog from '../BaseConfirmationDialog';

/**
 * GameControls component props
 */
interface GameControlsProps {
  /** Function to call when reset is confirmed */
  onReset: () => void;
  /** Function to call when return to start page is confirmed */
  onReturnToStartPage?: () => void;
}

/**
 * Main game control panel with a modern, focus-oriented UX design
 * Emphasizes the primary draw action while keeping secondary actions accessible
 */
const GameControls = ({ onReset, onReturnToStartPage }: GameControlsProps) => {
  const drawNumber = useGameStore(state => state.drawNumber);
  const undoLastDraw = useGameStore(state => state.undoLastDraw);
  const resetGame = useGameStore(state => state.resetGame);
  const drawnNumbers = useGameStore(state => state.drawnNumbers);
  const language = useLanguageStore(state => state.language);
  const t = useTranslations(language);
  
  // Remaining numbers calculation
  const remainingNumbers = Array.from({ length: 90 }, (_, i) => i + 1).filter(
    num => !drawnNumbers.includes(num)
  );
  const hasDrawnNumbers = drawnNumbers.length > 0;
  
  // Use custom hooks for confirmation dialogs
  const undoConfirmation = useConfirmation(undoLastDraw);
  const resetConfirmation = useConfirmation(() => {
    resetGame();
    if (onReset) onReset();
  });
  const returnConfirmation = useConfirmation(() => {
    if (onReturnToStartPage) onReturnToStartPage();
  });

  return (
    <div className="h-full grid grid-cols-[1fr_auto] gap-4 items-center">
      {/* Main draw button */}
      <div className="flex justify-center">
        <BaseButton
          onClick={drawNumber}
          disabled={remainingNumbers.length === 0}
          variant="primary"
          size="lg"
          className="h-14 w-32 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] px-6"
          aria-label={t.draw}
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          }
        >
          {t.draw}
        </BaseButton>
      </div>
      
      {/* Vertically stacked action buttons */}
      <div className="flex flex-col gap-2 w-36">
        {/* Undo button - enabled only if there are drawn numbers */}
        <BaseButton
          onClick={hasDrawnNumbers ? undoConfirmation.open : undefined}
          disabled={!hasDrawnNumbers}
          variant="secondary"
          size="sm"
          className={`flex justify-start items-center py-2 px-3 transition-all duration-200 ${hasDrawnNumbers ? 'hover:bg-gray-200 dark:hover:bg-gray-600' : 'opacity-60 cursor-not-allowed'}`}
          aria-label={t.undoLastDraw}
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
          }
        >
          {t.undoLastDraw}
        </BaseButton>
        
        {/* Reset button */}
        <BaseButton
          onClick={resetConfirmation.open}
          variant="danger"
          size="sm"
          className="flex justify-start items-center py-2 px-3 hover:bg-red-200 dark:hover:bg-red-800/40 transition-all duration-200"
          aria-label={t.reset}
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
              <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
            </svg>
          }
        >
          {t.reset}
        </BaseButton>
        
        {/* Back button - only shown if onReturnToStartPage is provided */}
        {onReturnToStartPage && (
          <BaseButton
            onClick={returnConfirmation.open}
            variant="secondary"
            size="sm"
            className="flex justify-start items-center py-2 px-3 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            aria-label={t.back}
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
              </svg>
            }
          >
            {t.back}
          </BaseButton>
        )}
      </div>
      
      {/* Confirmation Dialogs */}
      <BaseConfirmationDialog
        isOpen={undoConfirmation.isOpen}
        onClose={undoConfirmation.close}
        onConfirm={undoConfirmation.confirm}
        title={`${t.confirm} ${t.undoLastDraw}`}
        message={t.undoConfirmMessage}
        confirmText={t.undoLastDraw}
        cancelText={t.cancel}
      />
      
      <BaseConfirmationDialog
        isOpen={resetConfirmation.isOpen}
        onClose={resetConfirmation.close}
        onConfirm={resetConfirmation.confirm}
        title={`${t.confirm} ${t.reset}`}
        message={t.resetConfirmMessage}
        confirmText={t.reset}
        cancelText={t.cancel}
        confirmVariant="danger"
      />
      
      {onReturnToStartPage && (
        <BaseConfirmationDialog
          isOpen={returnConfirmation.isOpen}
          onClose={returnConfirmation.close}
          onConfirm={returnConfirmation.confirm}
          title={t.confirmAction}
          message={`${t.returnConfirmation} ${t.progressLost}`}
          confirmText={t.confirm}
          cancelText={t.cancel}
        />
      )}
    </div>
  );
};

export default GameControls;
