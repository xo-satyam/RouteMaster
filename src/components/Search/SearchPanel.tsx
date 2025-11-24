import React, { useState, useEffect } from 'react';
import { Location, backendService } from '../../services/backendService';
import { Search, MapPin, Navigation, Zap, DollarSign, RefreshCw } from 'lucide-react';

interface SearchPanelProps {
  onRouteCalculate: (start: Location, end: Location, preference: string) => void;
  isCalculating: boolean;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onRouteCalculate, isCalculating }) => {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [startSuggestions, setStartSuggestions] = useState<Location[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<Location[]>([]);
  const [preference, setPreference] = useState<'fastest' | 'cheapest' | 'minimal_transfers'>('fastest');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Check backend connection
  useEffect(() => {
    const checkBackend = async () => {
      const isConnected = await backendService.checkHealth();
      setBackendStatus(isConnected ? 'connected' : 'error');
    };
    checkBackend();
  }, []);

  // Location search with debounce
  useEffect(() => {
    if (startInput.length > 2) {
      const timer = setTimeout(async () => {
        const results = await backendService.searchLocations(startInput);
        setStartSuggestions(results);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setStartSuggestions([]);
    }
  }, [startInput]);

  useEffect(() => {
    if (endInput.length > 2) {
      const timer = setTimeout(async () => {
        const results = await backendService.searchLocations(endInput);
        setEndSuggestions(results);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setEndSuggestions([]);
    }
  }, [endInput]);

  const handleCurrentLocation = async () => {
    const location = await backendService.getCurrentLocation();
    if (location) {
      setStartLocation(location);
      setStartInput('Current Location');
    }
  };

  const handleLocationSelect = (location: Location, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartLocation(location);
      setStartInput(location.name || 'Selected Location');
      setStartSuggestions([]);
    } else {
      setEndLocation(location);
      setEndInput(location.name || 'Selected Location');
      setEndSuggestions([]);
    }
  };

  const handleSearch = () => {
    if (startLocation && endLocation) {
      onRouteCalculate(startLocation, endLocation, preference);
    } else {
      alert('Please select both start and end locations');
    }
  };

  const renderSuggestions = (suggestions: Location[], type: 'start' | 'end') => (
    <div className="suggestions-container">
      {suggestions.map((location, index) => (
        <div
          key={index}
          className="suggestion-item"
          onClick={() => handleLocationSelect(location, type)}
        >
          <MapPin size={16} className="suggestion-icon" />
          <div className="suggestion-text">
            <div className="suggestion-primary">{location.name?.split(',')[0]}</div>
            <div className="suggestion-secondary">
              {location.name?.split(',').slice(1).join(',').trim()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const sampleLocations: Location[] = [
    { lat: 28.6328, lng: 77.2197, name: 'Connaught Place, Delhi' },
    { lat: 28.5450, lng: 77.1925, name: 'IIT Delhi' },
    { lat: 28.6514, lng: 77.1909, name: 'Karol Bagh, Delhi' },
    { lat: 28.6129, lng: 77.2295, name: 'India Gate, Delhi' }
  ];

  return (
    <div className="search-panel glass-panel">
      {/* Header */}
      <div className="search-header">
        <div className="logo-section">
          <div className="logo-icon">
            <Search size={28} />
          </div>
          <div>
            <h1 className="app-title">RouteMaster</h1>
            <p className="app-subtitle">Smart Multi-Modal Journey Planner</p>
          </div>
        </div>
        <div className={`status-badge ${backendStatus}`}>
          {backendStatus === 'connected' ? '🟡 Demo Mode' : '🟢 Live'}
        </div>
      </div>

      {/* Location Inputs */}
      <div className="input-section">
        <div className="input-group">
          <label className="input-label">Start Location</label>
          <div className="input-container">
            <input
              type="text"
              placeholder="Where are you starting from?"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              className="location-input"
            />
            <button 
              onClick={handleCurrentLocation}
              className="location-button"
              title="Use current location"
            >
              <Navigation size={18} />
            </button>
          </div>
          {startSuggestions.length > 0 && renderSuggestions(startSuggestions, 'start')}
        </div>

        <div className="input-group">
          <label className="input-label">Destination</label>
          <input
            type="text"
            placeholder="Where do you want to go?" 
            value={endInput}
            onChange={(e) => setEndInput(e.target.value)}
            className="location-input"
          />
          {endSuggestions.length > 0 && renderSuggestions(endSuggestions, 'end')}
        </div>
      </div>

      {/* Route Preferences */}
      <div className="preference-section">
        <label className="section-label">Route Preference</label>
        <div className="preference-buttons">
          {[
            { 
              id: 'fastest' as const, 
              label: 'Fastest', 
              icon: <Zap size={16} />,
              description: 'Quickest journey time'
            },
            { 
              id: 'cheapest' as const, 
              label: 'Cheapest', 
              icon: <DollarSign size={16} />,
              description: 'Lowest cost'
            },
            { 
              id: 'minimal_transfers' as const, 
              label: 'Fewest Transfers', 
              icon: <RefreshCw size={16} />,
              description: 'Minimal mode changes'
            }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setPreference(option.id)}
              className={`preference-button ${preference === option.id ? 'active' : ''}`}
            >
              <div className="preference-icon">{option.icon}</div>
              <div className="preference-text">
                <div className="preference-label">{option.label}</div>
                <div className="preference-desc">{option.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Locations */}
      <div className="quick-locations-section">
        <label className="section-label">Popular Delhi Locations</label>
        <div className="quick-locations">
          {sampleLocations.map((location, index) => (
            <button
              key={index}
              onClick={() => handleLocationSelect(location, 'end')}
              className="quick-location-button"
            >
              {location.name?.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Search Button */}
      <button 
        onClick={handleSearch}
        disabled={!startLocation || !endLocation || isCalculating}
        className={`search-button ${isCalculating ? 'calculating' : ''}`}
      >
        {isCalculating ? (
          <>
            <div className="loading-spinner"></div>
            Calculating Route...
          </>
        ) : (
          'Find Optimal Route'
        )}
      </button>
    </div>
  );
};

export default SearchPanel;