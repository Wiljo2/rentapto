import { useMemo } from 'react'
import { computeIndicators } from '../lib/calculations'
import type { ApartmentInput, Indicators } from '../types'

/**
 * Memoized computation of apartment financial indicators.
 * Only recalculates when the apartment data changes.
 *
 * Optimizes performance by preventing expensive calculations
 * on every render (especially important for SummaryPanel during typing).
 */
export function useComputedIndicators(apt: ApartmentInput): Indicators {
  return useMemo(() => computeIndicators(apt), [
    // Dependencies: all fields that affect calculations
    apt.price,
    apt.rent,
    apt.admin,
    apt.down_pct,
    apt.down_custom,
    apt.rate,
    apt.term,
    apt.quota,
    apt.gasto_avaluo,
    apt.gasto_titulos,
    apt.escrituracion_pct,
    apt.escrituracion_override,
    apt.remodelacion,
    apt.seguro_pct,
    apt.tax,
    apt.other_costs,
    apt.ipc,
    apt.anio_proyectado,
    apt.area,
    apt.vacancia_meses,
    apt.mantenimiento_anual,
    apt.valorizacion_anual,
    apt.horizonte_anos,
  ])
}
