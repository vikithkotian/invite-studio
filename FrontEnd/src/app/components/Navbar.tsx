import { Link } from 'react-router-dom';
import { GlowButton } from './GlowButton';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const initials = user?.name?.split(' ').map((n) => n[0]).join('') || '';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-full px-8 py-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold font-heading bg-gradient-to-r from-[#C7B8EA] via-[#FFB5A7] to-[#A7D7F0] bg-clip-text text-transparent">
              InviteStudio
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Home</Link>
              <Link to="/templates" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Templates</Link>
              <Link to="/pricing" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Pricing</Link>
              <Link to="/about" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">About</Link>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button className="flex items-center gap-2" onClick={() => setShowMenu(!showMenu)}>
                    <div className="w-8 h-8 rounded-full bg-[#C7B8EA] text-white flex items-center justify-center font-medium">
                      {initials}
                    </div>
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm text-gray-500">Welcome,</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      </div>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setShowMenu(false)} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                          Admin Dashboard
                        </Link>
                      )}
                      <button onClick={logout} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <GlowButton to="/login" variant="ghost" size="sm">Login</GlowButton>
                  <GlowButton to="/signup" variant="primary" size="sm">Get Started</GlowButton>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}