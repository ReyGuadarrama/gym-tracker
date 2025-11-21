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
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-10 border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg">
              <Dumbbell className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-extrabold text-gradient">
              Gym Tracker
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 animate-fade-in">
        <Outlet />
      </main>

      <nav className="bg-white/90 backdrop-blur-md border-t-2 border-blue-100 sticky bottom-0 shadow-2xl">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex justify-around py-3">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center py-3 px-5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-glow scale-105'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:scale-105'
                  }`
                }
              >
                <Icon size={24} strokeWidth={2.5} />
                <span className="text-xs font-semibold mt-1">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
