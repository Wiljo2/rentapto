import { z } from 'zod'

// ── Helpers ────────────────────────────────────────────────────────────────

/** Coerce string/number/null/undefined/empty to number | null. */
const numOrNull = z
  .union([z.coerce.number(), z.literal(''), z.null(), z.undefined()])
  .transform((v): number | null => {
    if (v === '' || v === null || v === undefined) return null
    const n = Number(v)
    return isNaN(n) ? null : n
  })

/** Same as numOrNull but must be >= 0 when present. */
const positiveOrNull = numOrNull.pipe(
  z.number().min(0).nullable()
)

// ── Mortgage helper ────────────────────────────────────────────────────────

function calcMonthlyRate(annualRatePct: number): number {
  return Math.pow(1 + annualRatePct / 100, 1 / 12) - 1
}

function calcQuota(loan: number, annualRatePct: number, termMonths: number): number {
  if (!loan || !annualRatePct || !termMonths) return 0
  const rm = calcMonthlyRate(annualRatePct)
  if (rm === 0) return Math.round(loan / termMonths)
  const factor = Math.pow(1 + rm, termMonths)
  return Math.round(loan * (rm * factor) / (factor - 1))
}

// ── Schema ─────────────────────────────────────────────────────────────────

export const apartmentSchema = z.object({
  // Step 1 — essentials
  name: z.string().max(200).default(''),
  price: positiveOrNull.default(null),
  rent: positiveOrNull.default(null),
  admin: positiveOrNull.default(null),
  down_pct: z.coerce.number().min(0).max(100).default(20),
  down_custom: positiveOrNull.default(null),
  rate: z.coerce.number().min(0).max(50).default(13.5),
  term: z.coerce.number().int().min(1).max(480).default(240),
  loan_type: z.string().default('Hipotecario (Pesos)'),

  // Step 2 — investment costs
  gasto_avaluo: positiveOrNull.default(null),
  gasto_titulos: positiveOrNull.default(null),
  escrituracion_pct: z.coerce.number().min(0).max(20).default(2.5),
  escrituracion_override: positiveOrNull.default(null),
  remodelacion: positiveOrNull.default(null),

  // Step 3 — monthly costs
  seguro_pct: z.coerce.number().min(0).max(1).default(0.05),
  tax: positiveOrNull.default(null),
  other_costs: positiveOrNull.default(null),
  ipc: z.coerce.number().min(0).max(30).default(6),
  anio_proyectado: z.coerce.number().int().min(1).max(30).default(3),

  // Step 4 — details
  neighborhood: z.string().max(100).default(''),
  address: z.string().max(300).default(''),
  estrato: z.coerce.number().int().min(1).max(6).nullable().catch(null).default(null),
  floor: numOrNull.default(null),
  type: z.enum(['Apartamento', 'Estudio', 'Penthouse', 'Dúplex']).catch('Apartamento').default('Apartamento'),
  area: positiveOrNull.default(null),
  bedrooms: numOrNull.default(null),
  bathrooms: numOrNull.default(null),
  age: numOrNull.default(null),
  parking: numOrNull.default(null),
  view: z.enum(['', 'Ciudad', 'Mar', 'Montaña', 'Parque', 'Interior', 'Otro']).catch('').default(''),
  sun_exposure: z.enum(['', 'Alta', 'Media', 'Baja']).catch('').default(''),
  amenities: z.array(z.string()).default([]),
  links: z.array(z.string()).default([]),
  notes: z.string().max(2000).default(''),
})

export type ValidatedApartment = z.infer<typeof apartmentSchema>

/**
 * Parse raw form data through the schema and compute server-side fields.
 * Returns a Supabase-ready payload with quota computed.
 */
export function parseAndCompute(raw: unknown) {
  const parsed = apartmentSchema.parse(raw)

  // Compute quota server-side — never trust client-computed values
  const price = parsed.price ?? 0
  const downCustom = parsed.down_custom ?? 0
  const downAmount = downCustom > 0 ? downCustom : Math.round(price * (parsed.down_pct / 100))
  const loan = Math.max(0, price - downAmount)
  const quota = calcQuota(loan, parsed.rate, parsed.term)

  return {
    ...parsed,
    quota: quota || null,
  }
}
