import type { ApartmentFormData } from '../../types'
import Step1Esencial from '../steps/Step1Esencial'
import Step2Inversion from '../steps/Step2Inversion'
import Step3Gastos from '../steps/Step3Gastos'
import Step4Detalles from '../steps/Step4Detalles'

export const STEPS = [
  { label: 'Lo esencial', short: '1' },
  { label: 'Inversión',   short: '2' },
  { label: 'Gastos',      short: '3' },
  { label: 'Detalles',    short: '4' },
]

interface StepIndicatorProps {
  step: number
  onStep: (step: number) => void
}

export function StepIndicator({ step, onStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((s, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <button
            type="button"
            onClick={() => onStep(i)}
            className="flex items-center gap-2 group"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i === step ? 'bg-green-600 text-white scale-110'
              : i < step ? 'bg-green-200 text-green-800'
              : 'bg-slate-200 text-slate-500'
            }`}>
              {i < step ? '✓' : s.short}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${
              i === step ? 'text-green-700' : i < step ? 'text-green-600' : 'text-slate-400'
            }`}>
              {s.label}
            </span>
          </button>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-green-300' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

interface StepContentProps {
  step: number
  data: ApartmentFormData
  onChange: (field: keyof ApartmentFormData, value: unknown) => void
}

export function StepContent({ step, data, onChange }: StepContentProps) {
  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 mb-6">
      {step === 0 && <Step1Esencial data={data} onChange={onChange} />}
      {step === 1 && <Step2Inversion data={data} onChange={onChange} />}
      {step === 2 && <Step3Gastos data={data} onChange={onChange} />}
      {step === 3 && <Step4Detalles data={data} onChange={onChange} />}
    </div>
  )
}
