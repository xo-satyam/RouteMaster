import axios from 'axios';

// Use the correct backend IP address
const BASE_URL = 'http://192.168.0.147:8000'; // Updated to the correct IP
export interface Location {
  lat: number;
  lng: number;
  name?: string;
}

export interface RouteStep {
  instruction: string;
  duration: number;
  distance: number;
  transport_mode: string;
  cost?: number;
}

export interface Route {
  total_duration: number;
  total_distance: number;
  total_cost: number;
  steps: RouteStep[];
  geometry?: [number, number][];
}

export interface TransportMode {
  id: string;
  name: string;
  icon: string;
  description: string;
}

class BackendService {
  private api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
  });

  // Test backend connection
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      console.log('✅ Backend status:', response.data);
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      return false;
    }
  }

  // Calculate route using REAL backend
async calculateRoute(
  start: Location,
  end: Location,
  preference: 'fastest' | 'cheapest' | 'minimal_transfers' = 'fastest'
): Promise<Route> {
  try {
    console.log('🚀 Calculating route with backend...', {
      start,
      end,
      preference
    });

    const response = await this.api.post('/api/calculate-route', {
      start_lat: start.lat,
      start_lng: start.lng,
      end_lat: end.lat,
      end_lng: end.lng,
      preference: preference
    });

    console.log('✅ Raw response from backend:', response);
    console.log('✅ Response data:', response.data);
    
    // Ensure the response has the expected structure
    const routeData = response.data;
    
    if (!routeData) {
      throw new Error('Empty response from server');
    }
    
    // Check if it has the basic required fields
    if (typeof routeData.total_duration !== 'number' || 
        typeof routeData.total_distance !== 'number' ||
        typeof routeData.total_cost !== 'number') {
      console.warn('⚠️ Route data missing required fields:', routeData);
      // Try to fix the data structure
      const fixedRoute: Route = {
        total_duration: routeData.total_duration || 0,
        total_distance: routeData.total_distance || 0,
        total_cost: routeData.total_cost || 0,
        steps: Array.isArray(routeData.steps) ? routeData.steps : [],
        geometry: routeData.geometry || []
      };
      console.log('🛠️ Fixed route data:', fixedRoute);
      return fixedRoute;
    }
    
    return routeData;
  } catch (error: any) {
    console.error('❌ Route calculation failed:', error);
    
    if (error.response) {
      console.error('Backend response error:', error.response.data);
      throw new Error(`Backend error: ${error.response.data.detail || JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error('Cannot connect to backend server. Please make sure it is running on 192.168.0.147:8000');
    } else {
      throw new Error('Failed to calculate route. Please try again.');
    }
  }
}

  // Get available transport modes from backend
  async getTransportModes(): Promise<TransportMode[]> {
    try {
      const response = await this.api.get('/api/transport-modes');
      console.log('✅ Transport modes:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transport modes:', error);
      // Fallback to default transport modes
      return [
        { id: 'metro', name: 'Metro', icon: '🚇', description: 'Delhi Metro' },
        { id: 'bus', name: 'Bus', icon: '🚌', description: 'DTC Bus' },
        { id: 'walking', name: 'Walking', icon: '🚶', description: 'Walk' }
      ];
    }
  }

  // Search locations using backend search endpoint
  async searchLocations(query: string): Promise<Location[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      console.log('🔍 Searching locations:', query);
      
      // First try backend search
      const response = await this.api.get('/api/search-locations', {
        params: { q: query }
      });

      console.log('✅ Backend search results:', response.data);
      return response.data;

    } catch (error) {
      console.log('🔄 Backend search failed, using OpenStreetMap fallback');
      
      // Fallback to OpenStreetMap
      try {
        const osmResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: query + ', Delhi, India',
            format: 'json',
            limit: 8,
            addressdetails: 1,
            'accept-language': 'en'
          },
          timeout: 5000
        });

        const locations: Location[] = osmResponse.data.map((item: any) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          name: item.display_name
        }));

        return locations;
      } catch (osmError) {
        console.error('Both search methods failed:', osmError);
        return this.getMockLocations(query);
      }
    }
  }

  // Get sample locations from backend for testing
async getSampleLocations(): Promise<Location[]> {
  try {
    const response = await this.api.get('/api/sample-locations');
    console.log('📊 Raw sample locations response:', response.data);
    
    // Handle different response formats
    let locations = response.data;
    
    if (Array.isArray(locations)) {
      return locations;
    } else if (locations && typeof locations === 'object') {
      // Try common response formats
      if (Array.isArray(locations.locations)) return locations.locations;
      if (Array.isArray(locations.data)) return locations.data;
      if (Array.isArray(locations.results)) return locations.results;
      
      // If it's a single object with lat/lng, wrap in array
      if (locations.lat && locations.lng) {
        return [locations];
      }
    }
    
    console.warn('Unexpected sample locations format, using defaults');
    return this.getDefaultSampleLocations();
  } catch (error) {
    console.error('Failed to fetch sample locations:', error);
    return this.getDefaultSampleLocations();
  }
}

  // Mock data fallbacks
  private getMockLocations(query: string): Location[] {
    const allLocations: Location[] = [
      { lat: 28.6129, lng: 77.2295, name: 'India Gate, New Delhi' },
      { lat: 28.6328, lng: 77.2197, name: 'Connaught Place, New Delhi' },
      { lat: 28.6514, lng: 77.1909, name: 'Karol Bagh, New Delhi' },
      { lat: 28.5450, lng: 77.1925, name: 'IIT Delhi, New Delhi' },
      { lat: 28.7041, lng: 77.1025, name: 'Delhi University, North Campus' },
      { lat: 28.5545, lng: 77.2567, name: 'Hauz Khas, New Delhi' },
      { lat: 28.6692, lng: 77.2311, name: 'Red Fort, Old Delhi' },
      { lat: 28.5246, lng: 77.2065, name: 'Qutub Minar, Mehrauli' }
    ];

    const searchTerm = query.toLowerCase();
    return allLocations.filter(location => 
      location.name?.toLowerCase().includes(searchTerm)
    ).slice(0, 8);
  }

  private getDefaultSampleLocations(): Location[] {
    return [
      { lat: 28.6328, lng: 77.2197, name: 'Connaught Place' },
      { lat: 28.5450, lng: 77.1925, name: 'IIT Delhi' },
      { lat: 28.6514, lng: 77.1909, name: 'Karol Bagh' },
      { lat: 28.6129, lng: 77.2295, name: 'India Gate' },
      { lat: 28.7041, lng: 77.1025, name: 'Delhi University' },
      { lat: 28.5545, lng: 77.2567, name: 'Hauz Khas' },
      { lat: 28.5246, lng: 77.2065, name: 'Qutub Minar' },
      { lat: 28.6692, lng: 77.2311, name: 'Red Fort' }
    ];
  }

  // Get current location
  async getCurrentLocation(): Promise<Location | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser.');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Current Location'
          };
          console.log('📍 Current location:', location);
          resolve(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve(null);
        },
        { 
          timeout: 10000,
          enableHighAccuracy: true 
        }
      );
    });
  }

  // Get backend information
  async getBackendInfo() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Cannot connect to backend at 192.168.0.147:8000');
    }
  }
}

export const backendService = new BackendService();