import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SummaryPanel from '../components/form/SummaryPanel'
import MortgageCalculator from '../components/form/MortgageCalculator'
import IncomeCosts from '../components/form/IncomeCosts'
import PropertyDetails from '../components/form/PropertyDetails'
import ApartmentImporter from '../components/form/ApartmentImporter'

const DEFAULT = {
  name: '',
  neighborhood: '',
  address: '',
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
  notes: '',
  price: '',
  down_pct: 20,
  down_custom: '',
  rate: '',
  term: '',
  loan_type: 'Hipotecario (Pesos)',
  quota: '',
  rent: '',
  seguros: 300000,
  admin: '',
  comision_agencia_pct: 24,
  tax: '',
  other_costs: '',
  gasto_avaluo: 1600000,
  gasto_titulos: 1600000,
  escrituracion_pct: 3.5,
  remodelacion: '',
  ipc: 6,
  anio_proyectado: 3,
}

export default function AddEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(DEFAULT)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(!!id)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    setFetchLoading(true)
    supabase
      .from('apartments')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data: apt, error }) => {
        if (error) { setError(error.message); return }
        // Merge with DEFAULT to handle missing fields
        setData({ ...DEFAULT, ...apt, amenities: apt.amenities || [] })
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

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload = {
        ...data,
        user_id: user.id,
        // Cast numeric strings
        price: data.price ? Number(data.price) : null,
        area: data.area ? Number(data.area) : null,
        bedrooms: data.bedrooms ? Number(data.bedrooms) : null,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : null,
        floor: data.floor ? Number(data.floor) : null,
        age: data.age ? Number(data.age) : null,
        parking: data.parking ? Number(data.parking) : null,
        down_pct: Number(data.down_pct) || null,
        down_custom: data.down_custom ? Number(data.down_custom) : null,
        rate: data.rate ? Number(data.rate) : null,
        term: data.term ? Number(data.term) : null,
        quota: data.quota ? Number(data.quota) : null,
        rent: data.rent ? Number(data.rent) : null,
        seguros: data.seguros ? Number(data.seguros) : null,
        admin: data.admin ? Number(data.admin) : null,
        comision_agencia_pct: Number(data.comision_agencia_pct) || 24,
        tax: data.tax ? Number(data.tax) : null,
        other_costs: data.other_costs ? Number(data.other_costs) : null,
        gasto_avaluo: Number(data.gasto_avaluo) || null,
        gasto_titulos: Number(data.gasto_titulos) || null,
        escrituracion_pct: Number(data.escrituracion_pct) || 3.5,
        remodelacion: data.remodelacion ? Number(data.remodelacion) : null,
        ipc: Number(data.ipc) || 6,
        anio_proyectado: Number(data.anio_proyectado) || 3,
      }

      let result
      if (id) {
        result = await supabase.from('apartments').update(payload).eq('id', id)
      } else {
        result = await supabase.from('apartments').insert(payload)
      }

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← Volver
        </button>
        <h2 className="text-xl font-bold text-slate-900">
          {id ? 'Editar apartamento' : 'Agregar apartamento'}
        </h2>
        <div className="ml-auto">
          <ApartmentImporter onApply={handleImport} />
        </div>
      </div>

      {/* Live summary panel */}
      <SummaryPanel data={data} />

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Mortgage calculator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <MortgageCalculator data={data} onChange={handleChange} />
        </div>

        {/* Income & costs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <IncomeCosts data={data} onChange={handleChange} />
        </div>

        {/* Property details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <PropertyDetails data={data} onChange={handleChange} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-semibold transition-colors"
          >
            {loading ? 'Guardando...' : id ? 'Guardar cambios' : 'Guardar apartamento'}
          </button>
        </div>
      </form>
    </div>
  )
}
