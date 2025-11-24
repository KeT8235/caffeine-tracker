// 공통 타입 정의

export type StatusType = "safe" | "caution" | "high";

export interface CaffeineEntry {
  id: string;
  brand: string;
  drink: string;
  caffeine: number;
  timestamp: Date;
  menu_photo?: string;
  brand_photo?: string;
  menu_id?: number;
  temp?: string;
}

export interface Friend {
  id: number;
  name: string;
  initials: string;
  caffeineLevel: number;
  avatarColor: string;
  trend: "up" | "down" | "stable";
  lastDrink: string;
  rank?: number;
  avatar?: string;
  lastMessage?: string;
  streak?: number;
  isOnline?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  startDate: Date;
  endDate: Date;
  status: "active" | "completed" | "failed";
  reward?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: "text" | "caffeine" | "system";
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  dailyLimit: number;
  weight?: number;
  height?: number;
  birthDate?: Date;
  gender?: "male" | "female";
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

export interface SignupForm {
  id: string;
  password: string;
  name: string;
  birthDate: string;
  gender: "male" | "female" | "";
  weight_kg?: number;
}

// 화면 Props 타입
export interface ScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string) => void;
}

export interface DashboardScreenProps extends ScreenProps {
  onNavigate: (screen: string) => void;
}

export interface ChatScreenProps extends ScreenProps {
  friend: Friend;
  onBack: () => void;
}

export interface ProfileScreenProps extends ScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

// 유틸리티 타입
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
