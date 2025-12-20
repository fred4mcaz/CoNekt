import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Match } from '../types/user';
import MatchCard from '../components/matches/MatchCard';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ matches: Match[] }>('/matches');
      setMatches(response.data.matches);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch matches');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await api.post<{ matches: Match[] }>('/matches/refresh');
      setMatches(response.data.matches);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to refresh matches');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CoNekt</h1>
              {user && (
                <p className="text-gray-600">Welcome back, {user.name}! 👋</p>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Edit Profile
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              People We Think You'd Connect With
            </h2>
            <p className="text-gray-600">
              Based on your profile, here are your top matches for meaningful connections
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Matches'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Finding your matches...</div>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-xl text-gray-600 mb-4">
              We're working on finding your matches.
            </p>
            <p className="text-gray-500 mb-6">
              Add more about yourself to help us connect you with amazing people!
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Complete Your Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <MatchCard key={match.user.id} match={match} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

