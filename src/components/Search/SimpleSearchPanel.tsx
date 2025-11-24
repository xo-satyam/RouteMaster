import React, { useState, useEffect, useRef } from 'react';
import { Location, backendService } from '../../services/backendService';
import { Search, MapPin, Navigation, Zap, DollarSign, RefreshCw, Route, Loader, ChevronRight, Clock, Users } from 'lucide-react';
import './SearchPanel.css';

interface SearchPanelProps {
  onRouteCalculate: (start: Location, end: Location, preference: string) => void;
  isCalculating: boolean;
}

const SimpleSearchPanel: React.FC<SearchPanelProps> = ({ onRouteCalculate, isCalculating }) => {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [startSuggestions, setStartSuggestions] = useState<Location[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<Location[]>([]);
  const [preference, setPreference] = useState<'fastest' | 'cheapest' | 'minimal_transfers'>('fastest');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearch, setActiveSearch] = useState<'start' | 'end' | null>(null);
  const [sampleLocations, setSampleLocations] = useState<Location[]>([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);

  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const ensureArray = (data: any): Location[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') {
      if (data.locations && Array.isArray(data.locations)) return data.locations;
      if (data.data && Array.isArray(data.data)) return data.data;
      if (data.results && Array.isArray(data.results)) return data.results;
      if (data.lat && data.lng) return [data];
    }
    return [];
  };

  useEffect(() => {
    const initializeBackend = async () => {
      try {
        const isConnected = await backendService.checkHealth();
        setBackendStatus(isConnected ? 'connected' : 'error');
        setSampleLocations(getDefaultLocations());
      } catch (error) {
        setBackendStatus('error');
        setSampleLocations(getDefaultLocations());
      }
    };
    
    initializeBackend();
  }, []);

  const getDefaultLocations = (): Location[] => {
    return [
      { lat: 28.6328, lng: 77.2197, name: 'Connaught Place' },
      { lat: 28.5450, lng: 77.1925, name: 'IIT Delhi' },
      { lat: 28.6514, lng: 77.1909, name: 'Karol Bagh' },
      { lat: 28.6129, lng: 77.2295, name: 'India Gate' },
      { lat: 28.7041, lng: 77.1025, name: 'Delhi University' },
      { lat: 28.5545, lng: 77.2567, name: 'Hauz Khas' }
    ];
  };

  useEffect(() => {
    if (startInput.length < 2) {
      setStartSuggestions([]);
      setShowStartSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await backendService.searchLocations(startInput);
        const safeResults = ensureArray(results);
        setStartSuggestions(safeResults);
        setShowStartSuggestions(true);
      } catch (error) {
        setStartSuggestions([]);
        setShowStartSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [startInput]);

  useEffect(() => {
    if (endInput.length < 2) {
      setEndSuggestions([]);
      setShowEndSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await backendService.searchLocations(endInput);
        const safeResults = ensureArray(results);
        setEndSuggestions(safeResults);
        setShowEndSuggestions(true);
      } catch (error) {
        setEndSuggestions([]);
        setShowEndSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [endInput]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowStartSuggestions(false);
        setShowEndSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCurrentLocation = async () => {
    try {
      const location = await backendService.getCurrentLocation();
      if (location) {
        setStartLocation(location);
        setStartInput(location.name || 'Current Location');
        setShowStartSuggestions(false);
      }
    } catch (error) {
      alert('Unable to get your current location. Please enable location services.');
    }
  };

  const handleLocationSelect = (location: Location, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartLocation(location);
      setStartInput(location.name || 'Selected Location');
      setShowStartSuggestions(false);
    } else {
      setEndLocation(location);
      setEndInput(location.name || 'Selected Location');
      setShowEndSuggestions(false);
    }
  };

  const handleSearch = () => {
    if (startLocation && endLocation) {
      onRouteCalculate(startLocation, endLocation, preference);
    } else {
      alert('Please select both start and end locations');
    }
  };

  const handleInputFocus = (type: 'start' | 'end') => {
    setActiveSearch(type);
    if (type === 'start' && startSuggestions.length > 0) {
      setShowStartSuggestions(true);
    }
    if (type === 'end' && endSuggestions.length > 0) {
      setShowEndSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setActiveSearch(null);
    }, 200);
  };

  const renderSuggestions = (suggestions: Location[], type: 'start' | 'end', show: boolean) => {
    if (!show) return null;
    
    return (
      <div 
        ref={suggestionsRef}
        className="suggestions-container"
        style={{ display: show ? 'block' : 'none' }}
      >
        {isSearching && activeSearch === type ? (
          <div className="search-loading">
            <Loader size={16} className="loading-spinner" />
            <span>Searching locations...</span>
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((location, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleLocationSelect(location, type)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <MapPin size={16} className="suggestion-icon" />
              <div className="suggestion-text">
                <div className="suggestion-primary">
                  {location.name?.split(',')[0]}
                </div>
                <div className="suggestion-secondary">
                  {location.name?.split(',').slice(1, 3).join(',').trim()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No locations found
          </div>
        )}
      </div>
    );
  };

  const preferenceOptions = [
    { 
      id: 'fastest' as const, 
      label: 'Fastest', 
      icon: <Zap size={16} />,
      description: 'Quickest route',
      color: '#10b981'
    },
    { 
      id: 'cheapest' as const, 
      label: 'Cheapest', 
      icon: <DollarSign size={16} />,
      description: 'Lowest cost',
      color: '#f59e0b'
    },
    { 
      id: 'minimal_transfers' as const, 
      label: 'Fewest Transfers', 
      icon: <Users size={16} />,
      description: 'Less changes',
      color: '#8b5cf6'
    }
  ];

  const safeSampleLocations = Array.isArray(sampleLocations) ? sampleLocations : getDefaultLocations();

  return (
    <div className="modern-search-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="header-main">
          <div className="logo-section">
            <div className="logo-icon">
              <Route size={24} />
            </div>
            <div className="header-text">
              <h1 className="app-title">RouteMaster</h1>
              <p className="app-subtitle">Plan your perfect journey</p>
            </div>
          </div>
          <div className={`status-badge ${backendStatus}`}>
            <div className="status-dot"></div>
            {backendStatus === 'connected' ? 'Demo' : 'Live'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="panel-content">
        {/* Journey Input Section */}
        <div className="journey-section">
          <div className="input-group start-input">
            <div className="input-header">
              <span className="input-label">From</span>
              <button 
                onClick={handleCurrentLocation}
                className="location-btn"
                title="Use current location"
                type="button"
              >
                <Navigation size={14} />
                Current
              </button>
            </div>
            <div className="input-wrapper">
              <input
                ref={startInputRef}
                type="text"
                placeholder="Enter start location..."
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                onFocus={() => handleInputFocus('start')}
                onBlur={handleInputBlur}
                className="modern-input"
              />
            </div>
            {renderSuggestions(startSuggestions, 'start', showStartSuggestions)}
          </div>

          <div className="input-separator">
            <div className="separator-line"></div>
            <div className="separator-icon">
              <ChevronRight size={16} />
            </div>
          </div>

          <div className="input-group end-input">
            <div className="input-header">
              <span className="input-label">To</span>
            </div>
            <div className="input-wrapper">
              <input
                ref={endInputRef}
                type="text"
                placeholder="Enter destination..." 
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
                onFocus={() => handleInputFocus('end')}
                onBlur={handleInputBlur}
                className="modern-input"
              />
            </div>
            {renderSuggestions(endSuggestions, 'end', showEndSuggestions)}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3 className="section-title">Popular Destinations</h3>
          <div className="locations-grid">
            {safeSampleLocations.map((location, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect(location, 'end')}
                className="location-pill"
                type="button"
              >
                <MapPin size={12} />
                {location.name?.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="preferences-section">
          <h3 className="section-title">Travel Preference</h3>
          <div className="preferences-grid">
            {preferenceOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setPreference(option.id)}
                className={`preference-pill ${preference === option.id ? 'active' : ''}`}
                style={{ '--accent-color': option.color } as React.CSSProperties}
                type="button"
              >
                <div className="pill-icon">
                  {option.icon}
                </div>
                <span className="pill-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <button 
          onClick={handleSearch}
          disabled={!startLocation || !endLocation || isCalculating}
          className={`search-cta ${isCalculating ? 'calculating' : ''}`}
          type="button"
        >
          {isCalculating ? (
            <>
              <div className="cta-spinner"></div>
              <span>Finding Best Route...</span>
            </>
          ) : (
            <>
              <Search size={18} />
              <span>Find Route</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SimpleSearchPanel;