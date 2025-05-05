import LastDraw from "../LastDraw";
import PaniereControls from "../Paniere/PaniereControls";
import RemainingCount from "../RemainingCount";

/**
 * Props for the TabelloneFooter component
 */
interface TabelloneFooterProps {
  onReset: () => void;
  onReturnToStartPage?: () => void;
}

/**
 * TabelloneFooter component with game controls and last draws
 * Only visible on larger screens (sm breakpoint and above)
 * Specific to Tabellone mode
 */
const TabelloneFooter = ({
  onReset,
  onReturnToStartPage,
}: TabelloneFooterProps) => {
  return (
    // Added fixed positioning, background, z-index, removed grid positioning
    <div className="fixed bottom-0 left-0 right-0 z-40 hidden md:flex bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-md">
      {/* Added container to constrain width */}
      <div className="w-full max-w-6xl mx-auto flex items-center p-3">
        {/* Paniere image and remaining count (desktop only) */}
        <div className="pr-3 flex-shrink-0 flex flex-col items-center">
          <img
            src="/images/paniere.png"
            alt=""
            className="h-16 w-16 object-contain"
            aria-hidden="true"
          />
          <div className="mt-1">
            <RemainingCount />
          </div>
        </div>

        {/* Main footer content */}
        <div className="flex-grow grid grid-cols-5 gap-3 h-full">
          <div className="col-span-3 h-full">
            <LastDraw />
          </div>
          <div className="col-span-2 h-full">
            <PaniereControls
              onReset={onReset}
              onReturnToStartPage={onReturnToStartPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabelloneFooter;
