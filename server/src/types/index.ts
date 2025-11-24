export interface Member {
  member_id: number;
  username: string;
  password: string;
  name: string;
  point: number;
}

export interface MemberCaffeine {
  member_id: number;
  age: string; // DATE stored as string
  weight_kg: number;
  gender: "남자" | "여자";
  current_caffeine: number;
  max_caffeine: number;
  updated_at: string;
}

export interface Brand {
  brand_id: number;
  brand_name: string;
}

export interface Menu {
  menu_id: number;
  brand_id: number;
  menu_name: string;
  category: "coffee" | "decaf";
  size: "small" | "regular" | "large";
  caffeine_mg: number;
  menu_photo?: string;
  temp?: string;
}

export interface CaffeineHistory {
  history_id: number;
  member_id: number;
  menu_id: number | null;
  brand_name: string;
  menu_name: string;
  caffeine_mg: number;
  drinked_at: string;
}

export interface SignupRequest {
  username: string;
  password: string;
  name: string;
  birthDate: string;
  gender: "남자" | "여자";
  weight_kg?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AddCaffeineRequest {
  menu_id?: number;
  brand_name: string;
  menu_name: string;
  caffeine_mg: number;
  temp?: string;
  menu_photo?: string;
}
