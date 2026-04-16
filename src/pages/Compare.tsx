import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApartments } from '../hooks/useApartments'
import { computeIndicators } from '../lib/calculations'
import ComparisonCard from '../components/apartments/ComparisonCard'

export default function Compare() {
  const navigate = useNavigate()

  const { apartments, loading } = useApartments()

  // Compute indicators once for all apartments
  const apartmentsWithIndicators = useMemo(
    () => apartments.map(apt => ({ apt, ind: computeIndicators(apt) })),
    [apartments]
  )

  const { maxGrossYield, minPrice, maxNetCashFlow } = useMemo(() => {
    const yields = apartmentsWithIndicators.map(({ ind }) => ind.grossYield)
    const prices = apartmentsWithIndicators.map(({ apt }) => Number(apt.price) || Infinity)
    const cashFlows = apartmentsWithIndicators.map(({ ind }) => ind.netCashFlow)

    return {
      maxGrossYield: Math.max(...yields, 0),
      minPrice: Math.min(...prices, Infinity),
      maxNetCashFlow: Math.max(...cashFlows, 0),
    }
  }, [apartmentsWithIndicators])

  if (loading) return (
    <div className="flex justify-center items-center py-20 text-slate-400">Cargando...</div>
  )

  if (apartments.length === 0) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">📊</div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">Sin apartamentos para comparar</h3>
      <p className="text-slate-400 text-sm mb-6">Agrega apartamentos para verlos aquí lado a lado</p>
      <button
        onClick={() => navigate('/add')}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl"
      >
        Agregar apartamento
      </button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Comparar apartamentos</h2>
        <p className="text-sm text-slate-500 mt-0.5">{apartments.length} inmueble{apartments.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: `${apartments.length * 280}px` }}>
          {apartmentsWithIndicators.map(({ apt, ind }) => (
            <ComparisonCard
              key={apt.id}
              apt={apt}
              indicators={ind}
              isBestYield={ind.grossYield === maxGrossYield && maxGrossYield > 0}
              isLowestPrice={Number(apt.price) === minPrice && minPrice < Infinity}
              isBestCashFlow={ind.netCashFlow === maxNetCashFlow}
              maxGrossYield={maxGrossYield}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
