import { getYieldBadge } from '../../lib/calculations'

const colorMap = {
  green:  'bg-green-100 text-green-800 border border-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  red:    'bg-red-100 text-red-800 border border-red-300',
}

export default function YieldBadge({ grossYield }) {
  const { label, color } = getYieldBadge(grossYield)
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${colorMap[color]}`}>
      {label}
    </span>
  )
}
