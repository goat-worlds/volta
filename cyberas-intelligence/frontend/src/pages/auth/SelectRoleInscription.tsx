import { useNavigate } from 'react-router-dom'
import { Shield, ChevronLeft, Building2, Users, Lock } from 'lucide-react'

export function SelectRoleInscription() {
  const navigate = useNavigate()

  const roles = [
    {
      icon: Building2,
      title: 'RSSI',
      description: 'Responsable Sécurité Informatique - Créez votre organisation',
      path: '/inscription/rssi',
      color: 'from-blue-600 to-blue-700',
    },
    {
      icon: Users,
      title: 'Auditeur',
      description: 'Vous êtes invité par une organisation',
      path: '/login',
      color: 'from-green-600 to-green-700',
    },
    {
      icon: Lock,
      title: 'Admin',
      description: 'Administration CYBERAS',
      path: '/inscription/admin',
      color: 'from-purple-600 to-purple-700',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark via-surface-dark to-bg-dark flex flex-col items-center justify-center px-4 py-12">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-text-on-dark-muted hover:text-white transition"
      >
        <ChevronLeft size={20} />
        Retour
      </button>

      <div className="mx-auto max-w-4xl w-full">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield size={40} className="text-brand" />
            <span className="text-3xl font-bold text-white">CYBERAS</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Rejoindre CYBERAS</h1>
          <p className="text-text-on-dark-muted">Selectionnez votre role pour commencer</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <button
                key={role.title}
                onClick={() => navigate(role.path)}
                className="group flex flex-col items-center gap-4 p-8 rounded-xl border-2 border-border-dark bg-surface-dark/50 hover:border-brand transition transform hover:scale-105"
              >
                <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${role.color}`}>
                  <Icon size={32} className="text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">{role.title}</h3>
                  <p className="text-sm text-text-on-dark-muted mt-2">{role.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-center text-xs text-text-on-dark-muted mt-12">
          Deja inscrit? <button onClick={() => navigate('/login')} className="text-brand hover:text-brand-light">Se connecter</button>
        </p>
      </div>
    </div>
  )
}
