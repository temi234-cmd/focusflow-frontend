import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { auth } from '../services/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">Loading...</div>
  
  if (!user) return <Navigate to="/signin" />

  return <>{children}</>
}