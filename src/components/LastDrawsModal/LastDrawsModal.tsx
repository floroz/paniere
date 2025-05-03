import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { neapolitanNames } from '../../data/neapolitanNames';
import { createPortal } from 'react-dom';

type LastDrawsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Modal component that displays the last 3 drawn numbers
 */
export default function LastDrawsModal({ isOpen, onClose }: LastDrawsModalProps) {
  const drawn = useGameStore((state) => state.drawn);
  const lastThreeDraws = drawn.slice(-3).reverse();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
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
  
  // Close modal on escape key
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
    <div className="fixed inset-0  bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-sm w-full mx-4 animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id="modal-title" className="text-lg font-medium">Last 3 Draws</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close modal"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClose()}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {lastThreeDraws.length > 0 ? (
          <div className="space-y-3">
            {lastThreeDraws.map((num, index) => (
              <div 
                key={`modal-draw-${num}-${index}`} 
                className="flex items-center space-x-3 p-2 bg-amber-50 dark:bg-amber-900 rounded-md"
              >
                <span className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                  {num}
                </span>
                <span className="text-sm text-amber-700 dark:text-amber-300">
                  {neapolitanNames[num]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">No numbers drawn yet</p>
        )}
        
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClose()}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
