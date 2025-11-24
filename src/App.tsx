
import ResultsPanel from './components/Results/ResultsPanel';
import MapContainer from './components/Map/MapContainer';
import SimpleSearchPanel from './components/Search/SimpleSearchPanel';
import { useState } from 'react';
import { Location, Route, backendService } from './services/backendService';
import './App.css';
import './App.css';

function App() {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleRouteCalculate = async (start: Location, end: Location, preference: string) => {
    console.log('🚀 Starting route calculation...', { start, end, preference });
    
    setStartLocation(start);
    setEndLocation(end);
    setIsCalculating(true);
    setCurrentRoute(null);

    try {
      console.log('📡 Calling backend service...');
      const route = await backendService.calculateRoute(start, end, preference as any);
      console.log('✅ Route received from backend:', route);
      
      if (route && typeof route === 'object') {
        setCurrentRoute(route);
      } else {
        console.error('❌ Invalid route data received:', route);
        alert('Received invalid route data from server');
      }
    } catch (error) {
      console.error('❌ Route calculation failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to calculate route');
    } finally {
      setIsCalculating(false);
    }
  };

  // Add this close function
  const handleCloseResults = () => {
    console.log('🗑️ Closing results panel');
    setCurrentRoute(null);
  };

  return (
    <div className="App" style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      <SimpleSearchPanel 
        onRouteCalculate={handleRouteCalculate} 
        isCalculating={isCalculating}
      />
      <MapContainer 
        startLocation={startLocation}
        endLocation={endLocation}
        currentRoute={currentRoute}
      />
      <ResultsPanel 
        currentRoute={currentRoute} 
        isCalculating={isCalculating}
        onClose={handleCloseResults}
      />
    </div>
  );
}

export default App;