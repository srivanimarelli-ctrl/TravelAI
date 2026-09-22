export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export interface Waypoint {
  id: string;
  name: string;
  location: string;
  country: string;
  coordinates: { lat: number; lng: number };
  elevation: string;
  scenicRating: number;
  category: 'Mountain Pass' | 'Coastal Road' | 'Alpine Vista' | 'Forest Trail' | 'Desert Canyon';
  image: string;
  description: string;
  bestSeason: string;
  difficulty: 'Easy Scenic' | 'Intermediate Twisties' | 'Challenging Alpine';
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  waypointsCount: number;
  status: 'Planning' | 'Active' | 'Completed';
  coverImage: string;
  distanceKm: number;
  estimatedDuration: string;
  highlights: string[];
}
