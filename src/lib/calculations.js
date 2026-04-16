// ── Formatting ─────────────────────────────────────────────────────────────

export function formatCOP(value) {
  if (value === null || value === undefined || value === '' || isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export function formatCompact(value) {
  const n = Number(value)
  if (!value || isNaN(n)) return '—'
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  return formatCOP(n)
}

export function formatPct(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(Number(value))) return '—'
  return `${Number(value).toFixed(decimals)}%`
}

// ── Mortgage ───────────────────────────────────────────────────────────────

// rm = (1 + TEA)^(1/12) - 1
export function calcMonthlyRate(annualRatePct) {
  return Math.pow(1 + annualRatePct / 100, 1 / 12) - 1
}

// cuota = loan × (rm × (1+rm)^n) / ((1+rm)^n - 1)
export function calcQuota(loan, annualRatePct, termMonths) {
  const L = Number(loan)
  const n = Number(termMonths)
  if (!L || !annualRatePct || !n) return 0
  const rm = calcMonthlyRate(Number(annualRatePct))
  if (rm === 0) return Math.round(L / n)
  const factor = Math.pow(1 + rm, n)
  return Math.round(L * (rm * factor) / (factor - 1))
}

// ── Down payment & loan ────────────────────────────────────────────────────

export function calcDownAmount(price, downPct, downCustom) {
  if (downCustom && Number(downCustom) > 0) return Number(downCustom)
  return Math.round(Number(price) * (Number(downPct) / 100))
}

export function calcLoan(price, downAmount) {
  return Math.max(0, Number(price) - Number(downAmount))
}

// ── Purchase costs — all auto from price, all overrideable ─────────────────

export function calcAvaluo(price) {
  return Math.round(Number(price) * 0.00013)
}

export function calcTitulos(price) {
  return Math.round(Number(price) * 0.00013)
}

export function calcEscrituracion(price, pct = 2.5) {
  return Math.round(Number(price) * (Number(pct) / 100))
}

// Seguros = loan × seguro_pct% monthly
export function calcSeguros(loan, seguroPct = 0.05) {
  return Math.round(Number(loan) * (Number(seguroPct) / 100))
}

// Total cash required upfront (cuota inicial + all purchase costs)
export function calcEfectivoRequerido(apt) {
  const price = Number(apt.price) || 0
  const downAmount = calcDownAmount(price, apt.down_pct, apt.down_custom)
  const avaluo = Number(apt.gasto_avaluo) || calcAvaluo(price)
  const titulos = Number(apt.gasto_titulos) || calcTitulos(price)
  const escrituracion = Number(apt.escrituracion_override) || calcEscrituracion(price, apt.escrituracion_pct)
  const remodelacion = Number(apt.remodelacion) || 0
  return downAmount + avaluo + titulos + escrituracion + remodelacion
}

// Total investment = price + all purchase costs (for cap rate)
export function calcTotalInversion(apt) {
  const price = Number(apt.price) || 0
  const avaluo = Number(apt.gasto_avaluo) || calcAvaluo(price)
  const titulos = Number(apt.gasto_titulos) || calcTitulos(price)
  const escrituracion = Number(apt.escrituracion_override) || calcEscrituracion(price, apt.escrituracion_pct)
  const remodelacion = Number(apt.remodelacion) || 0
  return price + avaluo + titulos + escrituracion + remodelacion
}

// ── Monthly costs ──────────────────────────────────────────────────────────

export function calcTotalCosts(apt) {
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

export function calcGrossYield(rent, price) {
  if (!rent || !price) return 0
  return (Number(rent) * 12) / Number(price) * 100
}

export function calcNetYield(rent, totalCosts, price) {
  if (!price) return 0
  return ((Number(rent) - totalCosts) * 12) / Number(price) * 100
}

export function calcNetCashFlow(rent, totalCosts) {
  return Number(rent) - totalCosts
}

export function calcPricePerM2(price, area) {
  if (!area || !price) return 0
  return Math.round(Number(price) / Number(area))
}

export function calcCapRate(rent, totalInversion) {
  if (!totalInversion) return 0
  return (Number(rent) * 12) / totalInversion * 100
}

// ── Projected indicators ───────────────────────────────────────────────────

export function calcProjected(apt, year) {
  const ipc = (Number(apt.ipc) || 6) / 100
  const rent = Number(apt.rent) || 0
  const price = Number(apt.price) || 0
  const quota = Number(apt.quota) || 0 // quota stays fixed

  const price0 = price
  const downAmount = calcDownAmount(price0, apt.down_pct, apt.down_custom)
  const loan = calcLoan(price0, downAmount)

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

export function getYieldBadge(grossYield) {
  if (grossYield >= 7) return { label: 'Buena inversión', color: 'green' }
  if (grossYield >= 5) return { label: 'Moderada', color: 'yellow' }
  return { label: 'Revisar números', color: 'red' }
}

// ── Master compute ─────────────────────────────────────────────────────────

export function computeIndicators(apt) {
  const price = Number(apt.price) || 0
  const rent = Number(apt.rent) || 0
  const area = Number(apt.area) || 0

  const downAmount = calcDownAmount(price, apt.down_pct, apt.down_custom)
  const loan = calcLoan(price, downAmount)
  const quota = calcQuota(loan, apt.rate, apt.term)
  const efectivoRequerido = calcEfectivoRequerido(apt)
  const totalInversion = calcTotalInversion(apt)
  const totalCosts = calcTotalCosts({ ...apt, quota: apt.quota || quota })
  const grossYield = calcGrossYield(rent, price)
  const netYield = calcNetYield(rent, totalCosts, price)
  const netCashFlow = calcNetCashFlow(rent, totalCosts)
  const pricePerM2 = calcPricePerM2(price, area)
  const capRate = calcCapRate(rent, totalInversion)
  const badge = getYieldBadge(grossYield)
  const year = Number(apt.anio_proyectado) || 3
  const projected = calcProjected({ ...apt, quota: apt.quota || quota }, year)
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
