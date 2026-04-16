import {
  computeIndicators, formatCOP, formatCompact, formatPct,
} from '../../lib/calculations'

const badgeColors = {
  green:  'bg-green-100 text-green-800 border-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  red:    'bg-red-100 text-red-800 border-red-300',
}

function Stat({ label, value, sub, green, red }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-slate-400 font-medium mb-0.5">{label}</span>
      <span className={`text-base font-bold ${green ? 'text-green-700' : red ? 'text-red-600' : 'text-slate-900'}`}>
        {value}
      </span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </div>
  )
}

export default function SummaryPanel({ data }) {
  const ind = computeIndicators(data)
  const { grossYield, netYield, netCashFlow, efectivoRequerido, quota, badge } = ind

  if (!data.price) return null

  return (
    <div className={`border-2 rounded-2xl p-4 mb-6 ${
      badge.color === 'green' ? 'bg-green-50 border-green-200'
      : badge.color === 'yellow' ? 'bg-yellow-50 border-yellow-200'
      : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Resumen en vivo</span>
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColors[badge.color]}`}>
          {badge.label}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        <Stat label="Precio" value={formatCompact(data.price)} />
        <Stat label="Cuota mensual" value={formatCOP(quota)} />
        <Stat label="Rent. bruta" value={formatPct(grossYield)}
          green={grossYield >= 7} red={grossYield > 0 && grossYield < 5} />
        <Stat label="Rent. neta" value={formatPct(netYield)} />
        <Stat
          label="Flujo neto/mes"
          value={formatCOP(netCashFlow)}
          green={netCashFlow > 0} red={netCashFlow < 0}
        />
        <Stat label="Efectivo requerido" value={formatCompact(efectivoRequerido)} sub="cuota inicial + gastos" />
      </div>
    </div>
  )
}
