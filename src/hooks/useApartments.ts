import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { ApartmentRow } from '../types'

export function useApartments() {
  const [apartments, setApartments] = useState<ApartmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApartments = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setApartments((data ?? []) as ApartmentRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchApartments()
  }, [fetchApartments])

  async function deleteApartment(id: string): Promise<boolean> {
    const { error } = await supabase.from('apartments').delete().eq('id', id)
    if (error) {
      setError(error.message)
      return false
    }
    setApartments(prev => prev.filter(a => a.id !== id))
    return true
  }

  return {
    apartments,
    loading,
    error,
    refetch: fetchApartments,
    deleteApartment,
  }
}
