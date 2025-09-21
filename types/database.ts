export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  role: 'client' | 'professionnel';
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  professional_id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  client_id: string;
  professional_id: string;
  offer_id: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'refused' | 'completed' | 'cancelled';
  price: number;
  created_at: string;
  updated_at: string;
}

export interface BlockedDate {
  id: string;
  professional_id: string;
  date: string;
  created_at: string;
}

export interface Portfolio {
  id: string;
  professional_id: string;
  url: string;
  type: 'image' | 'video';
  created_at: string;
}