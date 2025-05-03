
import { useState } from 'react';
import Tabellone from './components/Tabellone';
import Paniere from './components/Paniere';
import LastDraw from './components/LastDraw';
import LastDrawsModal from './components/LastDrawsModal';
import MobileFooter from './components/MobileFooter';
import { createPortal } from 'react-dom';

/**
 * Main App component that orchestrates the game layout and components
 */
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const PortalLastDrawsModal = createPortal(<LastDrawsModal isOpen={isModalOpen} onClose={handleCloseModal} />, document.body);
  
  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container max-w-6xl mx-auto px-3 py-4 h-screen flex flex-col">
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-shrink-0 overflow-auto">
            <Tabellone />
          </div>
          
          <div className="hidden sm:block mt-4 flex-shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <LastDraw />
              <Paniere />
            </div>
          </div>
        </div>
        
        <MobileFooter onOpenLastDraws={handleOpenModal} />
      </div>
    </div>
    {PortalLastDrawsModal}
    </>
  );
}

export default App
