import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
}

/**
 * Toast notification component that slides in from the top
 */
const Toast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose, 
  isVisible 
}: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);
  
  useEffect(() => {
    if (!isVisible) return;
    
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300); // Start exit animation before actually closing
    
    const closeTimer = setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, duration);
    
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, isVisible, onClose]);
  
  if (!isVisible) return null;
  
  const typeClasses = {
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    error: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
    info: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
  };
  
  const enterClass = 'animate-slideDown';
  const exitClass = isExiting ? 'animate-slideUp' : '';
  
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none">
      <div 
        className={`${typeClasses[type]} ${enterClass} ${exitClass} py-3 px-4 rounded-lg shadow-lg max-w-sm w-full flex items-center justify-center backdrop-blur-sm`}
        role="alert"
        aria-live="assertive"
      >
        <div className="mr-2">
          {type === 'success' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'error' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'info' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <p className="font-medium text-white">{message}</p>
      </div>
    </div>
  );
};

export default Toast;
