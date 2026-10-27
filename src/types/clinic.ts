export interface Service {
  id: string;
  name: string;
  category: 'Sobrancelhas' | 'Estética Facial' | 'Cabelo' | 'Unhas' | 'Corporal & Massagem' | 'Combos Especiais';
  durationMinutes: number;
  price: number;
  description: string;
  popular?: boolean;
}

export interface DaySchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayName: string;
  isOpen: boolean;
  openTime: string; // "08:30"
  closeTime: string; // "19:30"
  lunchStart: string; // "12:30"
  lunchEnd: string; // "13:30"
}

export interface Specialist {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  specialties: string[];
}

export interface Appointment {
  id: string;
  code: string; // e.g. "TC-8492"
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  specialistId: string;
  specialistName: string;
  services: Service[];
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  totalMinutes: number;
  totalPrice: number;
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending';
  notes?: string;
  createdAt: string;
  bookedViaSocial?: 'google' | 'facebook' | 'apple' | 'direct' | 'guest';
  reminderSent24h?: boolean;
  reminderSent24hAt?: string;
}

export interface ClinicSettings {
  name: string;
  tagline: string;
  address: string;
  neighborhood: string;
  city: string;
  phoneWhatsapp: string;
  instagram: string;
  slotIntervalMinutes: number; // e.g. 15 or 30 mins
  autoReminder24hEnabled: boolean;
  reminderHoursAhead: number; // 24
}

export interface ClientProfile {
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  provider?: 'google' | 'facebook' | 'apple' | 'guest';
}

