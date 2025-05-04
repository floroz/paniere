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
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: ConfirmationDialogProps) => {
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

  // Handle confirm action with animation
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] transition-opacity duration-300"
      aria-hidden="true"
    >
      <div 
        ref={dialogRef}
        className="w-full max-w-sm transform mx-4 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative p-6">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-red-500"></div>
            
            <div className="mb-5">
              <h3 
                id="dialog-title" 
                className="text-xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent"
              >
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{message}</p>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="group relative px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 overflow-hidden"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onClose()}
                aria-label={cancelText}
              >
                <span className="relative z-10">{cancelText}</span>
                <span className="absolute inset-0 bg-gray-200 dark:bg-gray-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </button>
              
              <button
                onClick={handleConfirm}
                className="group relative px-4 py-2.5 rounded-xl bg-gradient-to-br from-red-500 to-amber-600 text-white font-medium transition-all duration-300 transform hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 overflow-hidden"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                aria-label={confirmText}
              >
                <span className="relative z-10 flex items-center">
                  {confirmText === 'Reset' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  )}
                  {confirmText === 'Undo' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                  {confirmText}
                </span>
                <span className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationDialog;
