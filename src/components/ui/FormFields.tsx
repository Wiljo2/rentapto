/**
 * Shared form primitives used across step components.
 */
import type { InputHTMLAttributes } from 'react'

interface FieldProps {
  label: string
  hint?: string
  children: React.ReactNode
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  value: string
  onChange: (value: string) => void
}

export function TextInput({ value, onChange, placeholder, ...props }: TextInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
      {...props}
    />
  )
}

interface NumInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  value: number | string
  onChange: (value: string) => void
}

export function NumInput({ value, onChange, placeholder, step, min, max, ...props }: NumInputProps) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      step={step}
      min={min}
      max={max}
      className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-colors"
      {...props}
    />
  )
}

interface MoneyInputProps {
  value: number | string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

function formatWithSeparators(value: number | string): string {
  const str = String(value).replace(/\D/g, '')
  if (!str) return ''
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** Currency input with leading $ sign, right-aligned — used in cost tables. */
export function MoneyInput({ value, onChange, placeholder = '0', className = '' }: MoneyInputProps) {
  const displayValue = formatWithSeparators(value)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\./g, '')
    onChange(raw)
  }

  return (
    <div className={`relative w-40 ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-6 pr-2 border-2 border-slate-200 rounded-lg py-1.5 text-sm text-right focus:outline-none focus:border-green-500"
      />
    </div>
  )
}
