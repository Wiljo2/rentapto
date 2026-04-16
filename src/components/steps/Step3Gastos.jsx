import {
  calcDownAmount, calcLoan, calcQuota, calcSeguros,
  calcTotalCosts, calcNetCashFlow, formatCOP, formatPct,
} from '../../lib/calculations'

function CostRow({ label, hint, value, onChange, suffix, readOnly, highlight }) {
  return (
    <div className={`flex items-center gap-3 py-3 border-b border-slate-100 last:border-0 ${highlight ? 'bg-green-50 -mx-5 px-5 rounded' : ''}`}>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${highlight ? 'text-green-800' : 'text-slate-700'}`}>{label}</p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
      {readOnly ? (
        <p className="text-sm font-bold text-slate-900">{formatCOP(value)}</p>
      ) : (
        <div className="flex items-center gap-2">
          {suffix && (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={suffix.value}
                onChange={e => suffix.onChange(e.target.value)}
                step="0.01"
                className="w-16 border-2 border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-green-500"
              />
              <span className="text-xs text-slate-400">%</span>
            </div>
          )}
          <div className="relative w-40">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
            <input
              type="number"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="0"
              className="w-full pl-6 pr-2 border-2 border-slate-200 rounded-lg py-1.5 text-sm text-right focus:outline-none focus:border-green-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function Step3Gastos({ data, onChange }) {
  const price = Number(data.price) || 0
  const downAmount = calcDownAmount(price, data.down_pct, data.down_custom)
  const loan = calcLoan(price, downAmount)
  const quota = calcQuota(loan, data.rate, data.term)
  const seguros = calcSeguros(loan, data.seguro_pct)
  const totalCosts = calcTotalCosts({ ...data, quota })
  const cashFlow = calcNetCashFlow(Number(data.rent) || 0, totalCosts)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">Gastos mensuales</h3>
        <p className="text-sm text-slate-500">
          Ajusta los valores según la realidad del inmueble. Los seguros se calculan sobre el saldo del préstamo.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-200">
          <span>Concepto</span>
          <span>Valor / mes</span>
        </div>

        <div className="px-5">
          {/* Cuota crédito - read only */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-700">Cuota crédito (sin seguros)</p>
              <p className="text-xs text-slate-400">Tasa {data.rate || 13.5}% · {data.term || 240} meses</p>
            </div>
            <p className="text-sm font-bold text-slate-900">{formatCOP(quota)}</p>
          </div>

          {/* Seguros - % of loan */}
          <div className="flex items-center gap-3 py-3 border-b border-slate-100">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Seguros (vida + incendio)</p>
              <p className="text-xs text-slate-400">% mensual del saldo préstamo · {formatCOP(loan)}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={data.seguro_pct}
                  onChange={e => onChange('seguro_pct', e.target.value)}
                  step="0.01"
                  className="w-16 border-2 border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-green-500"
                />
                <span className="text-xs text-slate-400">%</span>
              </div>
              <p className="text-sm font-bold text-slate-900 w-32 text-right">{formatCOP(seguros)}</p>
            </div>
          </div>

          {/* Admin - from step 1 editable */}
          <div className="flex items-center gap-3 py-3 border-b border-slate-100">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Administración</p>
            </div>
            <div className="relative w-40">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
              <input
                type="number"
                value={data.admin}
                onChange={e => onChange('admin', e.target.value)}
                placeholder="0"
                className="w-full pl-6 pr-2 border-2 border-slate-200 rounded-lg py-1.5 text-sm text-right focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          {/* Predial */}
          <div className="flex items-center gap-3 py-3 border-b border-slate-100">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Impuesto predial</p>
              <p className="text-xs text-slate-400">Valor mensual (predial anual ÷ 12)</p>
            </div>
            <div className="relative w-40">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
              <input
                type="number"
                value={data.tax}
                onChange={e => onChange('tax', e.target.value)}
                placeholder="0"
                className="w-full pl-6 pr-2 border-2 border-slate-200 rounded-lg py-1.5 text-sm text-right focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          {/* Otros */}
          <div className="flex items-center gap-3 py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Otros</p>
            </div>
            <div className="relative w-40">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
              <input
                type="number"
                value={data.other_costs}
                onChange={e => onChange('other_costs', e.target.value)}
                placeholder="0"
                className="w-full pl-6 pr-2 border-2 border-slate-200 rounded-lg py-1.5 text-sm text-right focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Total costs */}
        <div className="border-t-2 border-slate-200 px-5 py-3 flex justify-between items-center bg-slate-50">
          <p className="text-sm font-semibold text-slate-700">Total gastos / mes</p>
          <p className="text-base font-bold text-slate-900">{formatCOP(totalCosts)}</p>
        </div>

        {/* Net cash flow */}
        <div className={`px-5 py-4 flex justify-between items-center ${cashFlow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div>
            <p className={`text-sm font-bold ${cashFlow >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              Flujo neto mensual
            </p>
            <p className={`text-xs ${cashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              Arriendo − total gastos
            </p>
          </div>
          <p className={`text-xl font-bold ${cashFlow >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            {formatCOP(cashFlow)}
          </p>
        </div>
      </div>

      {/* Projection settings */}
      <div className="border-2 border-slate-200 rounded-2xl p-5">
        <p className="text-sm font-semibold text-slate-700 mb-4">Proyección con IPC</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">IPC proyectado (%)</label>
            <input
              type="number"
              value={data.ipc}
              onChange={e => onChange('ipc', e.target.value)}
              step="0.1"
              className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Año a proyectar</label>
            <input
              type="number"
              value={data.anio_proyectado}
              onChange={e => onChange('anio_proyectado', e.target.value)}
              min={1} max={20}
              className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
