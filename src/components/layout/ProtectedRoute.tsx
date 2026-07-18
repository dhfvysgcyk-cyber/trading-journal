import { Navigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) return <div className="loading-screen">Lade…</div>
  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}
