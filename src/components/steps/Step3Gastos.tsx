import type { ApartmentFormData } from '../../types'
import {
  calcDownAmount, calcLoan, calcQuota, calcSeguros,
  calcTotalCosts, calcNetCashFlow, formatCOP, formatPct,
} from '../../lib/calculations'
import { MoneyInput } from '../ui/FormFields'

interface Props {
  data: ApartmentFormData
  onChange: (field: keyof ApartmentFormData, value: unknown) => void
}

export default function Step3Gastos({ data, onChange }: Props) {
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

          {/* Admin */}
          <div className="flex items-center gap-3 py-3 border-b border-slate-100">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Administración</p>
            </div>
            <MoneyInput value={data.admin} onChange={v => onChange('admin', v)} />
          </div>

          {/* Predial */}
          <div className="flex items-center gap-3 py-3 border-b border-slate-100">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Impuesto predial</p>
              <p className="text-xs text-slate-400">Valor mensual (predial anual ÷ 12)</p>
            </div>
            <MoneyInput value={data.tax} onChange={v => onChange('tax', v)} />
          </div>

          {/* Otros */}
          <div className="flex items-center gap-3 py-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Otros</p>
            </div>
            <MoneyInput value={data.other_costs} onChange={v => onChange('other_costs', v)} />
          </div>
        </div>

        <div className="border-t-2 border-slate-200 px-5 py-3 flex justify-between items-center bg-slate-50">
          <p className="text-sm font-semibold text-slate-700">Total gastos / mes</p>
          <p className="text-base font-bold text-slate-900">{formatCOP(totalCosts)}</p>
        </div>

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
