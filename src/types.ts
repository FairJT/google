export interface Service {
  id: string;
  name: string;
  category: "Hair" | "Makeup" | "Nails" | "Skin";
  duration: number; // in minutes
  basePrice: number; // in USD
  popularity: number; // 1 to 10 scale
  description: string;
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviewCount: number;
  image: string;
  skills: { skill: string; percentage: number }[];
  verified: boolean;
  score: number; // Artist evaluation score (out of 100)
}

export interface Salon {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  image: string;
  description: string;
  services: Service[];
  verified: boolean;
}

export interface Booking {
  id: string;
  salonId: string;
  salonName: string;
  artistId: string;
  artistName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
  status: "Confirmed" | "Completed" | "Cancelled";
  createdAt: string;
  rating?: number;
  userPhone?: string;
  userName?: string;
}

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface DynamicPricingInfo {
  multiplier: number;
  finalPrice: number;
  demandLevel: "Low" | "Moderate" | "High" | "Surge";
  reason: string;
}

export interface AppUser {
  id: string;
  name: string;
  role: "client" | "admin" | "artist";
  phone?: string;
  avatar?: string;
  artistId?: string;
}

