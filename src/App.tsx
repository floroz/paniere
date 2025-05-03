
import { useState } from 'react';
import Tabellone from './components/Tabellone';
import Paniere from './components/Paniere';
import LastDraw from './components/LastDraw';
import LastDrawsModal from './components/LastDrawsModal';
import { useGameStore } from './store/useGameStore';
import { createPortal } from 'react-dom';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const drawn = useGameStore((state) => state.drawn);
  const lastDrawn = drawn[drawn.length - 1];
  
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container max-w-6xl mx-auto px-3 py-4 h-screen flex flex-col">
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-shrink-0 overflow-hidden">
            <Tabellone />
          </div>
          
          <div className="hidden sm:block mt-4 flex-shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <LastDraw />
              <Paniere />
            </div>
          </div>
        </div>
        
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg p-3 z-40">
          <div className="flex justify-between items-center">
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              aria-label="Apri Tabellone"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && console.log('Open tabellone')}
            >
              Apri Tabellone
            </button>
            
            <div className="flex items-center space-x-3">
              {lastDrawn && (
                <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-900 px-2 py-1 rounded-md">
                  <span className="text-xs text-amber-700 dark:text-amber-300 mr-1">
                    Last:
                  </span>
                  <span className="text-xl font-bold text-amber-800 dark:text-amber-200">
                    {lastDrawn}
                  </span>
                </div>
              )}
              
              <button
                onClick={handleOpenModal}
                className="px-3 py-1 bg-amber-500 text-white rounded-md text-sm"
                aria-label="View last 3 draws"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOpenModal()}
              >
                Last 3
              </button>
            </div>
          </div>
        </div>
        
        {createPortal(<LastDrawsModal isOpen={isModalOpen} onClose={handleCloseModal} />, document.body)}
      </div>
    </div>
  )
}

export default App
