import { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
}

/**
 * Confetti celebration effect using react-confetti library
 */
const Confetti = ({ isActive, duration = 3000 }: ConfettiProps) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [shouldRecycle, setShouldRecycle] = useState(true);
  
  // Handle window dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    // Initial dimensions
    updateDimensions();
    
    // Update dimensions on resize
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Handle automatic confetti stop after duration
  useEffect(() => {
    if (!isActive) return;
    
    const timer = setTimeout(() => {
      setShouldRecycle(false);
    }, duration - 1000); // Stop recycling a bit before hiding
    
    return () => clearTimeout(timer);
  }, [isActive, duration]);
  
  // Reset recycling when becoming active again
  useEffect(() => {
    if (isActive) {
      setShouldRecycle(true);
    }
  }, [isActive]);
  
  if (!isActive) return null;
  
  return (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      recycle={shouldRecycle}
      numberOfPieces={200}
      gravity={0.25}
      colors={['#FFC700', '#FF0000', '#2E3191', '#41D3BD', '#FF7272', '#33CC99']}
      className="fixed inset-0 pointer-events-none z-[9999]"
    />
  );
};

export default Confetti;
