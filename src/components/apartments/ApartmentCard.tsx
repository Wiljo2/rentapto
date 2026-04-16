import { useNavigate } from 'react-router-dom'
import type { ApartmentRow } from '../../types'
import { formatCOP, formatCompact, formatPct } from '../../lib/calculations'
import { useComputedIndicators } from '../../hooks/useComputedIndicators'
import YieldBadge from '../ui/YieldBadge'

interface Props {
  apt: ApartmentRow
  onDelete: (id: string) => void
}

export default function ApartmentCard({ apt, onDelete }: Props) {
  const navigate = useNavigate()
  const ind = useComputedIndicators(apt)
  const { grossYield, netYield, netCashFlow, efectivoRequerido } = ind

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 truncate">{apt.name || 'Sin nombre'}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {apt.neighborhood || '—'}
            {apt.estrato ? ` · Estrato ${apt.estrato}` : ''}
            {apt.floor ? ` · Piso ${apt.floor}` : ''}
            {apt.area ? ` · ${apt.area}m²` : ''}
          </p>
        </div>
        <YieldBadge grossYield={grossYield} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-0.5">Precio</p>
          <p className="font-bold text-slate-900 text-sm">{formatCompact(apt.price)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-0.5">Rent. bruta</p>
          <p className="font-bold text-slate-900 text-sm">{formatPct(grossYield)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-0.5">Rent. neta</p>
          <p className="font-bold text-slate-900 text-sm">{formatPct(netYield)}</p>
        </div>
        <div className={`rounded-xl p-3 ${netCashFlow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="text-xs text-slate-400 mb-0.5">Flujo neto/mes</p>
          <p className={`font-bold text-sm ${netCashFlow >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            {formatCOP(netCashFlow)}
          </p>
        </div>
      </div>

      {efectivoRequerido > 0 && (
        <p className="text-xs text-slate-400 mb-3 text-center">
          Efectivo requerido: <strong className="text-slate-600">{formatCompact(efectivoRequerido)}</strong>
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/apartment/${apt.id}`)}
          className="flex-1 py-2 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
        >
          Ver detalle
        </button>
        <button
          onClick={() => navigate(`/edit/${apt.id}`)}
          className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(apt.id)}
          className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
