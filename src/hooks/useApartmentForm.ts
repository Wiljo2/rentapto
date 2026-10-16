import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { DEFAULT_FORM as DEFAULT } from '../lib/defaults'
import type { ApartmentFormData } from '../types'

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
