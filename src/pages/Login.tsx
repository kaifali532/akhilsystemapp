import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/label';
import { DEMO_DATA } from '../lib/demo-data';
import { motion, AnimatePresence } from 'motion/react';
import { Stethoscope, ArrowLeft, Mail, Lock, Shield } from 'lucide-react';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('receptionist');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login, signup, isDemoMode } = useAppStore();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (isSignup) {
        await signup(email, password, role);
      } else {
        await login(email, password);
      }
      if (useAppStore.getState().role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* Left Pane - Branding & Art (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-slate-900 dark:bg-[#0a0a0c]">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-60">
           <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/30 blur-[120px] pointer-events-none mix-blend-screen" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/30 blur-[120px] pointer-events-none mix-blend-screen" />
        </div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

        <div className="relative z-10">
          <NavLink to="/" className="inline-flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Akhil Systems
            </span>
          </NavLink>
        </div>

        <div className="relative z-10 mb-20 text-white">
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="text-5xl font-black tracking-tight leading-[1.1] mb-6"
           >
             Welcome to the future of<br/>OPD management.
           </motion.h1>
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.4 }}
             className="text-blue-100 text-lg font-medium max-w-md leading-relaxed opacity-80"
           >
             Streamline your patient flow, connect doctors instantly, and manage appointments with unprecedented ease.
           </motion.p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-transparent lg:bg-white/50 lg:dark:bg-[#1A1A1C]/50 lg:backdrop-blur-3xl lg:border-l border-white/20 dark:border-slate-800/50">
        
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-6 left-6 z-20">
          <NavLink to="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
              <Stethoscope className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </NavLink>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-12 flex items-center justify-center flex-col custom-scrollbar">
          
          {/* Subtle Mobile Glows */}
          <div className="lg:hidden fixed top-0 left-0 w-full h-full pointer-events-none opacity-40">
             <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-blue-500/20 blur-[100px]" />
          </div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.5, type: "spring" }}
             className="w-full max-w-sm relative z-10"
          >
             <div className="glass-card bg-white/70 dark:bg-black/40 backdrop-blur-3xl border border-white/50 dark:border-slate-800 shadow-2xl rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
               
               <div className="text-center mb-10">
                 <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                   {isSignup ? 'Create Account' : 'Welcome Back'}
                 </h2>
                 <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                   {isSignup ? 'Sign up to modernize your clinic.' : 'Sign in to your intelligent dashboard.'}
                 </p>
               </div>

               <form onSubmit={handleAuth} className="space-y-5">
                 <AnimatePresence mode="popLayout">
                   {errorMsg && (
                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 text-sm font-bold text-red-600 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                       <Shield className="w-4 h-4 shrink-0" />
                       {errorMsg}
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <div className="space-y-1.5">
                   <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email</Label>
                   <div className="relative group">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                     <Input 
                       id="email" 
                       type="email" 
                       value={email} 
                       onChange={(e) => setEmail(e.target.value)} 
                       required 
                       placeholder="doctor@clinic.com"
                       className="pl-11 h-12 rounded-2xl bg-white/50 dark:bg-black/50 border-white dark:border-slate-800 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500/50 backdrop-blur-sm transition-all"
                     />
                   </div>
                 </div>

                 <div className="space-y-1.5">
                   <Label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Password</Label>
                   <div className="relative group">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                     <Input 
                       id="password" 
                       type="password" 
                       value={password} 
                       onChange={(e) => setPassword(e.target.value)} 
                       required 
                       placeholder="••••••••"
                       className="pl-11 h-12 rounded-2xl bg-white/50 dark:bg-black/50 border-white dark:border-slate-800 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500/50 backdrop-blur-sm transition-all"
                     />
                   </div>
                 </div>

                 <AnimatePresence mode="popLayout">
                   {isSignup && (
                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden">
                       <Label htmlFor="role" className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mt-2 block">Account Role</Label>
                       <select
                         id="role"
                         value={role}
                         onChange={(e) => setRole(e.target.value)}
                         className="w-full h-12 px-4 bg-white/50 dark:bg-black/50 border border-white dark:border-slate-800 rounded-2xl shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500/50 backdrop-blur-sm transition-all text-sm font-medium outline-none"
                       >
                         <option value="admin">Admin</option>
                         <option value="doctor">Doctor</option>
                         <option value="receptionist">Receptionist</option>
                       </select>
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <Button type="submit" className="w-full h-12 mt-4 rounded-2xl font-bold tracking-wider uppercase text-sm bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-[0_8px_20px_rgba(66,133,244,0.3)] hover:shadow-[0_10px_25px_rgba(66,133,244,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0" disabled={loading}>
                   {loading ? 'Authenticating...' : (isSignup ? 'Create Account' : 'Sign In')}
                 </Button>
               </form>

               <div className="mt-8 text-center border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
                 <button 
                   type="button" 
                   onClick={() => {
                     setIsSignup(!isSignup);
                     setErrorMsg('');
                   }}
                   className="text-sm font-bold text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                 >
                   {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                 </button>
               </div>
             </div>

             {isDemoMode && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
                   <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                     <span className="w-8 h-px bg-slate-300 dark:bg-slate-700"></span>
                     Fast Login (Demo Roles)
                     <span className="w-8 h-px bg-slate-300 dark:bg-slate-700"></span>
                   </p>
                   <div className="grid grid-cols-1 gap-3">
                      {DEMO_DATA.users.map(u => (
                        <Button 
                           key={u.id} 
                           variant="outline" 
                           onClick={() => { setEmail(u.email); setPassword('demo123'); setIsSignup(false); }}
                           className="group justify-start text-left h-auto p-4 rounded-2xl border-white dark:border-slate-800 bg-white/40 dark:bg-black/20 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800/50 shadow-sm backdrop-blur-sm transition-all hover:scale-[1.02]"
                         >
                           <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                              <span className="font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">{u.role.charAt(0).toUpperCase()}</span>
                           </div>
                           <div className="flex-1">
                             <div className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</div>
                             <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{u.full_name}</div>
                           </div>
                        </Button>
                      ))}
                   </div>
                </motion.div>
             )}
             
             <div className="mt-8 flex justify-center">
                <NavLink to="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest flex items-center gap-2 transition-colors">
                   <ArrowLeft className="w-3 h-3" /> Back to Product Site
                </NavLink>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
