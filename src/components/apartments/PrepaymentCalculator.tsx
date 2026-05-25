import { useState } from 'react'
import { formatCOP, calcMonthlyRate } from '../../lib/calculations'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props {
  loan: number
  annualRate: number
  termMonths: number
  quota: number
}

interface AmortizationResult {
  monthsSaved: number
  interestSaved: number
  newTerm: number
  totalInterestWithPrepayment: number
  totalInterestOriginal: number
}

export default function PrepaymentCalculator({ loan, annualRate, termMonths, quota }: Props) {
  const [prepaymentAmount, setPrepaymentAmount] = useState<string>('')
  const [prepaymentMonth, setPrepaymentMonth] = useState<string>('1')
  const [result, setResult] = useState<AmortizationResult | null>(null)

  const calculatePrepayment = () => {
    const prepay = Number(prepaymentAmount)
    const month = Number(prepaymentMonth)

    if (!prepay || prepay <= 0 || !month || month <= 0) {
      setResult(null)
      return
    }

    const rm = calcMonthlyRate(annualRate)

    // Calculate original total interest
    const totalInterestOriginal = quota * termMonths - loan

    // Simulate amortization with prepayment
    let balance = loan
    let totalInterest = 0
    let monthCount = 0

    for (let i = 1; i <= termMonths && balance > 0; i++) {
      const interest = balance * rm
      const principal = quota - interest

      totalInterest += interest
      balance -= principal

      // Apply prepayment
      if (i === month) {
        balance = Math.max(0, balance - prepay)
      }

      monthCount = i

      if (balance <= 0) break
    }

    const monthsSaved = termMonths - monthCount
    const interestSaved = totalInterestOriginal - totalInterest

    setResult({
      monthsSaved,
      interestSaved,
      newTerm: monthCount,
      totalInterestWithPrepayment: totalInterest,
      totalInterestOriginal,
    })
  }

  const chartData = result ? [
    {
      name: 'Sin abono',
      'Intereses': result.totalInterestOriginal,
      'Capital': loan,
    },
    {
      name: 'Con abono',
      'Intereses': result.totalInterestWithPrepayment,
      'Capital': loan,
    },
  ] : []

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-200">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wide">Calculadora de abonos a capital</h3>
        <p className="text-sm text-slate-600 mt-1">Simula un abono extraordinario y ve cuánto ahorras en intereses</p>
      </div>

      <div className="p-5 space-y-4">
        {/* Current loan info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
          <div>
            <p className="text-xs text-slate-500 mb-1">Saldo préstamo</p>
            <p className="text-lg font-bold text-slate-900">{formatCOP(loan)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Cuota mensual</p>
            <p className="text-lg font-bold text-slate-900">{formatCOP(quota)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Plazo</p>
            <p className="text-lg font-bold text-slate-900">{termMonths} meses</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Tasa</p>
            <p className="text-lg font-bold text-slate-900">{annualRate}% EA</p>
          </div>
        </div>

        {/* Input form */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Monto del abono a capital
            </label>
            <input
              type="text"
              value={prepaymentAmount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '')
                setPrepaymentAmount(value)
              }}
              placeholder="Ej: 10000000"
              className="w-full px-4 py-3 text-base border-2 border-slate-300 rounded-xl focus:border-green-500 focus:outline-none"
            />
            {prepaymentAmount && (
              <p className="text-sm text-slate-500 mt-1">{formatCOP(Number(prepaymentAmount))}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mes en que harías el abono
            </label>
            <input
              type="number"
              min="1"
              max={termMonths}
              value={prepaymentMonth}
              onChange={(e) => setPrepaymentMonth(e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-slate-300 rounded-xl focus:border-green-500 focus:outline-none"
            />
          </div>

          <button
            onClick={calculatePrepayment}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Calcular ahorro
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t-2 border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <p className="text-xs font-bold uppercase text-green-600 tracking-wide mb-1">Meses ahorrados</p>
                <p className="text-3xl font-bold text-green-900">{result.monthsSaved}</p>
                <p className="text-xs text-green-700 mt-1">
                  Nuevo plazo: {result.newTerm} meses ({Math.floor(result.newTerm / 12)} años)
                </p>
              </div>
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <p className="text-xs font-bold uppercase text-blue-600 tracking-wide mb-1">Intereses ahorrados</p>
                <p className="text-2xl font-bold text-blue-900">{formatCOP(result.interestSaved)}</p>
                <p className="text-xs text-blue-700 mt-1">
                  Total intereses: {formatCOP(result.totalInterestWithPrepayment)}
                </p>
              </div>
            </div>

            {/* Chart comparison */}
            <div className="pt-4">
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wide mb-3">Comparación visual</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    stroke="#cbd5e1"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    stroke="#cbd5e1"
                    tickFormatter={(value) => `$${(value / 1_000_000).toFixed(0)}M`}
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
                  <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                  <Bar dataKey="Capital" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Intereses" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <p className="text-xs font-bold uppercase text-amber-700 tracking-wide mb-2">💡 Recomendación</p>
              <p className="text-sm text-amber-900">
                {result.interestSaved > Number(prepaymentAmount) * 0.5
                  ? 'Excelente inversión. Ahorrarás más del 50% del abono en intereses.'
                  : result.interestSaved > Number(prepaymentAmount) * 0.2
                  ? 'Buen ahorro. Vale la pena considerar el abono anticipado.'
                  : 'El ahorro en intereses es moderado. Evalúa si tienes mejores opciones de inversión.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
