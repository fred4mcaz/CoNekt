import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showProfileButton?: boolean;
  showLogoutButton?: boolean;
  children?: ReactNode;
}

export default function Header({
  title,
  subtitle,
  showProfileButton = false,
  showLogoutButton = true,
  children
}: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-gray-600">{subtitle}</p>
            )}
            {user && !subtitle && (
              <p className="text-gray-600">Welcome back, {user.name}! 👋</p>
            )}
            {children}
          </div>
          <div className="flex gap-4 items-center">
            {showProfileButton && (
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Edit Profile
              </button>
            )}
            {showLogoutButton && (
              <button
                onClick={logout}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
