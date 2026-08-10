import type { ReactNode } from 'react'

const toneClass: Record<string, string> = {
  success: 'bg-success/14 text-success',
  warning: 'bg-warning/14 text-warning',
  error: 'bg-error/14 text-error',
  info: 'bg-info/14 text-info',
  neutral: 'bg-line/40 text-ash',
}

export default function Badge({ tone = 'neutral', children }: { tone?: keyof typeof toneClass; children: ReactNode }) {
  return (
    <span className={`inline-block font-mono text-[10.5px] uppercase tracking-[0.1em] rounded-full px-2.5 py-1 ${toneClass[tone]}`}>
      {children}
    </span>
  )
}

export function toneFromStatus(status: string): keyof typeof toneClass {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'error'
    case 'completed':
      return 'info'
    default:
      return 'neutral'
  }
}