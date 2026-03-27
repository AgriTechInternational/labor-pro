import { Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Target, Clock } from 'lucide-react';
import { useState } from 'react';

import OverviewPage from './pages/OverviewPage';
import AttendancePage from './pages/AttendancePage';
import ProductionPage from './pages/ProductionPage';
import ShiftsPage from './pages/ShiftsPage';

export default function App() {
  const [user] = useState({ email: 'admin@laborapp.com', role: 'ADMIN' });

  return (
    <div className="flex flex-col h-screen text-slate-100 bg-slate-950 font-sans relative overflow-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none"></div>

      <header className="p-4 pt-safe sticky top-0 flex justify-between items-center z-50 border-b border-slate-800/60 backdrop-blur-xl bg-slate-950/70">
        <h1 className="text-xl font-extrabold tracking-tight text-white hidden sm:block flex-1 drop-shadow-sm">
          Labor <span className="text-blue-500 font-black">App</span>
        </h1>
        <h1 className="text-lg font-extrabold tracking-tight text-white sm:hidden flex-1 drop-shadow-sm">
          Labor<span className="text-blue-500 font-black">App</span>
        </h1>
        
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-400 hidden sm:block bg-slate-900/80 px-3 py-1.5 rounded-[10px] border border-slate-800 shadow-inner">{user.email}</span>
          <div className="flex items-center space-x-2 bg-emerald-900/30 px-3 py-1.5 rounded-[10px] border border-emerald-500/20 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 drop-shadow-sm">Live</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative p-4 lg:p-6 pb-28 md:pb-8 hide-scrollbar z-10">
        <div className="max-w-4xl mx-auto h-full animate-in fade-in">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/production" element={<ProductionPage />} />
            <Route path="/shifts" element={<ShiftsPage />} />
          </Routes>
        </div>
      </main>

      <nav className="fixed bottom-0 w-full bg-slate-950/80 backdrop-blur-2xl border-t border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] z-50 pb-safe md:pb-4 rounded-t-[32px] md:rounded-none">
        <div className="max-w-4xl mx-auto flex justify-around items-center overflow-x-auto px-5 py-3 hide-scrollbar gap-1">
          <NavTab to="/" icon={<LayoutDashboard size={24} />} label="Overview" exact />
          <NavTab to="/attendance" icon={<Users size={24} />} label="Attendance" />
          <NavTab to="/production" icon={<Target size={24} />} label="Production" />
          <NavTab to="/shifts" icon={<Clock size={24} />} label="Shifts" />
        </div>
      </nav>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-in { animation: fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.98) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

function NavTab({ to, icon, label, exact }: { to: string; icon: React.ReactNode; label: string, exact?: boolean }) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center min-w-[65px] px-2 py-2.5 space-y-1.5 transition-all duration-300 group relative flex-shrink-0 rounded-[16px] overflow-hidden ${
          isActive ? 'text-blue-400 bg-blue-900/20 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-0.5 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : ''}`}>
            {icon}
          </div>
          <span className={`text-[9px] sm:text-[10px] font-bold tracking-wider whitespace-nowrap transition-all duration-300 ${isActive ? 'opacity-100 text-blue-300' : 'opacity-70 group-hover:opacity-100'}`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
