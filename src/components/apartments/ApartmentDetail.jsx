import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  formatCOP, formatPct, formatCompact,
  computeIndicators, calcAvaluo, calcTitulos, calcEscrituracion, calcSeguros, calcDownAmount, calcLoan, calcQuota,
} from '../../lib/calculations'
import YieldBadge from '../ui/YieldBadge'

function Row({ label, value, bold, green, red }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-medium ${bold ? 'font-bold text-slate-900' : green ? 'text-green-700' : red ? 'text-red-600' : 'text-slate-800'}`}>
        {value}
      </span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="p-5">
      <p className="text-xs font-bold uppercase text-slate-400 tracking-wide mb-2">{title}</p>
      {children}
    </div>
  )
}

export default function ApartmentDetail({ apt, onDelete }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState('min')
  const ind = computeIndicators(apt)
  const { grossYield, netYield, netCashFlow, pricePerM2, downAmount, loan, efectivoRequerido, totalInversion, capRate, totalCosts, projected, seguros } = ind

  const price = Number(apt.price) || 0
  const quota = calcQuota(loan, apt.rate, apt.term)
  const avaluo = Number(apt.gasto_avaluo) || calcAvaluo(price)
  const titulos = Number(apt.gasto_titulos) || calcTitulos(price)
  const escrituracion = Number(apt.escrituracion_override) || calcEscrituracion(price, apt.escrituracion_pct)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{apt.name || 'Sin nombre'}</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {apt.neighborhood || '—'}
            {apt.estrato ? ` · Estrato ${apt.estrato}` : ''}
            {apt.address ? ` · ${apt.address}` : ''}
          </p>
        </div>
        <YieldBadge grossYield={grossYield} />
      </div>

      {/* Toggle */}
      <div className="flex rounded-xl bg-slate-100 p-1 mb-5 w-fit">
        {[['min', 'Resumen'], ['full', 'Info completa']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setMode(val)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              mode === val ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border-2 border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {/* Financiero básico */}
        <Section title="Financiero">
          <Row label="Precio comercial" value={formatCOP(apt.price)} bold />
          <Row label="Cuota inicial" value={`${apt.down_pct || 20}% = ${formatCOP(downAmount)}`} />
          <Row label="Préstamo" value={formatCOP(loan)} />
          <Row label="Cuota mensual crédito" value={formatCOP(quota)} />
          <Row label="Arriendo estimado" value={formatCOP(apt.rent)} />
          <Row label="Rentabilidad bruta" value={formatPct(grossYield)} bold green={grossYield >= 7} red={grossYield > 0 && grossYield < 5} />
          <Row label="Rentabilidad neta año 1" value={formatPct(netYield)} />
          <Row label="Flujo neto mensual" value={formatCOP(netCashFlow)} bold green={netCashFlow > 0} red={netCashFlow < 0} />
          <Row label="Precio por m²" value={formatCOP(pricePerM2)} />
        </Section>

        {/* Proyección */}
        <Section title={`Proyección año ${apt.anio_proyectado || 3} (IPC ${apt.ipc || 6}%)`}>
          <Row label="Arriendo proyectado" value={formatCOP(projected.rentProy)} />
          <Row label="Costos proyectados" value={formatCOP(projected.totalCostsProy)} />
          <Row label="Flujo neto proyectado" value={formatCOP(projected.cashFlowProy)} green={projected.cashFlowProy > 0} red={projected.cashFlowProy < 0} />
          <Row label="Rent. neta proyectada" value={formatPct(projected.netYieldProy)} bold />
        </Section>

        {/* Full info */}
        {mode === 'full' && (
          <>
            <Section title="Inversión inicial">
              <Row label="Cuota inicial" value={formatCOP(downAmount)} />
              <Row label="Gasto avalúo (0.013%)" value={formatCOP(avaluo)} />
              <Row label="Estudio de títulos (0.013%)" value={formatCOP(titulos)} />
              <Row label={`Escrituración (${apt.escrituracion_pct || 2.5}%)`} value={formatCOP(escrituracion)} />
              <Row label="Remodelación" value={formatCOP(apt.remodelacion)} />
              <Row label="Total efectivo requerido" value={formatCOP(efectivoRequerido)} bold />
              <Row label="Total inversión (precio + gastos)" value={formatCOP(totalInversion)} />
              <Row label="Cap Rate bruto" value={formatPct(capRate)} />
            </Section>

            <Section title="Gastos mensuales detalle">
              <Row label="Cuota crédito" value={formatCOP(quota)} />
              <Row label={`Seguros (${apt.seguro_pct || 0.05}% del préstamo)`} value={formatCOP(seguros)} />
              <Row label="Administración" value={formatCOP(apt.admin)} />
              <Row label="Predial" value={formatCOP(apt.tax)} />
              <Row label="Otros" value={formatCOP(apt.other_costs)} />
              <Row label="Total gastos / mes" value={formatCOP(totalCosts)} bold />
            </Section>

            <Section title="Características">
              <Row label="Tipo" value={apt.type || '—'} />
              <Row label="Área" value={apt.area ? `${apt.area} m²` : '—'} />
              <Row label="Estrato" value={apt.estrato || '—'} />
              <Row label="Piso" value={apt.floor || '—'} />
              <Row label="Habitaciones" value={apt.bedrooms ?? '—'} />
              <Row label="Baños" value={apt.bathrooms ?? '—'} />
              <Row label="Parqueaderos" value={apt.parking ?? '—'} />
              <Row label="Antigüedad" value={apt.age ? `${apt.age} años` : '—'} />
              <Row label="Vista" value={apt.view || '—'} />
              <Row label="Exposición solar" value={apt.sun_exposure || '—'} />
            </Section>

            {apt.amenities?.length > 0 && (
              <div className="p-5">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wide mb-3">Amenidades</p>
                <div className="flex flex-wrap gap-2">
                  {apt.amenities.map(a => (
                    <span key={a} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {apt.links?.length > 0 && (
              <div className="p-5">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wide mb-3">Links</p>
                <div className="space-y-1.5">
                  {apt.links.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-600 hover:underline truncate"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {apt.notes && (
              <div className="p-5">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wide mb-2">Notas</p>
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
          className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(apt.id)}
          className="px-5 py-3 text-sm font-medium text-red-600 border-2 border-red-200 hover:bg-red-50 rounded-xl transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
