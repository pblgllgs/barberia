export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Service {
  id: string
  name: string
  description: string | null
  duration_min: number
  price: number
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Barber {
  id: string
  name: string
  role: string | null
  specialty: string | null
  bio: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Schedule {
  id: string
  barber_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
  created_at: string
}

export interface Booking {
  id: string
  code: string
  client_name: string
  client_phone: string
  email: string | null
  service_id: string
  barber_id: string
  date: string
  start_time: string
  duration_min: number
  price: number
  status: BookingStatus
  notes: string | null
  created_at: string
}

export interface BookingWithRelations extends Booking {
  service: { name: string } | null
  barber: { name: string } | null
}

export interface BlockedSlot {
  id: string
  barber_id: string | null
  date: string
  start_time: string
  end_time: string
  reason: string | null
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'client' | null
  created_at: string
}