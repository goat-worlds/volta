import { useNavigate } from 'react-router-dom';
import { setToken } from '../../store/api';

export default function QuickLogin() {
  const navigate = useNavigate();

  const quickLogins = [
    {
      id: 'dg',
      role: 'DG',
      email: 'dg@volta.com',
      password: 'password123',
      description: 'Directeur Général',
      color: 'bg-blue-600'
    },
    {
      id: 'supplier',
      role: 'SUPPLIER',
      email: 'supplier@volta.com',
      password: 'password123',
      description: 'Fournisseur',
      color: 'bg-green-600'
    },
    {
      id: 'verificateur',
      role: 'VERIFICATEUR',
      email: 'verificateur@volta.com',
      password: 'password123',
      description: 'Vérificateur Technique',
      color: 'bg-purple-600'
    }
  ];

  const handleQuickLogin = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        // La clé doit être celle que lit api.ts, sinon le jeton est stocké mais
        // jamais envoyé et l'utilisateur reste anonyme pour le backend.
        setToken(data.token);
        // /dashboard n'existe pas dans le routage : la redirection dépend du rôle.
        navigate(data.user.role === 'ADMIN' ? '/admin'
          : data.user.role === 'SUPPLIER' ? '/supplier'
          : data.user.role === 'TECHNICAL' ? '/technical'
          : '/client');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-white text-center mb-2">VOLTA</h1>
        <p className="text-gray-400 text-center mb-12">Gestion d'Équipements BTP</p>

        <div className="space-y-4">
          {quickLogins.map((login) => (
            <button
              key={login.id}
              onClick={() => handleQuickLogin(login.email, login.password)}
              className={`w-full ${login.color} hover:opacity-90 text-white font-bold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105`}
            >
              <div className="text-lg">{login.role}</div>
              <div className="text-sm opacity-90">{login.description}</div>
              <div className="text-xs opacity-75 mt-1">{login.email}</div>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-white font-bold mb-3">Données de Test</h3>
          <div className="text-xs text-gray-300 space-y-1">
            <p><strong>Équipements IDs:</strong> 1, 2, 3</p>
            <p><strong>Fournisseurs IDs:</strong> 1, 2, 3</p>
            <p><strong>Utilisateurs IDs:</strong> 1 (DG), 2 (SUPPLIER), 3 (VERIFICATEUR)</p>
          </div>
        </div>

        <a href="/connexion" className="block mt-6 text-center text-gray-400 hover:text-white text-sm">
          Connexion manuelle
        </a>
      </div>
    </div>
  );
}
