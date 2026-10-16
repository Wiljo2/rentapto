import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SummaryPanel from '../components/form/SummaryPanel'
import ApartmentImporter from '../components/form/ApartmentImporter'
import { STEPS, StepIndicator, StepContent } from '../components/form/WizardSteps'
import { useApartmentForm } from '../hooks/useApartmentForm'
import { useSaveApartment } from '../hooks/useSaveApartment'

export default function AddEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const { data, handleChange, handleImport, loading: fetchLoading, error: fetchError } = useApartmentForm(id)
  const { save, loading: saveLoading, error: saveError } = useSaveApartment()

  async function handleSave() {
    const success = await save(data, id)
    if (success) navigate('/')
  }

  if (fetchLoading) return (
    <div className="flex justify-center items-center py-20 text-slate-400">Cargando...</div>
  )

  const isLast = step === STEPS.length - 1
  const error = fetchError || saveError

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-5">
        <button type="button" onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-700 text-sm">
          ← Volver
        </button>
        <h2 className="text-lg font-bold text-slate-900 flex-1">
          {id ? 'Editar apartamento' : 'Agregar apartamento'}
        </h2>
        <ApartmentImporter onApply={handleImport} />
      </div>

      <StepIndicator step={step} onStep={setStep} />

      <SummaryPanel data={data} />

      <StepContent step={step} data={data} onChange={handleChange} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => step === 0 ? navigate('/') : setStep(s => s - 1)}
          className="flex-1 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
        >
          {step === 0 ? 'Cancelar' : '← Anterior'}
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={saveLoading}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-semibold transition-colors"
          >
            {saveLoading ? 'Guardando...' : id ? 'Guardar cambios' : 'Guardar apartamento'}
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

      {!isLast && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saveLoading}
          className="w-full mt-2 py-2.5 text-sm text-slate-500 hover:text-slate-700 underline"
        >
          {saveLoading ? 'Guardando...' : 'Guardar ahora sin completar todos los pasos'}
        </button>
      )}
    </div>
  )
}
