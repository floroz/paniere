
import Tabellone from './components/Tabellone';
import Paniere from './components/Paniere';
import LastDraw from './components/LastDraw';
import { useGameStore } from './store/useGameStore';

function App() {
  const settings = useGameStore((state) => state.settings);

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'dark' : ''}`}>
      <div className="container mx-auto px-4 py-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl font-bold mb-6">Neapolitan Tombola</h1>
        <Tabellone />
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <LastDraw />
          <Paniere />
        </div>
        
        {/* Mobile sticky footer */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg p-4">
          <div className="flex justify-between items-center">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
              Apri Tabellone
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
