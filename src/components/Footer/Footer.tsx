import LastDraw from "../LastDraw";
import PaniereControls from "../Paniere/PaniereControls";

interface FooterProps {
  onReset: () => void;
}

/**
 * Footer component with game controls and last draws
 * Only visible on larger screens (sm breakpoint and above)
 */
const Footer = ({ onReset }: FooterProps) => {
  return (
    <div className="row-start-2 row-end-3 col-span-full hidden sm:flex p-3 border-t border-amber-100/50 dark:border-gray-700/50">
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 h-full">
        <div className="md:col-span-1 h-full">
          <LastDraw />
        </div>
        <div className="md:col-span-2 h-full">
          <PaniereControls onReset={onReset} />
        </div>
      </div>
    </div>
  );
};

export default Footer;