import type { ApartmentInput, ApartmentFormData, Indicators, Projected, YieldBadge } from '../types'

// ── Formatting ─────────────────────────────────────────────────────────────

export function formatCOP(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '' || isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export function formatCompact(value: number | string | null | undefined): string {
  const n = Number(value)
  if (!value || isNaN(n)) return '—'
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  return formatCOP(n)
}

export function formatPct(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || isNaN(Number(value))) return '—'
  return `${Number(value).toFixed(decimals)}%`
}

// ── Mortgage ───────────────────────────────────────────────────────────────

// rm = (1 + TEA)^(1/12) - 1
export function calcMonthlyRate(annualRatePct: number): number {
  return Math.pow(1 + annualRatePct / 100, 1 / 12) - 1
}

// cuota = loan × (rm × (1+rm)^n) / ((1+rm)^n - 1)
export function calcQuota(
  loan: number | string | null | undefined,
  annualRatePct: number | string | null | undefined,
  termMonths: number | string | null | undefined,
): number {
  const L = Number(loan)
  const n = Number(termMonths)
  if (!L || !annualRatePct || !n) return 0
  const rm = calcMonthlyRate(Number(annualRatePct))
  if (rm === 0) return Math.round(L / n)
  const factor = Math.pow(1 + rm, n)
  return Math.round(L * (rm * factor) / (factor - 1))
}

// ── Down payment & loan ────────────────────────────────────────────────────

export function calcDownAmount(
  price: number | string | null | undefined,
  downPct: number | string | null | undefined,
  downCustom: number | string | null | undefined,
): number {
  if (downCustom && Number(downCustom) > 0) return Number(downCustom)
  return Math.round(Number(price) * (Number(downPct) / 100))
}

export function calcLoan(
  price: number | string | null | undefined,
  downAmount: number,
): number {
  return Math.max(0, Number(price) - downAmount)
}

// ── Purchase costs — all auto from price, all overrideable ─────────────────

export function calcAvaluo(price: number | string | null | undefined): number {
  return Math.round(Number(price) * 0.00013)
}

export function calcTitulos(price: number | string | null | undefined): number {
  return Math.round(Number(price) * 0.00013)
}

export function calcEscrituracion(
  price: number | string | null | undefined,
  pct: number | string = 2.5,
): number {
  return Math.round(Number(price) * (Number(pct) / 100))
}

// Seguros = loan × seguro_pct% monthly
export function calcSeguros(
  loan: number,
  seguroPct: number | string = 0.05,
): number {
  return Math.round(loan * (Number(seguroPct) / 100))
}

// Total cash required upfront (cuota inicial + all purchase costs)
export function calcEfectivoRequerido(apt: ApartmentInput): number {
  const price = Number(apt.price) || 0
  const downAmount = calcDownAmount(price, apt.down_pct, apt.down_custom)
  const avaluo = Number(apt.gasto_avaluo) || calcAvaluo(price)
  const titulos = Number(apt.gasto_titulos) || calcTitulos(price)
  const escrituracion = Number(apt.escrituracion_override) || calcEscrituracion(price, apt.escrituracion_pct)
  const remodelacion = Number(apt.remodelacion) || 0
  return downAmount + avaluo + titulos + escrituracion + remodelacion
}

// Total investment = price + all purchase costs (for cap rate)
export function calcTotalInversion(apt: ApartmentInput): number {
  const price = Number(apt.price) || 0
  const avaluo = Number(apt.gasto_avaluo) || calcAvaluo(price)
  const titulos = Number(apt.gasto_titulos) || calcTitulos(price)
  const escrituracion = Number(apt.escrituracion_override) || calcEscrituracion(price, apt.escrituracion_pct)
  const remodelacion = Number(apt.remodelacion) || 0
  return price + avaluo + titulos + escrituracion + remodelacion
}

// ── Monthly costs ──────────────────────────────────────────────────────────

export function calcTotalCosts(apt: ApartmentInput & { quota?: number | string | null }): number {
  const price = Number(apt.price) || 0
  const downAmount = calcDownAmount(price, apt.down_pct, apt.down_custom)
  const loan = calcLoan(price, downAmount)
  const quota = Number(apt.quota) || 0
  const seguros = calcSeguros(loan, apt.seguro_pct)
  const admin = Number(apt.admin) || 0
  const tax = Number(apt.tax) || 0
  const other = Number(apt.other_costs) || 0
  return quota + seguros + admin + tax + other
}

// ── Yield indicators ───────────────────────────────────────────────────────

export function calcGrossYield(
  rent: number | string | null | undefined,
  price: number | string | null | undefined,
): number {
  if (!rent || !price) return 0
  return (Number(rent) * 12) / Number(price) * 100
}

export function calcNetYield(
  rent: number | string | null | undefined,
  totalCosts: number,
  price: number | string | null | undefined,
): number {
  if (!price) return 0
  return ((Number(rent) - totalCosts) * 12) / Number(price) * 100
}

export function calcNetCashFlow(
  rent: number | string | null | undefined,
  totalCosts: number,
): number {
  return Number(rent) - totalCosts
}

export function calcPricePerM2(
  price: number | string | null | undefined,
  area: number | string | null | undefined,
): number {
  if (!area || !price) return 0
  return Math.round(Number(price) / Number(area))
}

export function calcCapRate(
  rent: number | string | null | undefined,
  totalInversion: number,
): number {
  if (!totalInversion) return 0
  return (Number(rent) * 12) / totalInversion * 100
}

// ── Projected indicators ───────────────────────────────────────────────────

export function calcProjected(apt: ApartmentInput, year: number): Projected {
  const ipc = (Number(apt.ipc) || 6) / 100
  const rent = Number(apt.rent) || 0
  const price = Number(apt.price) || 0
  const quota = Number(apt.quota) || 0 // quota stays fixed

  const downAmount = calcDownAmount(price, apt.down_pct, apt.down_custom)
  const loan = calcLoan(price, downAmount)

  const rentProy = rent * Math.pow(1 + ipc, year)
  const segurosProy = calcSeguros(loan, apt.seguro_pct) * Math.pow(1 + ipc, year)
  const adminProy = (Number(apt.admin) || 0) * Math.pow(1 + ipc, year)
  const taxProy = (Number(apt.tax) || 0) * Math.pow(1 + ipc, year)
  const otherProy = (Number(apt.other_costs) || 0) * Math.pow(1 + ipc, year)
  const totalCostsProy = quota + segurosProy + adminProy + taxProy + otherProy

  return {
    rentProy: Math.round(rentProy),
    totalCostsProy: Math.round(totalCostsProy),
    netYieldProy: price ? ((rentProy - totalCostsProy) * 12) / price * 100 : 0,
    cashFlowProy: Math.round(rentProy - totalCostsProy),
  }
}

// ── Badge ──────────────────────────────────────────────────────────────────

export function getYieldBadge(grossYield: number): YieldBadge {
  if (grossYield >= 7) return { label: 'Buena inversión', color: 'green' }
  if (grossYield >= 5) return { label: 'Moderada', color: 'yellow' }
  return { label: 'Revisar números', color: 'red' }
}

// ── Master compute ─────────────────────────────────────────────────────────

export function computeIndicators(apt: ApartmentInput): Indicators {
  const price = Number(apt.price) || 0
  const rent = Number(apt.rent) || 0
  const area = Number(apt.area) || 0

  const downAmount = calcDownAmount(price, apt.down_pct, apt.down_custom)
  const loan = calcLoan(price, downAmount)
  const quota = calcQuota(loan, apt.rate, apt.term)
  const efectivoRequerido = calcEfectivoRequerido(apt)
  const totalInversion = calcTotalInversion(apt)
  const totalCosts = calcTotalCosts({ ...apt, quota: apt.quota || quota } as ApartmentFormData)
  const grossYield = calcGrossYield(rent, price)
  const netYield = calcNetYield(rent, totalCosts, price)
  const netCashFlow = calcNetCashFlow(rent, totalCosts)
  const pricePerM2 = calcPricePerM2(price, area)
  const capRate = calcCapRate(rent, totalInversion)
  const badge = getYieldBadge(grossYield)
  const year = Number(apt.anio_proyectado) || 3
  const projected = calcProjected({ ...apt, quota: apt.quota || quota } as ApartmentFormData, year)
  const seguros = calcSeguros(loan, apt.seguro_pct)

  return {
    downAmount,
    loan,
    quota,
    seguros,
    efectivoRequerido,
    totalInversion,
    totalCosts,
    grossYield,
    netYield,
    netCashFlow,
    pricePerM2,
    capRate,
    badge,
    projected,
  }
}
