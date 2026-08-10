import { ChevronLeft, ChevronRight } from 'lucide-react'

function pageItems(current: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: Array<number | '…'> = [1]
  if (current > 3) pages.push('…')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}

export default function Pagination({
  page,
  total,
  pageSize,
  onPageChange,
}: {
  page: number
  total: number
  pageSize: number
  onPageChange: (p: number) => void
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  if (page > pageCount) return null
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4.5 py-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ash">
        {from}–{to} de {total}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          className="btn-act"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft size={14} />
        </button>
        {pageItems(page, pageCount).map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-1 font-mono text-[11px] text-faint">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[30px] rounded-md border px-2 py-1 font-mono text-[11.5px] transition-colors ${
                p === page
                  ? 'border-brass bg-smoke text-brass'
                  : 'border-transparent text-ash hover:border-line hover:text-ivory'
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          className="btn-act"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Página siguiente"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}