
import Tabellone from './components/Tabellone';

function App() {
  // For now, we'll use an empty array for drawn numbers
  const drawnNumbers: number[] = [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Neapolitan Tombola</h1>
      <Tabellone drawnNumbers={drawnNumbers} />
    </div>
  )
}

export default App
