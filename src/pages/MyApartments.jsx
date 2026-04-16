import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ApartmentCard from '../components/apartments/ApartmentCard'
import ApartmentDetail from '../components/apartments/ApartmentDetail'

export default function MyApartments() {
  const navigate = useNavigate()
  const { id } = useParams() // detail view route: /apartment/:id
  const [apartments, setApartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchApartments()
  }, [])

  async function fetchApartments() {
    setLoading(true)
    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setApartments(data || [])
    setLoading(false)
  }

  async function handleDelete(aptId) {
    if (deleteConfirm !== aptId) {
      setDeleteConfirm(aptId)
      return
    }
    const { error } = await supabase.from('apartments').delete().eq('id', aptId)
    if (error) { setError(error.message); return }
    setDeleteConfirm(null)
    if (id === aptId) navigate('/')
    setApartments(prev => prev.filter(a => a.id !== aptId))
  }

  if (loading) return (
    <div className="flex justify-center items-center py-20 text-slate-400">Cargando...</div>
  )

  // Detail view
  if (id) {
    const apt = apartments.find(a => a.id === id)
    if (!apt) return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-700 mb-4 block">← Volver</button>
        <p className="text-slate-500">Apartamento no encontrado.</p>
      </div>
    )
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-700 mb-6 block text-sm">
          ← Volver a la lista
        </button>
        {deleteConfirm === apt.id && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
            <span>¿Eliminar este apartamento? Esta acción no se puede deshacer.</span>
            <div className="flex gap-2 ml-4">
              <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 bg-white border border-red-200 rounded-lg">Cancelar</button>
              <button onClick={() => handleDelete(apt.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg">Eliminar</button>
            </div>
          </div>
        )}
        <ApartmentDetail apt={apt} onDelete={handleDelete} />
      </div>
    )
  }

  // List view
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mis apartamentos</h2>
          <p className="text-sm text-slate-500 mt-0.5">{apartments.length} inmueble{apartments.length !== 1 ? 's' : ''} guardado{apartments.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => navigate('/add')}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
        >
          + Agregar
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
      )}

      {apartments.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🏢</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No tienes apartamentos guardados</h3>
          <p className="text-slate-400 text-sm mb-6">Agrega tu primer inmueble para comenzar a comparar</p>
          <button
            onClick={() => navigate('/add')}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
          >
            Agregar apartamento
          </button>
        </div>
      ) : (
        <>
          {/* Delete confirmation banner */}
          {deleteConfirm && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
              <span>¿Confirmar eliminación? Haz clic en Eliminar de nuevo.</span>
              <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 bg-white border border-red-200 rounded-lg ml-4">
                Cancelar
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {apartments.map(apt => (
              <ApartmentCard key={apt.id} apt={apt} onDelete={handleDelete} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
