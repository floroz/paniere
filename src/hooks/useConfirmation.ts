import { useCallback } from 'react';
import { useDialog } from './useDialog';

/**
 * Custom hook for confirmation dialog functionality
 * Extends useDialog with confirmation callback handling
 */
export const useConfirmation = (onConfirm?: () => void) => {
  const { isOpen, open, close } = useDialog(false);

  const handleConfirm = useCallback(() => {
    if (onConfirm) {
      onConfirm();
    }
    close();
  }, [onConfirm, close]);

  return {
    isOpen,
    open,
    close,
    confirm: handleConfirm
  };
};
