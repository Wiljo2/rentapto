import { useState } from 'react'
import type { ApartmentFormData } from '../../types'
import {
  calcDownAmount, calcLoan, calcQuota, calcMonthlyRate,
  formatCOP, formatPct,
} from '../../lib/calculations'

const DOWN_PCTS = [20, 25, 30]
const LOAN_TYPES = ['Hipotecario (Pesos)', 'Leasing', 'Otro']

interface BigInputProps {
  label: string
  value: number | string
  onChange: (value: string) => void
  prefix?: string
  hint?: string
}

function formatWithSeparators(value: number | string): string {
  const str = String(value).replace(/\D/g, '')
  if (!str) return ''
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function BigInput({ label, value, onChange, prefix = '$', hint }: BigInputProps) {
  const displayValue = formatWithSeparators(value)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\./g, '')
    onChange(raw)
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{prefix}</span>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          className={`w-full border-2 border-slate-200 rounded-xl py-3.5 text-lg font-semibold text-slate-900 focus:outline-none focus:border-green-500 transition-colors ${prefix ? 'pl-8 pr-4' : 'px-4'}`}
          placeholder="0"
        />
      </div>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

interface Props {
  data: ApartmentFormData
  onChange: (field: keyof ApartmentFormData, value: unknown) => void
}

export default function Step1Esencial({ data, onChange }: Props) {
  const [mortgageOpen, setMortgageOpen] = useState(false)

  const price = Number(data.price) || 0
  const downAmount = calcDownAmount(price, data.down_pct, data.down_custom)
  const loan = calcLoan(price, downAmount)
  const rm = data.rate ? calcMonthlyRate(Number(data.rate)) : null
  const quota = calcQuota(loan, data.rate, data.term)

  function handleDownPct(pct: number) {
    onChange('down_pct', pct)
    onChange('down_custom', '')
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Nombre / Referencia
        </label>
        <input
          type="text"
          value={data.name}
          onChange={e => onChange('name', e.target.value)}
          placeholder="Ej: Apto Laureles 301"
          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-green-500 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BigInput
          label="Precio del inmueble"
          value={data.price}
          onChange={v => onChange('price', v)}
          hint={price > 0 ? formatCOP(price) : undefined}
        />
        <BigInput
          label="Arriendo estimado / mes"
          value={data.rent}
          onChange={v => onChange('rent', v)}
        />
        <BigInput
          label="Administración / mes"
          value={data.admin}
          onChange={v => onChange('admin', v)}
        />
      </div>

      <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setMortgageOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Crédito hipotecario</span>
            {quota > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Cuota: {formatCOP(quota)}/mes
              </span>
            )}
          </div>
          <span className="text-slate-400 text-sm">{mortgageOpen ? '▲' : '▼'}</span>
        </button>

        {mortgageOpen && (
          <div className="px-5 py-5 space-y-5 border-t border-slate-200">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Cuota inicial</label>
              <div className="flex gap-2 flex-wrap mb-3">
                {DOWN_PCTS.map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleDownPct(pct)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                      data.down_pct === pct && !data.down_custom
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-green-400'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Custom $</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatWithSeparators(data.down_custom)}
                    onChange={e => {
                      const raw = e.target.value.replace(/\./g, '')
                      onChange('down_custom', raw)
                      onChange('down_pct', 0)
                    }}
                    placeholder="Monto"
                    className="w-32 border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>
              {price > 0 && (
                <div className="flex gap-6 text-sm text-slate-600 bg-green-50 rounded-lg px-4 py-2.5 border border-green-200">
                  <span>Cuota inicial: <strong className="text-slate-900">{formatCOP(downAmount)}</strong></span>
                  <span>Préstamo: <strong className="text-slate-900">{formatCOP(loan)}</strong></span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Tasa efectiva anual (%)</label>
                <input
                  type="number"
                  value={data.rate}
                  onChange={e => onChange('rate', e.target.value)}
                  step="0.1"
                  className="w-full border-2 border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Plazo (meses)</label>
                <input
                  type="number"
                  value={data.term}
                  onChange={e => onChange('term', e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Tipo de crédito</label>
                <select
                  value={data.loan_type}
                  onChange={e => onChange('loan_type', e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500"
                >
                  {LOAN_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {quota > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex gap-6">
                <div>
                  <p className="text-xs text-green-700 font-medium">Tasa nominal mensual</p>
                  <p className="text-base font-bold text-green-900">{rm !== null ? formatPct(rm * 100, 4) : '—'}</p>
                </div>
                <div className="border-l border-green-300 pl-4">
                  <p className="text-xs text-green-700 font-medium">Cuota mensual</p>
                  <p className="text-base font-bold text-green-900">{formatCOP(quota)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
