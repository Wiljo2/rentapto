import { useNavigate } from 'react-router-dom'
import type { ApartmentRow, Indicators } from '../../types'
import { formatCOP, formatCompact, formatPct } from '../../lib/calculations'

interface BadgeProps {
  children: React.ReactNode
  className: string
}

function Badge({ children, className }: BadgeProps) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
      {children}
    </span>
  )
}

interface MetricRowProps {
  label: string
  value: string
  bold?: boolean
  highlight?: boolean
  green?: boolean
  red?: boolean
}

function MetricRow({ label, value, bold, highlight, green, red }: MetricRowProps) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-slate-500">{label}</span>
      <span className={`font-medium ${
        highlight ? 'text-green-700 font-bold'
        : green ? 'text-green-600'
        : red ? 'text-red-600'
        : bold ? 'text-slate-900 font-semibold'
        : 'text-slate-700'
      }`}>
        {value}
      </span>
    </div>
  )
}

interface Props {
  apt: ApartmentRow
  indicators: Indicators
  isBestYield: boolean
  isLowestPrice: boolean
  isBestCashFlow: boolean
  maxGrossYield: number
}

export default function ComparisonCard({
  apt,
  indicators: ind,
  isBestYield,
  isLowestPrice,
  isBestCashFlow,
  maxGrossYield,
}: Props) {
  const navigate = useNavigate()

  const downPctDisplay = apt.price
    ? ((ind.downAmount / Number(apt.price)) * 100).toFixed(0)
    : apt.down_pct || 0

  const badgeColor =
    ind.badge.color === 'green' ? 'bg-green-100 text-green-800 border-green-300'
    : ind.badge.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
    : 'bg-red-100 text-red-800 border-red-300'

  return (
    <div
      className={`flex-shrink-0 bg-white rounded-2xl border-2 p-5 transition-shadow hover:shadow-md ${
        isBestYield ? 'border-green-500 shadow-green-100 shadow-md' : 'border-slate-200'
      }`}
      style={{ width: '268px' }}
    >
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-slate-900 text-sm leading-tight">{apt.name || 'Sin nombre'}</h3>
          {isBestYield && (
            <span className="flex-shrink-0 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-semibold">
              ★ Mejor
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">{apt.neighborhood || '—'}</p>

        <div className="flex flex-wrap gap-1 mt-2">
          <Badge className={badgeColor}>{ind.badge.label}</Badge>
          {isLowestPrice && <Badge className="bg-blue-100 text-blue-800 border-blue-300">Menor precio</Badge>}
          {isBestCashFlow && ind.netCashFlow > 0 && (
            <Badge className="bg-purple-100 text-purple-800 border-purple-300">Mejor flujo</Badge>
          )}
        </div>
      </div>

      <div className="space-y-2.5 mb-4">
        <MetricRow label="Precio" value={formatCompact(apt.price)} bold />
        <MetricRow label={`Cuota inicial (${downPctDisplay}%)`} value={formatCompact(ind.downAmount)} />
        <MetricRow label="Cuota crédito/mes" value={formatCOP(apt.quota)} />
        <MetricRow label="Arriendo" value={formatCOP(apt.rent)} />
        <div className="border-t border-slate-100 pt-2.5">
          <MetricRow label="Rent. bruta" value={formatPct(ind.grossYield)} bold highlight={isBestYield} />
          <MetricRow label="Rent. neta" value={formatPct(ind.netYield)} />
          <MetricRow
            label="Flujo neto/mes"
            value={formatCOP(ind.netCashFlow)}
            green={ind.netCashFlow > 0}
            red={ind.netCashFlow < 0}
          />
          <MetricRow label="Precio/m²" value={formatCOP(ind.pricePerM2)} />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Rentabilidad relativa</span>
          <span>{formatPct(ind.grossYield)}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              ind.badge.color === 'green' ? 'bg-green-500'
              : ind.badge.color === 'yellow' ? 'bg-yellow-400'
              : 'bg-red-400'
            }`}
            style={{ width: `${maxGrossYield > 0 ? (ind.grossYield / maxGrossYield) * 100 : 0}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => navigate(`/apartment/${apt.id}`)}
        className="w-full py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
      >
        Ver detalle
      </button>
    </div>
  )
}
