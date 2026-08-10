import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react'

const controlBase =
  'w-full bg-smoke border border-line rounded-md px-3.5 py-3 text-ivory text-[15px] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-faint focus:border-brass focus:shadow-[0_0_0_3px_rgba(201,163,95,0.15)]'

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label-mono mb-2 block">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-faint">{hint}</span>}
    </label>
  )
}

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${controlBase} ${className}`} {...rest} />
}

export function Select({ className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`${controlBase} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%228%22%3E%3Cpath%20fill%3D%22%238a8579%22%20d%3D%22M6%208%200%200h12z%22%2F%3E%3C%2Fsvg%3E')] bg-[right_14px_center] bg-no-repeat pr-10 ${className}`}
      {...rest}
    />
  )
}

export function Textarea({ className = '', ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${controlBase} min-h-24 resize-y ${className}`} {...rest} />
}