import { formatCOP, formatPct, computeIndicators } from '../../lib/calculations'

const StatBox = ({ label, value, highlight }) => (
  <div className={`rounded-xl p-4 ${highlight ? 'bg-green-600 text-white' : 'bg-white border border-slate-200'}`}>
    <p className={`text-xs font-medium mb-1 ${highlight ? 'text-green-100' : 'text-slate-500'}`}>{label}</p>
    <p className={`text-lg font-bold ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</p>
  </div>
)

export default function SummaryPanel({ data }) {
  const ind = computeIndicators(data)
  const { grossYield, netYield, netCashFlow, badge, totalInversion, capRate, pricePerM2 } = ind

  const badgeColor = badge.color === 'green'
    ? 'bg-green-100 text-green-800 border-green-300'
    : badge.color === 'yellow'
    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
    : 'bg-red-100 text-red-800 border-red-300'

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Resumen en tiempo real</h3>
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
          {badge.label}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatBox label="Precio comercial" value={formatCOP(data.price)} />
        <StatBox label="Rentab. bruta" value={formatPct(grossYield)} highlight={badge.color === 'green'} />
        <StatBox label="Rentab. neta" value={formatPct(netYield)} />
        <StatBox label="Flujo neto/mes" value={formatCOP(netCashFlow)} />
        <StatBox label="Cap Rate" value={formatPct(capRate)} />
        <StatBox label="Precio/m²" value={formatCOP(pricePerM2)} />
      </div>
      {totalInversion > 0 && (
        <p className="text-xs text-slate-500 mt-3">
          Total inversión (precio + gastos compra): <strong>{formatCOP(totalInversion)}</strong>
        </p>
      )}
    </div>
  )
}
