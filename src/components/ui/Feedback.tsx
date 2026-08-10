export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-line-strong border-t-brass ${className}`}
      aria-label="Cargando"
      role="status"
    />
  )
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="card-surface flex flex-col items-center justify-center gap-1 px-6 py-16 text-center">
      <span className="text-3xl">✂️</span>
      <h3 className="font-display mt-2 text-xl">{title}</h3>
      {detail && <p className="text-sm text-ash">{detail}</p>}
    </div>
  )
}