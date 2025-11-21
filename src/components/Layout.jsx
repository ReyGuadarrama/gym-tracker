import { NavLink, Outlet } from 'react-router-dom';
import { Home, Calendar, Dumbbell, TrendingUp, List } from 'lucide-react';

export default function Layout() {
  const navLinks = [
    { to: '/', icon: Home, label: 'Inicio' },
    { to: '/rutinas', icon: List, label: 'Rutinas' },
    { to: '/calendario', icon: Calendar, label: 'Calendario' },
    { to: '/entrenar', icon: Dumbbell, label: 'Entrenar' },
    { to: '/progreso', icon: TrendingUp, label: 'Progreso' },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b-2 border-blue-100 w-full">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg flex-shrink-0">
              <Dumbbell className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-extrabold text-gradient">
              Gym Tracker
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 py-6 pb-24 animate-fade-in overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <nav className="bg-white/90 backdrop-blur-md border-t-2 border-blue-100 fixed bottom-0 left-0 right-0 shadow-2xl w-full safe-area-bottom z-50">
        <div className="max-w-7xl mx-auto px-1">
          <div className="flex justify-around py-2">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center py-2 px-2 rounded-xl transition-all duration-300 min-w-0 ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-glow'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`
                }
              >
                <Icon size={22} strokeWidth={2.5} />
                <span className="text-xs font-semibold mt-1 truncate">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
