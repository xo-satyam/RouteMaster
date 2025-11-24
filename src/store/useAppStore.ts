import { create } from 'zustand';

// Define types first
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
}

export interface Route {
  total_duration: number;
  total_distance: number;
  total_cost: number;
  steps: RouteStep[];
}

interface AppState {
  // Map State
  startLocation: Location | null;
  endLocation: Location | null;
  routes: Route[];
  
  // Actions
  setStartLocation: (location: Location) => void;
  setEndLocation: (location: Location) => void;
  setRoutes: (routes: Route[]) => void;
}

// Create the store
export const useAppStore = create<AppState>((set) => ({
  // Initial state
  startLocation: null,
  endLocation: null,
  routes: [],
  
  // Actions to update state
  setStartLocation: (location) => set({ startLocation: location }),
  setEndLocation: (location) => set({ endLocation: location }),
  setRoutes: (routes) => set({ routes }),
}));

// Add this empty export to make it a module
export {};