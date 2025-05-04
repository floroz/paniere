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
    <div className="row-start-2 row-end-3 col-span-full hidden md:flex p-3 border-t border-amber-100/50 dark:border-gray-700/50">
      <div className="w-full grid grid-cols-5 gap-3 h-full">
        <div className="col-span-3 h-full">
          <LastDraw />
        </div>
        <div className="col-span-2 h-full">
          <PaniereControls onReset={onReset} />
        </div>
      </div>
    </div>
  );
};

export default Footer;