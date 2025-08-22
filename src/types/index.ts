// Kullanıcı tipleri
export interface User {
  id: number;
  name: string;
  email: string;
  user_type: 'customer' | 'business';
}

// İşletme tipleri
export interface Business {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

// Randevu tipleri
export interface Appointment {
  id: number;
  customer_id: number;
  business_id: number;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Çalışma saatleri tipleri
export interface BusinessHour {
  id: number;
  business_id: number;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_working_day: boolean;
}

// API Response tipleri
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// İstatistik tipleri
export interface Stats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  completed?: number;
}
