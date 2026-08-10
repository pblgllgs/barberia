import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost' | 'mono'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-200 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed select-none border'

const variants: Record<Variant, string> = {
  primary: 'bg-brass text-carbon border-transparent hover:bg-champagne',
  outline: 'border-line-strong text-ivory hover:border-brass hover:text-brass',
  ghost: 'border-transparent text-ash hover:text-ivory',
  mono: 'font-mono text-xs tracking-[0.12em] uppercase bg-transparent border-line text-brass hover:border-brass',
}

const sizes: Record<Size, string> = {
  sm: 'text-[13px] px-4 py-2',
  md: 'text-sm px-7 py-3.5',
  lg: 'text-[15px] px-9 py-4',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: Props) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  )
}