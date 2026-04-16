import { useState, useRef } from 'react'
import type { ApartmentFormData } from '../../types'

// Fields the extractor can fill, with human-readable labels for the preview
const FIELD_LABELS: Partial<Record<keyof ApartmentFormData, string>> = {
  name: 'Nombre',
  neighborhood: 'Barrio',
  address: 'Dirección',
  estrato: 'Estrato',
  floor: 'Piso',
  type: 'Tipo',
  area: 'Área (m²)',
  bedrooms: 'Habitaciones',
  bathrooms: 'Baños',
  age: 'Antigüedad (años)',
  parking: 'Parqueaderos',
  view: 'Vista',
  sun_exposure: 'Exposición solar',
  amenities: 'Amenidades',
  price: 'Precio',
  rent: 'Arriendo mensual',
  admin: 'Administración',
  notes: 'Notas',
}

function formatPreviewValue(key: keyof ApartmentFormData, value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : null
  if (['price', 'rent', 'admin'].includes(key)) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(value))
  }
  return String(value)
}

interface Props {
  onApply: (extracted: Partial<ApartmentFormData>) => void
}

export default function ApartmentImporter({ onApply }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'text' | 'image'>('text')
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<Partial<ApartmentFormData> | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleClose() {
    setOpen(false)
    setExtracted(null)
    setError(null)
    setText('')
    setImageFile(null)
    setImagePreview(null)
    setTab('text')
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleExtract() {
    if (tab === 'text' && !text.trim()) { setError('Pega el texto del anuncio.'); return }
    if (tab === 'image' && !imageFile) { setError('Selecciona una imagen.'); return }

    setError(null)
    setLoading(true)
    setExtracted(null)

    try {
      const payload: Record<string, string> = {}
      if (tab === 'text') {
        payload.text = text.trim()
      } else {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve((reader.result as string).split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(imageFile!)
        })
        payload.imageBase64 = base64
        payload.mediaType = imageFile!.type
        if (text.trim()) payload.text = text.trim()
      }

      const res = await fetch('/api/extract-apartment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Error al extraer información')
      setExtracted(json as Partial<ApartmentFormData>)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  function handleApply() {
    if (!extracted) return
    onApply(extracted)
    handleClose()
  }

  const filledCount = extracted
    ? Object.entries(extracted).filter(([, v]) => {
        if (Array.isArray(v)) return v.length > 0
        return v !== null && v !== undefined
      }).length
    : 0

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
      >
        <span>✨</span>
        <span>Importar con IA</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900">Importar apartamento con IA</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pega un anuncio o sube una foto — Claude extrae los datos disponibles
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none px-1"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {!extracted ? (
                <>
                  <div className="flex rounded-lg bg-slate-100 p-1">
                    {([['text', '📋 Texto / Descripción'], ['image', '📷 Imagen / Foto']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => { setTab(val); setError(null) }}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                          tab === val ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {tab === 'text' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Texto del anuncio
                      </label>
                      <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        rows={8}
                        placeholder={`Pega aquí el texto del anuncio, descripción del inmueble, o información de plataformas como Metrocuadrado, Finca Raíz, etc.\n\nEjemplo:\n"Apartamento en Laureles, piso 5, 72m², 3 hab, 2 baños, parqueadero, precio $450.000.000, administración $280.000..."`}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                      />
                    </div>
                  )}

                  {tab === 'image' && (
                    <div className="space-y-3">
                      <div
                        onClick={() => fileRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                          imagePreview ? 'border-violet-400 bg-violet-50' : 'border-slate-300 hover:border-violet-400 hover:bg-violet-50'
                        }`}
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg object-contain"
                          />
                        ) : (
                          <>
                            <div className="text-3xl mb-2">📷</div>
                            <p className="text-sm font-medium text-slate-700">Haz clic para seleccionar imagen</p>
                            <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP — captura del anuncio, foto del apto, etc.</p>
                          </>
                        )}
                      </div>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      {imageFile && (
                        <p className="text-xs text-slate-500">
                          {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                        </p>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Contexto adicional (opcional)
                        </label>
                        <input
                          type="text"
                          value={text}
                          onChange={e => setText(e.target.value)}
                          placeholder="Ej: precio $480M, barrio El Poblado"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-xl">
                      {error}
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-green-600 text-lg">✓</span>
                    <p className="text-sm font-semibold text-slate-800">
                      Se extrajeron <strong>{filledCount}</strong> campo{filledCount !== 1 ? 's' : ''}
                    </p>
                    <button
                      type="button"
                      onClick={() => setExtracted(null)}
                      className="ml-auto text-xs text-slate-400 hover:text-slate-600 underline"
                    >
                      Volver a intentar
                    </button>
                  </div>

                  <div className="space-y-1 bg-slate-50 rounded-xl p-4 border border-slate-200">
                    {(Object.entries(FIELD_LABELS) as [keyof ApartmentFormData, string][]).map(([key, label]) => {
                      const display = formatPreviewValue(key, extracted[key])
                      if (!display) return null
                      return (
                        <div key={key} className="flex justify-between items-start gap-3 py-1.5 border-b border-slate-100 last:border-0">
                          <span className="text-xs text-slate-500 shrink-0">{label}</span>
                          <span className="text-xs font-medium text-slate-800 text-right">{display}</span>
                        </div>
                      )
                    })}
                    {filledCount === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">
                        No se pudo extraer información. Intenta con más texto o una imagen más clara.
                      </p>
                    )}
                  </div>

                  {(Object.keys(FIELD_LABELS) as (keyof ApartmentFormData)[]).some(k => {
                    const v = extracted[k]
                    return Array.isArray(v) ? v.length === 0 : v === null || v === undefined
                  }) && (
                    <p className="text-xs text-slate-400 mt-3">
                      Los campos no encontrados quedarán vacíos para que los completes manualmente.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              {!extracted ? (
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Extrayendo...
                    </>
                  ) : (
                    '✨ Extraer información'
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={filledCount === 0}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Aplicar al formulario ({filledCount} campo{filledCount !== 1 ? 's' : ''})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
