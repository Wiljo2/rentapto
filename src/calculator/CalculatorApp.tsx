import { useState } from 'react'
import SummaryPanel from '../components/form/SummaryPanel'
import { STEPS, StepIndicator, StepContent } from '../components/form/WizardSteps'
import ApartmentDetail from '../components/apartments/ApartmentDetail'
import { useLocalForm } from './useLocalForm'

export default function CalculatorApp() {
  const { data, handleChange, reset } = useLocalForm()
  const [step, setStep] = useState(0)
  const [view, setView] = useState<'form' | 'analysis'>('form')

  const isLast = step === STEPS.length - 1
  const hasPrice = Number(data.price) > 0

  function showView(next: 'form' | 'analysis') {
    setView(next)
    window.scrollTo(0, 0)
  }

  function handleReset() {
    if (!window.confirm('¿Borrar todos los datos y empezar un cálculo nuevo?')) return
    reset()
    setStep(0)
    showView('form')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between h-14">
          <span className="font-bold text-slate-900 flex items-center gap-2">
            <span className="text-lg">🏢</span>
            <span>RentApto</span>
            <span className="text-sm font-medium text-slate-400">Calculadora</span>
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Nuevo cálculo
          </button>
        </div>
      </header>

      <main>
        {view === 'analysis' ? (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <button
              type="button"
              onClick={() => showView('form')}
              className="text-slate-500 hover:text-slate-700 mb-6 block text-sm"
            >
              ← Volver a los datos
            </button>
            <ApartmentDetail apt={data} onEdit={() => showView('form')} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6">
            <StepIndicator step={step} onStep={setStep} />

            <SummaryPanel data={data} />

            <StepContent step={step} data={data} onChange={handleChange} />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="flex-1 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                ← Anterior
              </button>
              {isLast ? (
                <button
                  type="button"
                  onClick={() => showView('analysis')}
                  disabled={!hasPrice}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-semibold transition-colors"
                >
                  Ver análisis →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(s => s + 1)}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Siguiente →
                </button>
              )}
            </div>

            {!hasPrice ? (
              <p className="mt-3 text-center text-xs text-slate-400">
                Ingresa el precio del inmueble para ver el análisis.
              </p>
            ) : !isLast && (
              <button
                type="button"
                onClick={() => showView('analysis')}
                className="w-full mt-2 py-2.5 text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Ver análisis sin completar todos los pasos
              </button>
            )}

            <p className="mt-6 text-center text-xs text-slate-400">
              Los datos se guardan solo en este navegador.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
