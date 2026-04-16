import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { ApartmentFormData } from '../types'

export function useSaveApartment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(data: ApartmentFormData, id?: string): Promise<boolean> {
    setError(null)
    setLoading(true)
    try {
      const session = (await supabase.auth.getSession()).data.session
      if (!session) throw new Error('No estás autenticado.')

      const res = await fetch('/api/save-apartment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ data, id }),
      })

      const json = await res.json()

      if (!res.ok) {
        if (json.fieldErrors) {
          const msgs = json.fieldErrors.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`)
          throw new Error(msgs.join('\n'))
        }
        throw new Error(json.error || 'Error al guardar.')
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { save, loading, error }
}
