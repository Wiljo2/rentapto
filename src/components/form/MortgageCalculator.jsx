import { useEffect } from 'react'
import { calcQuota, calcDownAmount, calcLoan, calcMonthlyRate, formatCOP, formatPct } from '../../lib/calculations'

const LOAN_TYPES = ['Hipotecario (Pesos)', 'Leasing', 'Otro']
const DOWN_PCTS = [20, 25, 30]

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

function NumInput({ value, onChange, placeholder, prefix }) {
  return (
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>}
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border border-slate-300 rounded-lg py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${prefix ? 'pl-7 pr-3' : 'px-3'}`}
      />
    </div>
  )
}

export default function MortgageCalculator({ data, onChange }) {
  const price = Number(data.price) || 0
  const downAmount = calcDownAmount(price, data.down_pct, data.down_custom)
  const loan = calcLoan(price, downAmount)
  const rm = data.rate ? calcMonthlyRate(Number(data.rate)) : null
  const computedQuota = calcQuota(loan, data.rate, data.term)

  // Auto-fill quota field when calculated value changes
  useEffect(() => {
    if (computedQuota > 0) {
      onChange('quota', computedQuota)
    }
  }, [computedQuota])

  function handleDownPct(pct) {
    onChange('down_pct', pct)
    onChange('down_custom', '')
  }

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2">
        Calculadora hipotecaria
      </h3>

      <Field label="Precio de venta">
        <NumInput prefix value={data.price} onChange={v => onChange('price', v)} placeholder="0" />
      </Field>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Cuota inicial</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {DOWN_PCTS.map(pct => (
            <button
              key={pct}
              type="button"
              onClick={() => handleDownPct(pct)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                data.down_pct === pct && !data.down_custom
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-green-400'
              }`}
            >
              {pct}%
            </button>
          ))}
          <div className="flex items-center gap-1">
            <span className="text-sm text-slate-500">Custom $</span>
            <input
              type="number"
              value={data.down_custom}
              onChange={e => { onChange('down_custom', e.target.value); onChange('down_pct', 0) }}
              placeholder="Monto"
              className="w-32 border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        {price > 0 && (
          <div className="flex gap-6 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
            <span>Cuota inicial: <strong className="text-slate-900">{formatCOP(downAmount)}</strong></span>
            <span>Monto a financiar: <strong className="text-slate-900">{formatCOP(loan)}</strong></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Tasa efectiva anual (%)" hint="Ej: 13.5">
          <NumInput value={data.rate} onChange={v => onChange('rate', v)} placeholder="13.5" />
        </Field>
        <Field label="Plazo (meses)" hint="Ej: 180">
          <NumInput value={data.term} onChange={v => onChange('term', v)} placeholder="180" />
        </Field>
        <Field label="Tipo de crédito">
          <select
            value={data.loan_type}
            onChange={e => onChange('loan_type', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {LOAN_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
      </div>

      {/* Calculated results */}
      {rm !== null && computedQuota > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row gap-3">
          <div>
            <p className="text-xs text-green-700 font-medium">Tasa nominal mensual</p>
            <p className="text-lg font-bold text-green-900">{formatPct(rm * 100, 4)}</p>
          </div>
          <div className="sm:border-l border-green-300 sm:pl-4">
            <p className="text-xs text-green-700 font-medium">Cuota mensual calculada</p>
            <p className="text-lg font-bold text-green-900">{formatCOP(computedQuota)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
