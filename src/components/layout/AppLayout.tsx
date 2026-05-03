import { ReactNode, useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, Users, Calendar, Activity, Stethoscope, LogOut, Moon, Sun } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Footer } from '../Footer';

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, role, logout, isDemoMode } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!user) {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'receptionist'], color: 'text-blue-500' },
    { name: 'Patients', path: '/patients', icon: Users, roles: ['admin', 'receptionist', 'doctor'], color: 'text-green-500' },
    { name: 'Appointments', path: '/appointments', icon: Calendar, roles: ['admin', 'receptionist'], color: 'text-yellow-500' },
    { name: 'Queue Board', path: '/queue', icon: Activity, roles: ['admin', 'receptionist', 'doctor'], color: 'text-red-500' },
    { name: 'Doctor Panel', path: '/doctor', icon: Stethoscope, roles: ['doctor', 'admin'], color: 'text-blue-500' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#000000] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      {/* Sidebar - Glassmorphism */}
      <aside className="w-64 bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-10">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <img 
              src="https://aghhis.in/images/login/akhil-logo.png" 
              alt="Akhil Logo" 
              className="h-10 lg:h-12 w-auto object-contain dark:bg-white/90 dark:p-1.5 dark:rounded-lg transition-all"
            />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">Smart OPD Optimizer</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <ul className="space-y-2">
            {navItems.filter(item => item.roles.includes(role || '')).map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link flex items-center gap-3 p-3 rounded-2xl text-sm font-medium transition-all ${
                      isActive
                        ? `bg-white dark:bg-[#2C2C2E] shadow-sm dark:shadow-md ${item.color} font-bold`
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Theme</span>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-amber-400 transition-colors"
            >
              <AnimatePresence mode="wait">
                {isDarkMode ? (
                  <motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Sun className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
          <Button variant="outline" className="w-full gap-2 rounded-full bg-white dark:bg-[#1C1C1E] border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all text-slate-600 dark:text-slate-300" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F5F5F7] dark:bg-[#000000] relative">
        {/* Subtle background glow effect globally */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-green-500/5 dark:bg-green-500/10 blur-[120px] pointer-events-none" />
        
        <header className="h-16 px-8 flex items-center justify-between shrink-0 glass-header z-10 border-b border-transparent">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400">
             Smart OPD Optimizer
          </h2>
          <div className="flex items-center gap-4 text-sm mix-blend-luminosity">
            {isDemoMode && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20 font-medium text-xs">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,188,5,0.8)]"></span>
                Demo Mode Active
              </div>
            )}
            <div className="flex items-center gap-2 border-l pl-4 border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Welcome,</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user.email?.split('@')[0] || user.full_name || 'User'}</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center font-bold text-white shadow-sm overflow-hidden">
                {(user.email?.charAt(0) || user.full_name?.charAt(0) || 'U').toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto z-10 flex flex-col custom-scrollbar">
          <div className="flex-1 p-6 md:p-8 space-y-8 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
