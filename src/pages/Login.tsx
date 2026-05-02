import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Activity } from 'lucide-react';
import { DEMO_DATA } from '../lib/demo-data';

export default function Login() {
  const [email, setEmail] = useState('admin@akhilsystems.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const { login, isDemoMode } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const user = useAppStore.getState().user;
      if (user?.role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4 font-bold text-white text-2xl">
           A
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Akhil Systems</h2>
        <p className="mt-2 text-sm text-slate-400 font-medium uppercase tracking-wider">Smart OPD Optimizer</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-2xl card-shadow border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 p-6 text-center">
             <h3 className="text-lg font-bold text-slate-800">Sign in to your account</h3>
             <p className="text-slate-500 text-sm mt-1">
               {isDemoMode ? "Select a demo account below to instantly log in." : "Please configure Supabase for real auth."}
             </p>
          </div>
          <div className="p-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email address</Label>
                <div className="mt-1">
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="w-full bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</Label>
                <div className="mt-1">
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="w-full bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-10 font-bold" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {isDemoMode && (
               <div className="mt-8 pt-6 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-wider text-center">Fast Login (Demo Roles)</p>
                  <div className="grid grid-cols-1 gap-3">
                     {DEMO_DATA.users.map(u => (
                       <Button 
                          key={u.id} 
                          variant="outline" 
                          className="justify-start text-left h-auto p-3 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all font-normal"
                          onClick={() => setEmail(u.email)}
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-slate-800 text-sm">{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</div>
                            <div className="text-xs text-slate-500">{u.full_name}</div>
                          </div>
                       </Button>
                     ))}
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
