import React from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Location, Route } from '../../services/backendService';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers - create custom icons
const startIcon = new L.DivIcon({
  html: `<div style="background-color: #28a745; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const endIcon = new L.DivIcon({
  html: `<div style="background-color: #dc3545; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface MapProps {
  startLocation: Location | null;
  endLocation: Location | null;
  currentRoute: Route | null;
}

const MapContainer: React.FC<MapProps> = ({ startLocation, endLocation, currentRoute }) => {
  const getMapCenter = (): [number, number] => {
    if (startLocation) return [startLocation.lat, startLocation.lng];
    return [28.6139, 77.2090]; // Default to Delhi
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <LeafletMap
        center={getMapCenter()}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Start Marker */}
        {startLocation && (
          <Marker 
            position={[startLocation.lat, startLocation.lng]} 
            icon={startIcon}
          >
            <Popup>
              <div>
                <strong>Start: {startLocation.name?.split(',')[0]}</strong>
                <br />
                <small>{startLocation.name}</small>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* End Marker */}
        {endLocation && (
          <Marker 
            position={[endLocation.lat, endLocation.lng]} 
            icon={endIcon}
          >
            <Popup>
              <div>
                <strong>Destination: {endLocation.name?.split(',')[0]}</strong>
                <br />
                <small>{endLocation.name}</small>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Route Line */}
        {currentRoute && startLocation && endLocation && (
          <Polyline 
            positions={[
              [startLocation.lat, startLocation.lng],
              [endLocation.lat, endLocation.lng]
            ]}
            color="#007bff"
            weight={6}
            opacity={0.8}
          />
        )}
      </LeafletMap>
    </div>
  );
};

export default MapContainer;