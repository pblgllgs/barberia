import { supabase, isSupabaseConfigured } from './supabase'
import type { Service, Barber, Schedule, Booking, BlockedSlot, Coupon } from './types'
import { seedServices, seedBarbers, seedSchedules, seedBlockedSlots } from './seed'
import { dayOfWeek, fromMin, generateBookingCode, toMin } from './utils'

const DEMO_KEYS = {
  services: 'bn_services',
  barbers: 'bn_barbers',
  schedules: 'bn_schedules',
  blocked: 'bn_blocked',
  bookings: 'bn_bookings',
  coupons: 'bn_coupons',
}

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function saveLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

class DemoStore {
  get services() {
    return loadLocal<Service[]>(DEMO_KEYS.services, seedServices)
  }
  set services(v: Service[]) {
    saveLocal(DEMO_KEYS.services, v)
  }
  get barbers() {
    return loadLocal<Barber[]>(DEMO_KEYS.barbers, seedBarbers)
  }
  set barbers(v: Barber[]) {
    saveLocal(DEMO_KEYS.barbers, v)
  }
  get schedules() {
    return loadLocal<Schedule[]>(DEMO_KEYS.schedules, seedSchedules)
  }
  set schedules(v: Schedule[]) {
    saveLocal(DEMO_KEYS.schedules, v)
  }
  get blocked() {
    return loadLocal<BlockedSlot[]>(DEMO_KEYS.blocked, seedBlockedSlots)
  }
  set blocked(v: BlockedSlot[]) {
    saveLocal(DEMO_KEYS.blocked, v)
  }
  get bookings() {
    return loadLocal<Booking[]>(DEMO_KEYS.bookings, [])
  }
  set bookings(v: Booking[]) {
    saveLocal(DEMO_KEYS.bookings, v)
  }
  get coupons() {
    return loadLocal<Coupon[]>(DEMO_KEYS.coupons, [])
  }
  set coupons(v: Coupon[]) {
    saveLocal(DEMO_KEYS.coupons, v)
  }
}

const demo = new DemoStore()
const online = () => isSupabaseConfigured()

export async function getServices(): Promise<Service[]> {
  if (!online()) return demo.services.filter((s) => s.is_active)
  const { data, error } = await supabase.from('services').select('*').eq('is_active', true).order('sort_order')
  if (error) throw error
  return (data ?? []) as Service[]
}

export async function getBarbers(): Promise<Barber[]> {
  if (!online()) return demo.barbers.filter((b) => b.is_active)
  const { data, error } = await supabase.from('barbers').select('*').eq('is_active', true).order('sort_order')
  if (error) throw error
  return (data ?? []) as Barber[]
}

export async function getSchedules(): Promise<Schedule[]> {
  if (!online()) return demo.schedules
  const { data, error } = await supabase.from('schedules').select('*').eq('is_active', true)
  if (error) throw error
  return (data ?? []) as Schedule[]
}

export async function getBlockedSlots(): Promise<BlockedSlot[]> {
  if (!online()) return demo.blocked
  const { data, error } = await supabase.from('blocked_slots').select('*')
  if (error) throw error
  return (data ?? []) as BlockedSlot[]
}

export async function getBookings(): Promise<Booking[]> {
  if (!online()) return demo.bookings
  const { data, error } = await supabase.from('bookings').select('*').order('date', { ascending: true })
  if (error) throw error
  return (data ?? []) as Booking[]
}

export async function createBooking(
  input: Omit<Booking, 'id' | 'code' | 'status' | 'created_at' | 'user_id'> & { user_id?: string | null },
): Promise<Booking> {
  const record: Booking = {
    ...input,
    id: crypto.randomUUID(),
    code: generateBookingCode(),
    status: 'pending',
    user_id: input.user_id ?? null,
    created_at: new Date().toISOString(),
  }
  if (!online()) {
    demo.bookings = [...demo.bookings, record]
    return record
  }
  const { data, error } = await supabase
    .from('bookings')
    .insert({ ...input, user_id: record.user_id, code: record.code, status: 'pending' })
    .select()
    .single()
  if (error) throw error
  return (data ?? record) as Booking
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
  if (!online()) {
    demo.bookings = demo.bookings.map((b) => (b.id === id ? { ...b, status } : b))
    return
  }
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
  if (error) throw error
}

export async function deleteBooking(id: string): Promise<void> {
  if (!online()) {
    demo.bookings = demo.bookings.filter((b) => b.id !== id)
    return
  }
  const { error } = await supabase.from('bookings').delete().eq('id', id)
  if (error) throw error
}

export async function findBookingByCodeOrPhone(query: string, phone?: string): Promise<Booking[]> {
  if (!online()) {
    const q = query.trim().toUpperCase()
    return demo.bookings.filter(
      (b) =>
        b.code.toUpperCase() === q ||
        (phone && (b.client_phone.includes(phone) || b.client_name.includes(query.trim()))),
    )
  }
  const { data, error } = await supabase
    .rpc('bc_find_booking', { p_code: phone ? '' : query.trim(), p_phone: phone ?? '' })
  if (error) throw error
  return (data ?? []) as Booking[]
}

export async function cancelPublicBooking(id: string, code: string): Promise<void> {
  if (!online()) {
    demo.bookings = demo.bookings.map((b) =>
      b.id === id && b.code === code && b.status !== 'completed' && b.status !== 'cancelled' ? { ...b, status: 'cancelled' } : b,
    )
    return
  }
  const { error } = await supabase.rpc('bc_cancel_public', { p_booking_id: id, p_code: code })
  if (error) throw error
}

/* ---- Perfil de cliente + fidelidad ---- */

export async function getMyBookings(userId: string): Promise<Booking[]> {
  if (!online()) return demo.bookings.filter((b) => b.user_id === userId)
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) throw error
  return (data ?? []) as Booking[]
}

export async function getMyCoupons(userId: string): Promise<Coupon[]> {
  if (!online()) return demo.coupons.filter((c) => c.user_id === userId)
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Coupon[]
}

export async function redeemLoyalty(userId: string, serviceId: string): Promise<Coupon> {
  if (!online()) {
    const completed = demo.bookings.filter((b) => b.user_id === userId && b.status === 'completed').length
    const redeemed = demo.coupons
      .filter((c) => c.user_id === userId && c.status !== 'cancelled')
      .reduce((acc, c) => acc + c.redeemed_visits, 0)
    if (completed - redeemed < 10) throw new Error('Necesitas 10 visitas completadas para canjear tu beneficio')
    const coupon: Coupon = {
      id: crypto.randomUUID(),
      user_id: userId,
      code: `BN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      service_id: serviceId,
      redeemed_visits: 10,
      status: 'available',
      created_at: new Date().toISOString(),
      used_at: null,
    }
    demo.coupons = [...demo.coupons, coupon]
    return coupon
  }
  const { data, error } = await supabase.rpc('bc_redeem_loyalty', { p_service_id: serviceId })
  if (error) throw error
  return (data ?? {}) as Coupon
}

/* ---- Disponibilidad ---- */

export interface BookedRange {
  start_time: string
  duration_min: number
}

export async function getBookedSlots(barberId: string, date: string): Promise<BookedRange[]> {
  if (!online()) {
    return demo.bookings
      .filter((b) => b.barber_id === barberId && b.date === date && b.status !== 'cancelled')
      .map((b) => ({ start_time: b.start_time, duration_min: b.duration_min }))
  }
  const { data, error } = await supabase.rpc('bc_get_blocked', { p_barber: barberId, p_date: date })
  if (error) throw error
  return ((data ?? []) as Array<{ r_start: string; r_end: string }>)
    .map((r) => ({
      start_time: r.r_start.slice(0, 5),
      duration_min: toMin(r.r_end) - toMin(r.r_start),
    }))
    .filter((r) => r.duration_min > 0)
}

export async function saveService(input: Partial<Service> & { id?: string }): Promise<void> {
  if (!online()) {
    const list = demo.services
    if (input.id) {
      demo.services = list.map((s) => (s.id === input.id ? { ...s, ...input, id: s.id } : s))
    } else {
      const rec = { ...(seedServices[0] as Service), ...input, id: crypto.randomUUID() }
      demo.services = [...list, rec]
    }
    return
  }
  const { error } = input.id
    ? await supabase.from('services').update(input).eq('id', input.id)
    : await supabase.from('services').insert(input)
  if (error) throw error
}

export async function saveBarber(input: Partial<Barber> & { id?: string }): Promise<void> {
  if (!online()) {
    const list = demo.barbers
    if (input.id) {
      demo.barbers = list.map((b) => (b.id === input.id ? { ...b, ...input, id: b.id } : b))
    } else {
      const rec = { ...(seedBarbers[0] as Barber), ...input, id: crypto.randomUUID() }
      demo.barbers = [...list, rec]
    }
    return
  }
  const { error } = input.id
    ? await supabase.from('barbers').update(input).eq('id', input.id)
    : await supabase.from('barbers').insert(input)
  if (error) throw error
}

export async function saveSchedule(input: Omit<Schedule, 'id' | 'created_at'> & { id?: string }): Promise<void> {
  if (!online()) {
    const list = demo.schedules
    if (input.id) {
      demo.schedules = list.map((s) => (s.id === input.id ? { ...s, ...input, id: s.id } : s))
    } else {
      demo.schedules = [...list, { ...input, id: crypto.randomUUID(), created_at: new Date().toISOString() }]
    }
    return
  }
  const { error } = input.id
    ? await supabase.from('schedules').update(input).eq('id', input.id)
    : await supabase.from('schedules').insert(input)
  if (error) throw error
}

export async function deleteSchedule(id: string): Promise<void> {
  if (!online()) {
    demo.schedules = demo.schedules.filter((s) => s.id !== id)
    return
  }
  const { error } = await supabase.from('schedules').delete().eq('id', id)
  if (error) throw error
}

/* ---- Availability ---- */

export interface SlotInfo {
  time: string
  taken: boolean
}

export function computeAvailableSlots(
  date: string,
  duration: number,
  schedules: Schedule[],
  booked: BookedRange[],
  blocked: BlockedSlot[],
  barberId: string,
): SlotInfo[] {
  const dow = dayOfWeek(date)
  const windows = schedules.filter((s) => s.barber_id === barberId && s.day_of_week === dow)

  const bookedRanges = booked.map((b) => ({
    start: toMin(b.start_time),
    end: toMin(b.start_time) + b.duration_min,
  }))

  const blockedRanges = blocked
    .filter((bl) => (bl.barber_id === null || bl.barber_id === barberId) && (bl.date === date || bl.date === ''))
    .map((bl) => ({ start: toMin(bl.start_time), end: toMin(bl.end_time) }))

  const past = (time: string) => {
    const today = new Date().toISOString().slice(0, 10)
    if (date < today) return true
    if (date > today) return false
    return toMin(time) <= new Date().getHours() * 60 + new Date().getMinutes() + 45
  }

  const results: SlotInfo[] = []
  windows.forEach((w) => {
    let cursor = toMin(w.start_time)
    const end = toMin(w.end_time)
    while (cursor + duration <= end) {
      const slotEnd = cursor + duration
      const time = fromMin(cursor)
      const overlaps =
        bookedRanges.some((b) => cursor < b.end && slotEnd > b.start) ||
        blockedRanges.some((bl) => cursor < bl.end && slotEnd > bl.start) ||
        past(time)
      results.push({ time, taken: overlaps })
      cursor += duration
    }
  })

  return results.sort((a, b) => a.time.localeCompare(b.time))
}