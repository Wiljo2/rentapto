import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  formatCOP, formatCompact, formatPct,
  computeIndicators, calcDownAmount,
} from '../lib/calculations'

function Badge({ children, className }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
      {children}
    </span>
  )
}

export default function Compare() {
  const navigate = useNavigate()
  const [apartments, setApartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('apartments')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setApartments(data || [])
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center py-20 text-slate-400">Cargando...</div>
  )

  if (apartments.length === 0) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">📊</div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">Sin apartamentos para comparar</h3>
      <p className="text-slate-400 text-sm mb-6">Agrega apartamentos para verlos aquí lado a lado</p>
      <button
        onClick={() => navigate('/add')}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl"
      >
        Agregar apartamento
      </button>
    </div>
  )

  // Compute indicators for all
  const withInd = apartments.map(apt => ({ apt, ind: computeIndicators(apt) }))

  // Find bests
  const maxGrossYield = Math.max(...withInd.map(({ ind }) => ind.grossYield))
  const minPrice = Math.min(...withInd.map(({ apt }) => Number(apt.price) || Infinity))
  const maxNetCashFlow = Math.max(...withInd.map(({ ind }) => ind.netCashFlow))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Comparar apartamentos</h2>
        <p className="text-sm text-slate-500 mt-0.5">{apartments.length} inmueble{apartments.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: `${apartments.length * 280}px` }}>
          {withInd.map(({ apt, ind }) => {
            const isBestYield = ind.grossYield === maxGrossYield && maxGrossYield > 0
            const isLowestPrice = Number(apt.price) === minPrice && minPrice < Infinity
            const isBestCashFlow = ind.netCashFlow === maxNetCashFlow

            const downAmount = calcDownAmount(apt.price, apt.down_pct, apt.down_custom)
            const downPctDisplay = apt.price
              ? ((downAmount / Number(apt.price)) * 100).toFixed(0)
              : apt.down_pct || 0

            const badgeColor =
              ind.badge.color === 'green' ? 'bg-green-100 text-green-800 border-green-300'
              : ind.badge.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
              : 'bg-red-100 text-red-800 border-red-300'

            return (
              <div
                key={apt.id}
                className={`flex-shrink-0 w-68 bg-white rounded-2xl border-2 p-5 transition-shadow hover:shadow-md ${
                  isBestYield ? 'border-green-500 shadow-green-100 shadow-md' : 'border-slate-200'
                }`}
                style={{ width: '268px' }}
              >
                {/* Header */}
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

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge className={badgeColor}>{ind.badge.label}</Badge>
                    {isLowestPrice && <Badge className="bg-blue-100 text-blue-800 border-blue-300">Menor precio</Badge>}
                    {isBestCashFlow && ind.netCashFlow > 0 && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-300">Mejor flujo</Badge>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-2.5 mb-4">
                  <MetricRow label="Precio" value={formatCompact(apt.price)} bold />
                  <MetricRow label={`Cuota inicial (${downPctDisplay}%)`} value={formatCompact(downAmount)} />
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

                {/* Yield bar */}
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

                {/* CTA */}
                <button
                  onClick={() => navigate(`/apartment/${apt.id}`)}
                  className="w-full py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  Ver detalle
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MetricRow({ label, value, bold, highlight, green, red }) {
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
