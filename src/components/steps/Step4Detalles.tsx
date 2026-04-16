import { useState } from 'react'
import type { ApartmentFormData } from '../../types'
import { Field, TextInput, NumInput } from '../ui/FormFields'

const TYPES = ['Apartamento', 'Estudio', 'Penthouse', 'Dúplex']
const VIEWS = ['', 'Ciudad', 'Mar', 'Montaña', 'Parque', 'Interior', 'Otro']
const SUN = ['', 'Alta', 'Media', 'Baja']
const AMENITIES = [
  'Piscina', 'Gimnasio', 'Sauna', 'BBQ', 'Rooftop',
  'Portería 24h', 'Ascensor', 'Depósito', 'Pet friendly', 'Smart home',
]
const ESTRATOS = [1, 2, 3, 4, 5, 6]

interface Props {
  data: ApartmentFormData
  onChange: (field: keyof ApartmentFormData, value: unknown) => void
}

export default function Step4Detalles({ data, onChange }: Props) {
  const [newLink, setNewLink] = useState('')

  function toggleAmenity(amenity: string) {
    const current = data.amenities || []
    onChange('amenities', current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity]
    )
  }

  function addLink() {
    if (!newLink.trim()) return
    onChange('links', [...(data.links || []), newLink.trim()])
    setNewLink('')
  }

  function removeLink(idx: number) {
    onChange('links', (data.links || []).filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">Detalles del inmueble</h3>
        <p className="text-sm text-slate-500">Información secundaria — puedes completarla después.</p>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Barrio / Sector">
          <TextInput value={String(data.neighborhood)} onChange={v => onChange('neighborhood', v)} placeholder="Ej: Laureles" />
        </Field>
        <Field label="Dirección">
          <TextInput value={String(data.address)} onChange={v => onChange('address', v)} placeholder="Ej: Cra 80 #39-25" />
        </Field>
        <Field label="Estrato">
          <div className="flex gap-2">
            {ESTRATOS.map(e => (
              <button
                key={e}
                type="button"
                onClick={() => onChange('estrato', e)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                  Number(data.estrato) === e
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-green-400'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Piso">
          <NumInput value={data.floor} onChange={v => onChange('floor', v)} placeholder="Ej: 3" />
        </Field>
      </div>

      {/* Property specs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Field label="Tipo">
          <select
            value={String(data.type)}
            onChange={e => onChange('type', e.target.value)}
            className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
          >
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Área (m²)">
          <NumInput value={data.area} onChange={v => onChange('area', v)} placeholder="Ej: 72" />
        </Field>
        <Field label="Habitaciones">
          <NumInput value={data.bedrooms} onChange={v => onChange('bedrooms', v)} placeholder="Ej: 3" />
        </Field>
        <Field label="Baños">
          <NumInput value={data.bathrooms} onChange={v => onChange('bathrooms', v)} placeholder="Ej: 2" />
        </Field>
        <Field label="Antigüedad (años)">
          <NumInput value={data.age} onChange={v => onChange('age', v)} placeholder="Ej: 5" />
        </Field>
        <Field label="Parqueaderos">
          <NumInput value={data.parking} onChange={v => onChange('parking', v)} placeholder="Ej: 1" />
        </Field>
        <Field label="Vista">
          <select
            value={String(data.view)}
            onChange={e => onChange('view', e.target.value)}
            className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
          >
            {VIEWS.map(v => <option key={v} value={v}>{v || 'Sin especificar'}</option>)}
          </select>
        </Field>
        <Field label="Exposición solar">
          <select
            value={String(data.sun_exposure)}
            onChange={e => onChange('sun_exposure', e.target.value)}
            className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
          >
            {SUN.map(s => <option key={s} value={s}>{s || 'Sin especificar'}</option>)}
          </select>
        </Field>
      </div>

      {/* Amenities */}
      <Field label="Amenidades">
        <div className="flex flex-wrap gap-2 mt-1">
          {AMENITIES.map(a => {
            const selected = (data.amenities || []).includes(a)
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                  selected
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-green-400'
                }`}
              >
                {a}
              </button>
            )
          })}
        </div>
      </Field>

      {/* Links */}
      <Field label="Links del aviso / fotos" hint="Pega URLs de Metrocuadrado, Finca Raíz, Google Photos, Drive, etc.">
        <div className="space-y-2">
          {(data.links || []).map((link, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-xs text-blue-600 hover:underline truncate"
              >
                {link}
              </a>
              <button
                type="button"
                onClick={() => removeLink(idx)}
                className="text-slate-400 hover:text-red-500 text-sm flex-shrink-0"
              >
                ×
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="url"
              value={newLink}
              onChange={e => setNewLink(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLink())}
              placeholder="https://..."
              className="flex-1 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
            <button
              type="button"
              onClick={addLink}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
            >
              + Agregar
            </button>
          </div>
        </div>
      </Field>

      {/* Notes */}
      <Field label="Notas">
        <textarea
          value={data.notes}
          onChange={e => onChange('notes', e.target.value)}
          rows={3}
          placeholder="Observaciones, condición del inmueble, negociación, contacto..."
          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 resize-none"
        />
      </Field>
    </div>
  )
}
