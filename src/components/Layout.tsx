import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Frame, PlusCircle, LayoutGrid, LogOut } from 'lucide-react';

export default function Layout() {
  const { profile, signOut } = useAuth();
  const isOwner = profile?.role === 'owner';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Frame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Frame Business</h1>
                <p className="text-xs text-slate-400 hidden sm:block">Order Management</p>
              </div>
            </div>

            <nav className="flex items-center gap-1 sm:gap-2">
              {isOwner && (
                <NavLink
                  to="/entry"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`
                  }
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Entry</span>
                </NavLink>
              )}
              <NavLink
                to="/display"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Display</span>
              </NavLink>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-all ml-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
