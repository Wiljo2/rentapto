// ── Form state ─────────────────────────────────────────────────────────────
// Numeric fields are `number | string` because <input type="number"> onChange
// returns a string, while DEFAULT values and Supabase-loaded rows are numbers.
// All calculation functions guard with Number(x) || 0.

export interface ApartmentFormData {
  // Step 1 — essentials
  name: string
  price: number | string
  rent: number | string
  admin: number | string
  down_pct: number
  down_custom: number | string
  rate: number
  term: number
  loan_type: string
  quota: number | string
  // Step 2 — investment costs
  gasto_avaluo: number | string
  gasto_titulos: number | string
  escrituracion_pct: number
  escrituracion_override: number | string
  remodelacion: number | string
  // Step 3 — monthly costs
  seguro_pct: number
  tax: number | string
  other_costs: number | string
  ipc: number
  anio_proyectado: number
  // Step 4 — details
  neighborhood: string
  address: string
  estrato: number | string
  floor: number | string
  type: string
  area: number | string
  bedrooms: number | string
  bathrooms: number | string
  age: number | string
  parking: number | string
  view: string
  sun_exposure: string
  amenities: string[]
  links: string[]
  notes: string
}

// ── Supabase row ────────────────────────────────────────────────────────────
// Numeric fields come back as number | null from the database.

export interface ApartmentRow
  extends Omit<
    ApartmentFormData,
    | 'price' | 'rent' | 'admin' | 'down_pct' | 'down_custom'
    | 'rate' | 'term' | 'quota' | 'gasto_avaluo' | 'gasto_titulos'
    | 'escrituracion_override' | 'remodelacion'
    | 'tax' | 'other_costs'
    | 'estrato' | 'floor' | 'area' | 'bedrooms' | 'bathrooms' | 'age' | 'parking'
  > {
  id: string
  user_id: string
  created_at: string
  price: number | null
  rent: number | null
  admin: number | null
  down_pct: number | null
  down_custom: number | null
  rate: number | null
  term: number | null
  quota: number | null
  gasto_avaluo: number | null
  gasto_titulos: number | null
  escrituracion_override: number | null
  remodelacion: number | null
  tax: number | null
  other_costs: number | null
  estrato: number | null
  floor: number | null
  area: number | null
  bedrooms: number | null
  bathrooms: number | null
  age: number | null
  parking: number | null
}

// ── Calculation return types ────────────────────────────────────────────────

export interface Projected {
  rentProy: number
  totalCostsProy: number
  netYieldProy: number
  cashFlowProy: number
}

export interface YieldBadge {
  label: string
  color: 'green' | 'yellow' | 'red'
}

export interface Indicators {
  downAmount: number
  loan: number
  quota: number
  seguros: number
  efectivoRequerido: number
  totalInversion: number
  totalCosts: number
  grossYield: number
  netYield: number
  netCashFlow: number
  pricePerM2: number
  capRate: number
  badge: YieldBadge
  projected: Projected
}

// Convenience union for functions that accept either form data or a saved row
export type ApartmentInput = ApartmentFormData | ApartmentRow
