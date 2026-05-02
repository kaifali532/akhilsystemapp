import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, Users, Calendar, Activity, Stethoscope, LogOut, TestTube } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, role, logout, isDemoMode } = useAppStore();
  const navigate = useNavigate();

  if (!user) {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'receptionist'] },
    { name: 'Patients', path: '/patients', icon: Users, roles: ['admin', 'receptionist', 'doctor'] },
    { name: 'Appointments', path: '/appointments', icon: Calendar, roles: ['admin', 'receptionist'] },
    { name: 'Queue Board', path: '/queue', icon: Activity, roles: ['admin', 'receptionist', 'doctor'] },
    { name: 'Doctor Panel', path: '/doctor', icon: Stethoscope, roles: ['doctor', 'admin'] },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col transition-all duration-300">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xl">
              A
            </div>
            <span className="font-bold text-lg tracking-tight">Akhil Systems</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Smart OPD Optimizer</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <ul className="space-y-1">
            {navItems.filter(item => item.roles.includes(role || '')).map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link flex items-center gap-3 p-3 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-500'
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

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white mb-4">
            <p className="text-[10px] opacity-60 uppercase mb-1">Support Line</p>
            <p className="text-sm font-semibold">1800-AKHIL-SYS</p>
          </div>
          <Button variant="outline" className="w-full gap-2 border-slate-200 text-slate-600" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-semibold text-slate-800">
             Smart OPD Queue & Appointment Optimizer
          </h2>
          <div className="flex items-center gap-4 text-sm">
            {isDemoMode && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 font-medium text-xs">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                Demo Mode Active
              </div>
            )}
            <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
              <span className="text-slate-400">Welcome,</span>
              <span className="font-semibold text-slate-700">{user.full_name}</span>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 border border-slate-300 overflow-hidden">
                {user.full_name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-slate-50 p-6 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
