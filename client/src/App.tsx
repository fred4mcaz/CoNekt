import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if user has completed minimum profile requirements
  const completedQuestions = [
    'relationshipGoals',
    'currentFocus',
    'connectionValue',
    'currentObsession',
    'endlessTopic',
    'curiousThoughts',
    'energizingConversations',
    'excitedInConversation',
    'conversationComfort',
    'handlingTension',
    'presenceTriggers',
    'groundingPractices',
    'patternsToMoveBeyond',
    'growthThroughChallenge',
    'connectionComfortLevel',
    'buildExploreCreate',
    'closingOffTriggers',
    'feelingMostMyself'
  ].filter(key => {
    const value = user[key as keyof typeof user];
    return value && value.toString().trim().length > 0;
  }).length;

  const minimumRequired = 5;
  return completedQuestions >= minimumRequired ? <Navigate to="/dashboard" /> : <Navigate to="/profile" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<RootRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;


