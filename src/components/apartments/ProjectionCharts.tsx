import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { YearlyProjection, TotalReturn } from '../../types'
import { formatCompact, formatCOP, formatPct } from '../../lib/calculations'

interface Props {
  projections: YearlyProjection[]
  totalReturn: TotalReturn
}

export default function ProjectionCharts({ projections, totalReturn }: Props) {
  const { capitalPropio, plusvaliaTotal, flujoTotalHorizonte, retornoTotalAnualizado, veredicto } = totalReturn

  // Transform data for chart
  const chartData = projections.map(p => ({
    year: `Año ${p.year}`,
    'Valor inmueble': p.propertyValue,
    'Flujo acumulado': p.cumulativeCashFlow,
    'Capital invertido': capitalPropio,
  }))

  const verdictColors = {
    emerald: 'bg-emerald-100 border-emerald-300 text-emerald-900',
    green: 'bg-green-100 border-green-300 text-green-900',
    yellow: 'bg-yellow-100 border-yellow-300 text-yellow-900',
    red: 'bg-red-100 border-red-300 text-red-900',
  }

  return (
    <div className="space-y-6">
      {/* Veredicto */}
      <div className={`p-6 rounded-2xl border-2 ${verdictColors[veredicto.color]}`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">{veredicto.label}</h3>
            <p className="text-sm opacity-80">{veredicto.description}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatPct(retornoTotalAnualizado, 1)}</div>
            <div className="text-xs opacity-70 mt-1">Retorno anualizado</div>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border-2 border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-400 tracking-wide mb-2">Capital propio</p>
          <p className="text-2xl font-bold text-slate-900">{formatCompact(capitalPropio)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border-2 border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-400 tracking-wide mb-2">Plusvalía total</p>
          <p className="text-2xl font-bold text-green-700">{formatCompact(plusvaliaTotal)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border-2 border-slate-200">
          <p className="text-xs font-bold uppercase text-slate-400 tracking-wide mb-2">Flujo acumulado</p>
          <p className="text-2xl font-bold text-blue-700">{formatCompact(flujoTotalHorizonte)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl border-2 border-slate-200">
        <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wide mb-4">
          Proyección a {projections.length} años
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: '#64748b' }}
              stroke="#cbd5e1"
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              stroke="#cbd5e1"
              tickFormatter={(value) => formatCompact(value)}
            />
            <Tooltip
              formatter={(value: number) => formatCOP(value)}
              contentStyle={{
                backgroundColor: 'white',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '14px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
            />
            <Line
              type="monotone"
              dataKey="Valor inmueble"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Flujo acumulado"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Capital invertido"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Yearly breakdown table */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wide">Detalle año por año</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-3 font-semibold text-slate-600">Año</th>
                <th className="text-right p-3 font-semibold text-slate-600">Valor inmueble</th>
                <th className="text-right p-3 font-semibold text-slate-600">Ingreso anual</th>
                <th className="text-right p-3 font-semibold text-slate-600">Costos anuales</th>
                <th className="text-right p-3 font-semibold text-slate-600">Flujo neto</th>
                <th className="text-right p-3 font-semibold text-slate-600">Flujo acum.</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p, idx) => (
                <tr key={p.year} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-3 font-medium text-slate-900">{p.year}</td>
                  <td className="p-3 text-right text-green-700 font-medium">{formatCompact(p.propertyValue)}</td>
                  <td className="p-3 text-right text-slate-700">{formatCompact(p.yearlyRent)}</td>
                  <td className="p-3 text-right text-slate-700">{formatCompact(p.yearlyCosts)}</td>
                  <td className={`p-3 text-right font-medium ${p.netCashFlow >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {formatCompact(p.netCashFlow)}
                  </td>
                  <td className={`p-3 text-right font-medium ${p.cumulativeCashFlow >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                    {formatCompact(p.cumulativeCashFlow)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
