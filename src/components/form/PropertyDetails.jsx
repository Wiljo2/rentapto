const TYPES = ['Apartamento', 'Estudio', 'Penthouse', 'Dúplex']
const VIEWS = ['', 'Ciudad', 'Mar', 'Montaña', 'Parque', 'Interior', 'Otro']
const SUN = ['', 'Alta', 'Media', 'Baja']
const AMENITIES = [
  'Piscina', 'Gimnasio', 'Sauna', 'BBQ', 'Rooftop',
  'Portería 24h', 'Ascensor', 'Depósito', 'Pet friendly', 'Smart home',
]

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 border border-slate-300 rounded-lg py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
    />
  )
}

function NumInput({ value, onChange, placeholder }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 border border-slate-300 rounded-lg py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
    />
  )
}

export default function PropertyDetails({ data, onChange }) {
  function toggleAmenity(amenity) {
    const current = data.amenities || []
    const next = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity]
    onChange('amenities', next)
  }

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2">
        Detalles del inmueble
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre / Referencia">
          <TextInput value={data.name} onChange={v => onChange('name', v)} placeholder="Ej: Apto Laureles 301" />
        </Field>
        <Field label="Barrio / Sector">
          <TextInput value={data.neighborhood} onChange={v => onChange('neighborhood', v)} placeholder="Ej: Laureles" />
        </Field>
        <Field label="Dirección">
          <TextInput value={data.address} onChange={v => onChange('address', v)} placeholder="Ej: Cra 80 #39-25" />
        </Field>
        <Field label="Piso">
          <NumInput value={data.floor} onChange={v => onChange('floor', v)} placeholder="Ej: 3" />
        </Field>
        <Field label="Tipo">
          <select
            value={data.type}
            onChange={e => onChange('type', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
            value={data.view}
            onChange={e => onChange('view', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {VIEWS.map(v => <option key={v} value={v}>{v || 'Sin especificar'}</option>)}
          </select>
        </Field>
        <Field label="Exposición solar">
          <select
            value={data.sun_exposure}
            onChange={e => onChange('sun_exposure', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {SUN.map(s => <option key={s} value={s}>{s || 'Sin especificar'}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Amenidades">
        <div className="flex flex-wrap gap-2 mt-1">
          {AMENITIES.map(a => {
            const selected = (data.amenities || []).includes(a)
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selected
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-green-400'
                }`}
              >
                {a}
              </button>
            )
          })}
        </div>
      </Field>

      <Field label="Notas">
        <textarea
          value={data.notes}
          onChange={e => onChange('notes', e.target.value)}
          rows={3}
          placeholder="Observaciones, condiciones del inmueble, negociación..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
      </Field>
    </div>
  )
}
