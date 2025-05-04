import LastDraw from "../LastDraw";
import Paniere from "../Paniere";

interface FooterProps {
  onReset: () => void;
}

/**
 * Footer component with game controls and last draws
 * Only visible on larger screens (sm breakpoint and above)
 */
const Footer = ({ onReset }: FooterProps) => {
  return (
    <div className="row-start-2 row-end-3 col-span-full hidden sm:flex p-3 bg-gradient-to-r from-amber-50/50 to-white/80 dark:from-gray-800/50 dark:to-gray-900/80 backdrop-blur-sm border-t border-amber-100 dark:border-gray-700 shadow-inner">
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 h-full">
        <div className="md:col-span-1 h-full">
          <LastDraw />
        </div>
        <div className="md:col-span-2 h-full">
          <Paniere onReset={onReset} />
        </div>
      </div>
    </div>
  );
};

export default Footer;