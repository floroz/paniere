import { useGameStore } from '../../store/useGameStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useTranslations } from '../../i18n/translations';
import { useConfirmation } from '../../hooks/useConfirmation';
import BaseButton from '../BaseButton';
import BaseConfirmationDialog from '../BaseConfirmationDialog';

/**
 * ActionButtons component props
 */
interface ActionButtonsProps {
  /** Function to call when reset is confirmed */
  onReset?: () => void;
  /** Function to call when return to start page is confirmed */
  onReturnToStartPage?: () => void;
}

/**
 * Secondary action buttons for game controls (undo, reset, return)
 */
const ActionButtons = ({ 
  onReset, 
  onReturnToStartPage 
}: ActionButtonsProps) => {
  const undoLastDraw = useGameStore(state => state.undoLastDraw);
  const resetGame = useGameStore(state => state.resetGame);
  const language = useLanguageStore(state => state.language);
  const t = useTranslations(language);
  
  // Use custom hooks for dialog management
  const undoConfirmation = useConfirmation(undoLastDraw);
  const resetConfirmation = useConfirmation(() => {
    resetGame();
    if (onReset) onReset();
  });
  const returnConfirmation = useConfirmation(() => {
    if (onReturnToStartPage) onReturnToStartPage();
  });

  return (
    <>
      <div className="flex items-center gap-2">
        <BaseButton 
          onClick={undoConfirmation.open}
          variant="secondary"
          size="sm"
          className="group relative flex items-center"
          aria-label={t.undoLastDraw}
          tabIndex={0}
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          }
        >
          {t.undoLastDraw}
        </BaseButton>
        
        <BaseButton 
          onClick={resetConfirmation.open}
          variant="danger"
          size="sm"
          className="group relative flex items-center"
          aria-label={t.reset}
          tabIndex={0}
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          }
        >
          {t.reset}
        </BaseButton>
        
        {onReturnToStartPage && (
          <BaseButton 
            onClick={returnConfirmation.open}
            variant="secondary"
            size="sm"
            className="group relative flex items-center"
            aria-label={t.returnToStartPage}
            tabIndex={0}
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            }
          >
            {t.back}
          </BaseButton>
        )}
      </div>
      
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
    </>
  );
};

export default ActionButtons;
