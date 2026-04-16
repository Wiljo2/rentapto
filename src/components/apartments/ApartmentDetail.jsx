import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  formatCOP, formatPct, formatCompact,
  computeIndicators, calcEscrituracionAmt,
} from '../../lib/calculations'
import YieldBadge from '../ui/YieldBadge'

function Row({ label, value, highlight }) {
  return (
    <div className={`flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0 ${highlight ? 'font-semibold' : ''}`}>
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm ${highlight ? 'text-slate-900' : 'text-slate-800'}`}>{value}</span>
    </div>
  )
}

export default function ApartmentDetail({ apt, onDelete }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState('min') // 'min' | 'full'
  const ind = computeIndicators(apt)
  const {
    grossYield, netYield, netCashFlow, pricePerM2,
    downAmount, loan, totalInversion, capRate, totalCosts, projected,
  } = ind

  const escrituracion = calcEscrituracionAmt(apt.price, apt.escrituracion_pct)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{apt.name || 'Sin nombre'}</h2>
          <p className="text-slate-500 text-sm">{apt.neighborhood || '—'}{apt.address ? ` · ${apt.address}` : ''}</p>
        </div>
        <YieldBadge grossYield={grossYield} />
      </div>

      {/* Toggle */}
      <div className="flex rounded-lg bg-slate-100 p-1 mb-6 w-fit">
        {[['min', 'Resumen'], ['full', 'Info completa']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setMode(val)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === val ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {/* Min info — always visible */}
        <div className="p-5">
          <p className="text-xs font-semibold uppercase text-slate-400 tracking-wide mb-2">Financiero</p>
          <Row label="Precio comercial" value={formatCOP(apt.price)} highlight />
          <Row label="Cuota inicial" value={`${apt.down_pct || 0}% = ${formatCOP(downAmount)}`} />
          <Row label="Monto a financiar" value={formatCOP(loan)} />
          <Row label="Cuota mensual crédito" value={formatCOP(apt.quota)} />
          <Row label="Arriendo estimado" value={formatCOP(apt.rent)} />
          <Row label="Rentabilidad bruta" value={formatPct(grossYield)} highlight />
          <Row label="Rentabilidad neta año 1" value={formatPct(netYield)} />
          <Row label="Flujo neto mensual" value={formatCOP(netCashFlow)} highlight />
          <Row label="Precio por m²" value={formatCOP(pricePerM2)} />
        </div>

        {/* Projected */}
        <div className="p-5 bg-slate-50">
          <p className="text-xs font-semibold uppercase text-slate-400 tracking-wide mb-2">
            Proyección año {apt.anio_proyectado || 3} (IPC {apt.ipc || 6}%)
          </p>
          <Row label="Arriendo proyectado" value={formatCOP(projected.rentProy)} />
          <Row label="Costos proyectados" value={formatCOP(projected.totalCostsProy)} />
          <Row label="Flujo neto proyectado" value={formatCOP(projected.cashFlowProy)} />
          <Row label="Rent. neta proyectada" value={formatPct(projected.netYieldProy)} highlight />
        </div>

        {/* Full info */}
        {mode === 'full' && (
          <>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wide mb-2">Gastos mensuales detalle</p>
              <Row label="Cuota crédito" value={formatCOP(apt.quota)} />
              <Row label="Seguros" value={formatCOP(apt.seguros)} />
              <Row label="Administración" value={formatCOP(apt.admin)} />
              <Row label={`Comisión agencia (${apt.comision_agencia_pct || 0}%)`} value={formatCOP(Math.round((apt.rent||0)*(apt.comision_agencia_pct||0)/100))} />
              <Row label="Predial" value={formatCOP(apt.tax)} />
              <Row label="Otros" value={formatCOP(apt.other_costs)} />
              <Row label="Total costos/mes" value={formatCOP(totalCosts)} highlight />
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wide mb-2">Inversión total</p>
              <Row label="Precio comercial" value={formatCOP(apt.price)} />
              <Row label="Gasto avalúo" value={formatCOP(apt.gasto_avaluo)} />
              <Row label="Estudio de títulos" value={formatCOP(apt.gasto_titulos)} />
              <Row label={`Escrituración (${apt.escrituracion_pct || 3.5}%)`} value={formatCOP(escrituracion)} />
              <Row label="Remodelación" value={formatCOP(apt.remodelacion)} />
              <Row label="Total inversión" value={formatCOP(totalInversion)} highlight />
              <Row label="Cap Rate bruto" value={formatPct(capRate)} />
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wide mb-2">Características</p>
              <Row label="Dirección" value={apt.address || '—'} />
              <Row label="Piso" value={apt.floor || '—'} />
              <Row label="Tipo" value={apt.type || '—'} />
              <Row label="Área" value={apt.area ? `${apt.area} m²` : '—'} />
              <Row label="Habitaciones" value={apt.bedrooms ?? '—'} />
              <Row label="Baños" value={apt.bathrooms ?? '—'} />
              <Row label="Parqueaderos" value={apt.parking ?? '—'} />
              <Row label="Antigüedad" value={apt.age ? `${apt.age} años` : '—'} />
              <Row label="Vista" value={apt.view || '—'} />
              <Row label="Exposición solar" value={apt.sun_exposure || '—'} />
            </div>

            {apt.amenities?.length > 0 && (
              <div className="p-5">
                <p className="text-xs font-semibold uppercase text-slate-400 tracking-wide mb-3">Amenidades</p>
                <div className="flex flex-wrap gap-2">
                  {apt.amenities.map(a => (
                    <span key={a} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {apt.notes && (
              <div className="p-5">
                <p className="text-xs font-semibold uppercase text-slate-400 tracking-wide mb-2">Notas</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{apt.notes}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={() => navigate(`/edit/${apt.id}`)}
          className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(apt.id)}
          className="px-5 py-3 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
