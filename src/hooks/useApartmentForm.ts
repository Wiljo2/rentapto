import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { ApartmentFormData } from '../types'

const DEFAULT: ApartmentFormData = {
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
  vacancia_meses: 1,
  mantenimiento_anual: '',
  valorizacion_anual: 7,
  horizonte_anos: 10,
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

export function useApartmentForm(id?: string) {
  const [data, setData] = useState<ApartmentFormData>(DEFAULT)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    supabase.from('apartments').select('*').eq('id', id).single()
      .then(({ data: apt, error }) => {
        if (error) { setError(error.message); return }
        if (apt) setData({ ...DEFAULT, ...apt, amenities: apt.amenities || [], links: apt.links || [] })
        setLoading(false)
      })
  }, [id])

  function handleChange(field: keyof ApartmentFormData, value: unknown) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function handleImport(extracted: Partial<ApartmentFormData>) {
    setData(prev => {
      const next = { ...prev }
      ;(Object.entries(extracted) as [keyof ApartmentFormData, unknown][]).forEach(([key, value]) => {
        if (key === 'amenities') {
          if (Array.isArray(value) && value.length > 0) next[key] = value as string[]
        } else if (value !== null && value !== undefined && value !== '') {
          (next as Record<keyof ApartmentFormData, unknown>)[key] = value
        }
      })
      return next
    })
  }

  function reset() {
    setData(DEFAULT)
  }

  return {
    data,
    setData,
    handleChange,
    handleImport,
    reset,
    loading,
    error,
  }
}
