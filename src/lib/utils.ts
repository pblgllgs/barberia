import type { Booking } from './types'

export function formatPrice(n: number): string {
  return `$${n.toLocaleString('es-CL')}`
}

const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
export const DAY_NAMES = days

export function dayOfWeek(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00`).getDay()
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`)
  return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function todayStr(): string {
  const d = new Date()
  return toISODate(d)
}

export function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T12:00:00`)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function toMin(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function fromMin(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let s = 'BN-'
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

export function isPastSlot(dateStr: string, time: string): boolean {
  const today = todayStr()
  if (dateStr < today) return true
  if (dateStr > today) return false
  const [h, m] = time.split(':').map(Number)
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  return h * 60 + m <= nowMin
}

export const statusLabels: Record<Booking['status'], string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
}