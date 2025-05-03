import { useState } from "react";
import Tabellone from "./components/Tabellone";
import LastDrawsModal from "./components/LastDrawsModal";
import MobileFooter from "./components/MobileFooter";
import Footer from "./components/Footer";

/**
 * Desktop layout component that displays the tabellone and footer
 */
function DesktopLayout(){
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container max-w-6xl h-screen grid grid-cols-1 grid-rows-[85%_15%] overflow-hidden">
        <div className="row-start-1 row-end-2 col-span-full overflow-auto">
          <Tabellone />
        </div>
        <Footer />
      </div>
    </div>
  );
}

/**
 * Main App component that orchestrates the game layout and components
 */
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <DesktopLayout />
        <MobileFooter onOpenLastDraws={handleOpenModal} />
      </div>
      <LastDrawsModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}

export default App;
