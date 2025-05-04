import BaseDialog from '../BaseDialog';
import BaseButton from '../BaseButton';

/**
 * ConfirmationDialog component props
 */
interface BaseConfirmationDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Function to close the dialog */
  onClose: () => void;
  /** Function to call when confirmed */
  onConfirm: () => void;
  /** Dialog title */
  title: string;
  /** Dialog message */
  message: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm button variant */
  confirmVariant?: 'primary' | 'danger';
}

/**
 * Reusable confirmation dialog component
 */
const BaseConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary'
}: BaseConfirmationDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  
  const footer = (
    <div className="flex justify-end gap-3">
      <BaseButton 
        variant="ghost" 
        onClick={onClose}
        aria-label={cancelText}
      >
        {cancelText}
      </BaseButton>
      <BaseButton 
        variant={confirmVariant} 
        onClick={handleConfirm}
        aria-label={confirmText}
      >
        {confirmText}
      </BaseButton>
    </div>
  );
  
  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
    >
      <p className="text-gray-700 dark:text-gray-300">
        {message}
      </p>
    </BaseDialog>
  );
};

export default BaseConfirmationDialog;
