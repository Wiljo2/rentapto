import { formatCOP } from '../../lib/calculations'

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

function NumInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || '0'}
        className="w-full pl-7 pr-3 border border-slate-300 rounded-lg py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>
  )
}

function PctInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || '0'}
        className="w-full pl-3 pr-7 border border-slate-300 rounded-lg py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
    </div>
  )
}

export default function IncomeCosts({ data, onChange }) {
  const comisionAmt = Math.round((Number(data.rent) || 0) * (Number(data.comision_agencia_pct) || 0) / 100)

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2">
        Ingresos y costos mensuales
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Arriendo estimado/mes">
          <NumInput value={data.rent} onChange={v => onChange('rent', v)} />
        </Field>
        <Field label="Cuota crédito/mes" hint="Se llena automáticamente desde la calculadora">
          <NumInput value={data.quota} onChange={v => onChange('quota', v)} />
        </Field>
        <Field label="Seguros mensuales" hint="Vida + incendio/terremoto">
          <NumInput value={data.seguros} onChange={v => onChange('seguros', v)} />
        </Field>
        <Field label="Administración/mes">
          <NumInput value={data.admin} onChange={v => onChange('admin', v)} />
        </Field>
        <Field label="Comisión agencia arrendamiento" hint={`${data.comision_agencia_pct}% del arriendo = ${formatCOP(comisionAmt)}/mes`}>
          <PctInput value={data.comision_agencia_pct} onChange={v => onChange('comision_agencia_pct', v)} />
        </Field>
        <Field label="Impuesto predial/mes">
          <NumInput value={data.tax} onChange={v => onChange('tax', v)} />
        </Field>
        <Field label="Otros costos/mes">
          <NumInput value={data.other_costs} onChange={v => onChange('other_costs', v)} />
        </Field>
      </div>

      <h3 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 pt-2">
        Gastos de compra
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Gasto avalúo">
          <NumInput value={data.gasto_avaluo} onChange={v => onChange('gasto_avaluo', v)} />
        </Field>
        <Field label="Estudio de títulos">
          <NumInput value={data.gasto_titulos} onChange={v => onChange('gasto_titulos', v)} />
        </Field>
        <Field label="Escrituración (% del precio)" hint={`≈ ${formatCOP(Math.round((Number(data.price)||0) * (Number(data.escrituracion_pct)||3.5)/100))}`}>
          <PctInput value={data.escrituracion_pct} onChange={v => onChange('escrituracion_pct', v)} />
        </Field>
        <Field label="Remodelación">
          <NumInput value={data.remodelacion} onChange={v => onChange('remodelacion', v)} />
        </Field>
      </div>

      <h3 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 pt-2">
        Proyección
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="IPC proyectado (%)" hint="Default 6%">
          <PctInput value={data.ipc} onChange={v => onChange('ipc', v)} />
        </Field>
        <Field label="Año proyectado" hint="Indicadores al año N">
          <input
            type="number"
            value={data.anio_proyectado}
            onChange={e => onChange('anio_proyectado', e.target.value)}
            min={1} max={20}
            className="w-full px-3 border border-slate-300 rounded-lg py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </Field>
      </div>
    </div>
  )
}
