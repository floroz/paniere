import DrawButton from '../DrawButton';
import ActionButtons from '../ActionButtons';
import RemainingCount from '../RemainingCount';

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
 * Main game control panel that provides buttons to draw numbers,
 * undo last draw, and reset the game
 */
const GameControls = ({ onReset, onReturnToStartPage }: GameControlsProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <RemainingCount />
        <ActionButtons 
          onReset={onReset}
          onReturnToStartPage={onReturnToStartPage}
        />
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <DrawButton />
      </div>
    </div>
  );
};

export default GameControls;
