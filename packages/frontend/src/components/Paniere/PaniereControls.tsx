import GameControls from "../GameControls";

/**
 * Main game control panel that provides buttons to draw numbers,
 * undo last draw, and reset the game
 */
interface PaniereControlsProps {
  onReset: () => void;
  onReturnToStartPage?: () => void;
}

/**
 * Redesigned game controls component optimized for visual appeal and space efficiency
 * Now uses the extracted GameControls component for better code organization
 */
const PaniereControls = ({
  onReset,
  onReturnToStartPage,
}: PaniereControlsProps) => {
  return (
    <GameControls onReset={onReset} onReturnToStartPage={onReturnToStartPage} />
  );
};

export default PaniereControls;
