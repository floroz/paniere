import LastDraw from "../LastDraw";
import PaniereControls from "../Paniere/PaniereControls";

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
const TabelloneFooter = ({ onReset, onReturnToStartPage }: TabelloneFooterProps) => {
  return (
    <div className="row-start-2 row-end-3 col-span-full hidden md:flex p-3 border-t border-amber-100/50 dark:border-gray-700/50">
      <div className="w-full flex items-center">
        {/* Paniere image (desktop only) */}
        <div className="pr-3 flex-shrink-0">
          <img 
            src="/images/paniere.png" 
            alt="" 
            className="h-16 w-16 object-contain" 
            aria-hidden="true" 
          />
        </div>
        
        {/* Main footer content */}
        <div className="flex-grow grid grid-cols-5 gap-3 h-full">
          <div className="col-span-3 h-full">
            <LastDraw />
          </div>
          <div className="col-span-2 h-full">
            <PaniereControls onReset={onReset} onReturnToStartPage={onReturnToStartPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabelloneFooter;
