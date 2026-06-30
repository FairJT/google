export type UserRole = "client" | "artist" | "manager";

export interface Skill {
  name: string;
  category: string; // e.g. "رنگ مو", "ناخن", "میکاپ", "پوست"
}

export interface PortfolioItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number; // 1-5
  comment: string;
  date: string; // Shamsi format, e.g. "1405/04/10"
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email?: string;
  avatar: string;
  coverImage?: string;
  title: string; // e.g. "متخصص میکاپ عروس", "مدیر سالن لاوین"
  city: string; // e.g. "تهران", "اصفهان", "شیراز"
  bio: string;
  
  // Role-specific Rich Profile Data
  yearsOfExperience?: number;
  certifications?: string[];
  skills?: Skill[];
  portfolio?: PortfolioItem[];
  reviews?: Review[];
  rating?: number;
  
  // Toggles for availability
  acceptingRequests?: boolean; // پذیرش درخواست مشتری
  openForHiring?: boolean; // آماده به کار (for artists) or در حال استخدام (for managers)
  
  // For Salon Managers / Salons
  salonName?: string;
  salonLocation?: string;
  salonDescription?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  content: string;
  createdAt: string; // Shamsi or friendly time
  likesCount: number;
  likedBy: string[]; // User IDs who liked the comment
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  content: string;
  image?: string;
  tag?: string; // e.g. "آموزش", "تجربه", "استخدام", "ترند"
  createdAt: string; // Shamsi time
  likesCount: number;
  likedBy: string[]; // User IDs who liked the post
  comments: Comment[];
}

export interface HiringOffer {
  id: string;
  managerId: string;
  managerName: string;
  salonName: string;
  artistId: string;
  artistName: string;
  message: string;
  offerAmount?: string; // e.g., "۱۰,۰۰۰,۰۰۰ تومان"
  status: "pending" | "accepted" | "declined";
  createdAt: string; // Shamsi date
}

export interface ClientRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  targetId: string; // Artist or Salon ID
  targetName: string;
  targetType: "artist" | "salon";
  serviceType: string;
  preferredDate: string; // Shamsi, e.g. "1405/04/12"
  preferredTime: string; // HH:MM
  note: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string; // Shamsi date
}

export interface ProfileStrengthItem {
  label: string;
  points: number;
  completed: boolean;
}

export interface ProfileStrength {
  percentage: number;
  checklist: ProfileStrengthItem[];
}
