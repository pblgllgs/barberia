import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { IMAGE_UPLOAD_URL } from '@/lib/config'
import { useToast } from './Toast'

export default function ImageUpload({
  value,
  onChange,
}: {
  value: string | null
  onChange: (url: string) => void
}) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!IMAGE_UPLOAD_URL) {
    return (
      <input
        className="w-full bg-smoke border border-line rounded-md px-3.5 py-3 text-ivory text-[15px] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-faint focus:border-brass focus:shadow-[0_0_0_3px_rgba(201,163,95,0.15)]"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
      />
    )
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('Selecciona un archivo de imagen', 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast('La imagen supera 5 MB', 'error')
      return
    }
    setUploading(true)
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token ?? ''
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${IMAGE_UPLOAD_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      if (!res.ok) throw new Error('Upload fallido')
      const json = (await res.json()) as { url: string }
      onChange(json.url)
      toast('Imagen subida')
    } catch {
      toast('No se pudo subir la imagen', 'error')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-line bg-smoke px-4 py-6 text-sm text-ash transition-colors hover:border-brass hover:text-ivory">
        <UploadCloud size={18} />
        {uploading ? 'Subiendo…' : 'Seleccionar imagen'}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} disabled={uploading} />
      </label>
      {value && (
        <div className="mt-3 flex items-center gap-3">
          <img src={value} alt="" className="h-14 w-14 shrink-0 rounded-md border border-line object-cover" />
          <div className="min-w-0 flex-1 truncate font-mono text-[11px] text-ash">{value}</div>
          <button type="button" className="btn-act danger shrink-0" onClick={() => onChange('')}>
            Quitar
          </button>
        </div>
      )}
    </div>
  )
}