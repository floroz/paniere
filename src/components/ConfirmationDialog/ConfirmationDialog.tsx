import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Props for the ConfirmationDialog component
 */
type ConfirmationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

/**
 * A reusable confirmation dialog component
 * Displays a modal with a title, message, and confirm/cancel buttons
 */
export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Close dialog on escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        ref={dialogRef}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-sm w-full mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <h3 id="dialog-title" className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClose()}
            aria-label={cancelText}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && (onConfirm(), onClose())}
            aria-label={confirmText}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
