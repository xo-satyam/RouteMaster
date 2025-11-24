import axios from 'axios';

export interface RealLocation {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

export interface RealRouteStep {
  instruction: string;
  duration: number; // seconds
  distance: number; // meters
  transport_mode: 'walking' | 'bus' | 'metro' | 'bike' | 'train';
  line_name?: string;
  departure_time?: string;
  arrival_time?: string;
}

export interface RealRoute {
  total_duration: number;
  total_distance: number;
  total_cost: number;
  steps: RealRouteStep[];
  geometry: [number, number][]; // Coordinates for map display
}

class RealDataService {
  private nominatimBaseUrl = 'https://nominatim.openstreetmap.org/search';
  private graphhopperBaseUrl = 'https://graphhopper.com/api/1/route';
  private graphhopperKey = '227bea55-d929-4382-b273-0c38fd32dedb'; // Get free key from graphhopper.com

  // Search locations using OpenStreetMap Nominatim
  async searchLocations(query: string): Promise<RealLocation[]> {
    try {
      const response = await axios.get(this.nominatimBaseUrl, {
        params: {
          q: query,
          format: 'json',
          limit: 10,
          addressdetails: 1
        }
      });

      return response.data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        name: item.display_name,
        address: item.display_name
      }));
    } catch (error) {
      console.error('Location search error:', error);
      return [];
    }
  }

  // Get route using GraphHopper API (supports multi-modal)
  async calculateRoute(
    start: RealLocation, 
    end: RealLocation, 
    vehicle: string = 'foot'
  ): Promise<RealRoute | null> {
    try {
      const response = await axios.get(this.graphhopperBaseUrl, {
        params: {
          point: [`${start.lat},${start.lng}`, `${end.lat},${end.lng}`],
          vehicle: vehicle,
          points_encoded: false,
          key: this.graphhopperKey
        }
      });

      const data = response.data;
      const path = data.paths[0];

      if (!path) return null;

      // Extract coordinates for map display
      const geometry: [number, number][] = path.points.coordinates.map((coord: number[]) => 
        [coord[1], coord[0]] // Convert from [lng, lat] to [lat, lng]
      );

      // Convert GraphHopper response to our format
      const steps: RealRouteStep[] = path.instructions.map((instruction: any) => ({
        instruction: instruction.text,
        duration: instruction.time / 1000, // Convert ms to seconds
        distance: instruction.distance,
        transport_mode: this.mapVehicleToMode(vehicle)
      }));

      return {
        total_duration: path.time / 1000,
        total_distance: path.distance,
        total_cost: this.calculateCost(path.distance, vehicle),
        steps,
        geometry
      };
    } catch (error) {
      console.error('Route calculation error:', error);
      return null;
    }
  }

  private mapVehicleToMode(vehicle: string): RealRouteStep['transport_mode'] {
    switch (vehicle) {
      case 'foot': return 'walking';
      case 'bike': return 'bike';
      case 'car': return 'bus'; // Approximate car as bus for now
      default: return 'walking';
    }
  }

  private calculateCost(distance: number, vehicle: string): number {
    // Simple cost calculation - replace with real transit data later
    const distanceKm = distance / 1000;
    switch (vehicle) {
      case 'foot': return 0;
      case 'bike': return 0;
      case 'car': return distanceKm * 2; // ₹2 per km
      default: return distanceKm * 1.5;
    }
  }

  // Get current location
  async getCurrentLocation(): Promise<RealLocation | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Current Location'
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve(null);
        }
      );
    });
  }
}

export const realDataService = new RealDataService();