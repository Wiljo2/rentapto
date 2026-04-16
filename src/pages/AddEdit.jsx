import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calcQuota, calcDownAmount, calcLoan } from '../lib/calculations'
import SummaryPanel from '../components/form/SummaryPanel'
import ApartmentImporter from '../components/form/ApartmentImporter'
import Step1Esencial from '../components/steps/Step1Esencial'
import Step2Inversion from '../components/steps/Step2Inversion'
import Step3Gastos from '../components/steps/Step3Gastos'
import Step4Detalles from '../components/steps/Step4Detalles'

const DEFAULT = {
  // Step 1
  name: '',
  price: '',
  rent: '',
  admin: '',
  down_pct: 20,
  down_custom: '',
  rate: 13.5,
  term: 240,
  loan_type: 'Hipotecario (Pesos)',
  quota: '',
  // Step 2
  gasto_avaluo: '',
  gasto_titulos: '',
  escrituracion_pct: 2.5,
  escrituracion_override: '',
  remodelacion: '',
  // Step 3
  seguro_pct: 0.05,
  tax: '',
  other_costs: '',
  ipc: 6,
  anio_proyectado: 3,
  // Step 4
  neighborhood: '',
  address: '',
  estrato: '',
  floor: '',
  type: 'Apartamento',
  area: '',
  bedrooms: '',
  bathrooms: '',
  age: '',
  parking: '',
  view: '',
  sun_exposure: '',
  amenities: [],
  links: [],
  notes: '',
}

const STEPS = [
  { label: 'Lo esencial',      short: '1' },
  { label: 'Inversión',        short: '2' },
  { label: 'Gastos',           short: '3' },
  { label: 'Detalles',         short: '4' },
]

export default function AddEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState(DEFAULT)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(!!id)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    setFetchLoading(true)
    supabase.from('apartments').select('*').eq('id', id).single()
      .then(({ data: apt, error }) => {
        if (error) { setError(error.message); return }
        setData({ ...DEFAULT, ...apt, amenities: apt.amenities || [], links: apt.links || [] })
        setFetchLoading(false)
      })
  }, [id])

  function handleChange(field, value) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function handleImport(extracted) {
    setData(prev => {
      const next = { ...prev }
      Object.entries(extracted).forEach(([key, value]) => {
        if (key === 'amenities') {
          if (Array.isArray(value) && value.length > 0) next[key] = value
        } else if (value !== null && value !== undefined && value !== '') {
          next[key] = value
        }
      })
      return next
    })
  }

  async function handleSave() {
    setError(null)
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const price = Number(data.price) || 0
      const downAmount = calcDownAmount(price, data.down_pct, data.down_custom)
      const loan = calcLoan(price, downAmount)
      const quota = calcQuota(loan, data.rate, data.term)

      const payload = {
        ...data,
        user_id: user.id,
        price: price || null,
        area: Number(data.area) || null,
        bedrooms: Number(data.bedrooms) || null,
        bathrooms: Number(data.bathrooms) || null,
        floor: Number(data.floor) || null,
        age: Number(data.age) || null,
        parking: Number(data.parking) || null,
        estrato: Number(data.estrato) || null,
        down_pct: Number(data.down_pct) || null,
        down_custom: Number(data.down_custom) || null,
        rate: Number(data.rate) || null,
        term: Number(data.term) || null,
        quota: quota || null,
        rent: Number(data.rent) || null,
        admin: Number(data.admin) || null,
        seguro_pct: Number(data.seguro_pct) || 0.05,
        tax: Number(data.tax) || null,
        other_costs: Number(data.other_costs) || null,
        gasto_avaluo: Number(data.gasto_avaluo) || null,
        gasto_titulos: Number(data.gasto_titulos) || null,
        escrituracion_pct: Number(data.escrituracion_pct) || 2.5,
        escrituracion_override: Number(data.escrituracion_override) || null,
        remodelacion: Number(data.remodelacion) || null,
        ipc: Number(data.ipc) || 6,
        anio_proyectado: Number(data.anio_proyectado) || 3,
        amenities: data.amenities || [],
        links: data.links || [],
      }

      const result = id
        ? await supabase.from('apartments').update(payload).eq('id', id)
        : await supabase.from('apartments').insert(payload)

      if (result.error) throw result.error
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) return (
    <div className="flex justify-center items-center py-20 text-slate-400">Cargando...</div>
  )

  const isLast = step === STEPS.length - 1

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button type="button" onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-700 text-sm">
          ← Volver
        </button>
        <h2 className="text-lg font-bold text-slate-900 flex-1">
          {id ? 'Editar apartamento' : 'Agregar apartamento'}
        </h2>
        <ApartmentImporter onApply={handleImport} />
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-0 mb-6">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => setStep(i)}
              className="flex items-center gap-2 group"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i === step ? 'bg-green-600 text-white scale-110'
                : i < step ? 'bg-green-200 text-green-800'
                : 'bg-slate-200 text-slate-500'
              }`}>
                {i < step ? '✓' : s.short}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${
                i === step ? 'text-green-700' : i < step ? 'text-green-600' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-green-300' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Live summary */}
      <SummaryPanel data={data} />

      {/* Step content */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 mb-6">
        {step === 0 && <Step1Esencial data={data} onChange={handleChange} />}
        {step === 1 && <Step2Inversion data={data} onChange={handleChange} />}
        {step === 2 && <Step3Gastos data={data} onChange={handleChange} />}
        {step === 3 && <Step4Detalles data={data} onChange={handleChange} />}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => step === 0 ? navigate('/') : setStep(s => s - 1)}
          className="flex-1 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
        >
          {step === 0 ? 'Cancelar' : '← Anterior'}
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-semibold transition-colors"
          >
            {loading ? 'Guardando...' : id ? 'Guardar cambios' : 'Guardar apartamento'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
          >
            Siguiente →
          </button>
        )}
      </div>

      {/* Save from any step */}
      {!isLast && (
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-2 py-2.5 text-sm text-slate-500 hover:text-slate-700 underline"
        >
          {loading ? 'Guardando...' : 'Guardar ahora sin completar todos los pasos'}
        </button>
      )}
    </div>
  )
}
