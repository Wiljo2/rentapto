import {
  calcDownAmount, calcLoan, calcAvaluo, calcTitulos,
  calcEscrituracion, calcEfectivoRequerido, formatCOP, formatPct,
} from '../../lib/calculations'

function CostRow({ label, hint, auto, value, onChange, pct, onPctChange }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
      {pct !== undefined && (
        <div className="flex items-center gap-1 w-24">
          <input
            type="number"
            value={pct}
            onChange={e => onPctChange(e.target.value)}
            step="0.01"
            className="w-full border-2 border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-green-500"
          />
          <span className="text-xs text-slate-400">%</span>
        </div>
      )}
      <div className="w-44">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
          <input
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={auto > 0 ? String(auto) : '0'}
            className="w-full pl-6 pr-2 border-2 border-slate-200 rounded-lg py-1.5 text-sm text-right focus:outline-none focus:border-green-500"
          />
        </div>
        {auto > 0 && !value && (
          <p className="text-xs text-slate-400 text-right mt-0.5">{formatCOP(auto)} (auto)</p>
        )}
      </div>
    </div>
  )
}

export default function Step2Inversion({ data, onChange }) {
  const price = Number(data.price) || 0
  const downAmount = calcDownAmount(price, data.down_pct, data.down_custom)
  const loan = calcLoan(price, downAmount)

  const autoAvaluo = calcAvaluo(price)
  const autoTitulos = calcTitulos(price)
  const autoEscrituracion = calcEscrituracion(price, data.escrituracion_pct)
  const efectivo = calcEfectivoRequerido(data)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">Inversión inicial requerida</h3>
        <p className="text-sm text-slate-500">
          Todo se calcula automáticamente del precio. Puedes editar cualquier valor.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-5 py-3 flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-200">
          <span>Concepto</span>
          <span>Valor</span>
        </div>

        <div className="px-5">
          {/* Cuota inicial - read only */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-700">Cuota inicial</p>
              <p className="text-xs text-slate-400">{data.down_pct || 20}% del precio</p>
            </div>
            <p className="text-sm font-bold text-slate-900">{formatCOP(downAmount)}</p>
          </div>

          <CostRow
            label="Gasto de avalúo"
            hint={`${formatPct(0.013, 3)} del precio`}
            auto={autoAvaluo}
            value={data.gasto_avaluo}
            onChange={v => onChange('gasto_avaluo', v)}
          />
          <CostRow
            label="Estudio de títulos"
            hint={`${formatPct(0.013, 3)} del precio`}
            auto={autoTitulos}
            value={data.gasto_titulos}
            onChange={v => onChange('gasto_titulos', v)}
          />
          <CostRow
            label="Escrituración"
            hint={`${data.escrituracion_pct || 2.5}% del precio`}
            auto={autoEscrituracion}
            value={data.escrituracion_override}
            onChange={v => onChange('escrituracion_override', v)}
            pct={data.escrituracion_pct}
            onPctChange={v => onChange('escrituracion_pct', v)}
          />
          <CostRow
            label="Remodelación"
            hint="Si aplica"
            auto={0}
            value={data.remodelacion}
            onChange={v => onChange('remodelacion', v)}
          />
        </div>

        {/* Total */}
        <div className="bg-green-50 border-t-2 border-green-200 px-5 py-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-green-900">Total efectivo requerido</p>
            <p className="text-xs text-green-700">Cuota inicial + gastos de compra</p>
          </div>
          <p className="text-xl font-bold text-green-900">{formatCOP(efectivo)}</p>
        </div>
      </div>

      {/* Context note */}
      <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
        <p className="text-xs text-slate-500">
          El préstamo bancario cubre <strong>{formatCOP(loan)}</strong>. El banco financia el inmueble,
          no los gastos de compra — esos siempre salen de tu bolsillo.
        </p>
      </div>
    </div>
  )
}
