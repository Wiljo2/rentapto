import { useState, useEffect } from 'react'
import { DEFAULT_FORM } from '../lib/defaults'
import type { ApartmentFormData } from '../types'

const STORAGE_KEY = 'rentapto:calculadora'

function load(): ApartmentFormData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_FORM, ...JSON.parse(raw) }
  } catch {
    // Storage blocked or corrupt data — start from defaults
  }
  return DEFAULT_FORM
}

/**
 * Form state for the standalone calculator. The current draft lives only in
 * this browser's localStorage so a page refresh doesn't lose it.
 */
export function useLocalForm() {
  const [data, setData] = useState<ApartmentFormData>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Storage unavailable (private mode, quota) — keep working in memory
    }
  }, [data])

  function handleChange(field: keyof ApartmentFormData, value: unknown) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function reset() {
    setData(DEFAULT_FORM)
  }

  return { data, handleChange, reset }
}
