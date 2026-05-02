import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Users, Calendar, Activity, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { patients, appointments, queue, doctors } = useAppStore();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(a => a.appointment_time.startsWith(today));
    
    // Average Wait Time calculation
    const waitTimes = queue.map(q => q.estimated_wait_time).filter(t => t !== undefined && t > 0);
    const avgWait = waitTimes.length ? waitTimes.reduce((a,b) => a+b, 0) / waitTimes.length : 0;
    
    // Utilization
    const utilized = queue.filter(q => q.status === 'done' || q.status === 'in_progress').length;
    const utilization = todaysAppointments.length ? (utilized / todaysAppointments.length) * 100 : 0;

    // Doctor loads
    const loadByDoctor = doctors.map(d => {
       const docQueue = queue.filter(q => q.doctor_id === d.id);
       return {
          name: d.name.replace('Dr. ', ''),
          patients: docQueue.length
       };
    });

    return {
      totalPatients: patients.length,
      appointmentsToday: todaysAppointments.length,
      avgWaitTime: Math.round(avgWait),
      utilization: Math.round(utilization),
      loadByDoctor
    };
  }, [patients, appointments, queue, doctors]);

  // Hourly trend mock data for charts
  const hourlyData = [
    { hour: '09:00', patients: 12 },
    { hour: '10:00', patients: 18 },
    { hour: '11:00', patients: 25 },
    { hour: '12:00', patients: 15 },
    { hour: '13:00', patients: 5 },
    { hour: '14:00', patients: 22 },
    { hour: '15:00', patients: 30 },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Hospital Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Key Performance Indicators for Today</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-[1.5rem] card-shadow transition-all duration-300 neon-hover-blue group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Total Patients</p>
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-full text-blue-500 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{stats.totalPatients}</h3>
          <p className="text-xs text-blue-500 font-bold tracking-wide">+12% vs last month</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-[1.5rem] card-shadow transition-all duration-300 neon-hover-yellow group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Today's Appts</p>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-500/10 rounded-full text-yellow-500 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{stats.appointmentsToday}</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide">Across {doctors.length} doctors</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-[1.5rem] card-shadow transition-all duration-300 neon-hover-red group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Avg Wait Time</p>
            <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-full text-red-500 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{stats.avgWaitTime} <span className="text-base font-medium text-slate-400">min</span></h3>
          <p className="text-xs text-red-500 font-bold tracking-wide">Critical focus needed</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-[1.5rem] card-shadow transition-all duration-300 neon-hover-green group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Utilization</p>
            <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-full text-green-500 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">{stats.utilization}%</h3>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.utilization}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-green-500 h-full rounded-full shadow-[0_0_10px_rgba(52,168,83,0.8)]" 
            />
          </div>
        </motion.div>
      </div>

      {/* Charts Block */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-[1.5rem] card-shadow p-6 sm:p-8 flex flex-col transition-all duration-300 neon-hover-blue">
          <div className="mb-6">
             <h4 className="font-bold text-slate-800 dark:text-white text-lg">Doctor Workload</h4>
             <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Number of assigned patients in queue per doctor.</p>
          </div>
          <div className="w-full h-[300px] min-h-[300px]">
             {stats.loadByDoctor && stats.loadByDoctor.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.loadByDoctor} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                    <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', color: '#0f172a', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="patients" fill="#4285F4" radius={[6, 6, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                 No workload data available
               </div>
             )}
          </div>
        </div>

        <div className="glass-card rounded-[1.5rem] card-shadow p-6 sm:p-8 flex flex-col transition-all duration-300 neon-hover-yellow">
          <div className="mb-6">
             <h4 className="font-bold text-slate-800 dark:text-white text-lg">Patient Inflow Trend</h4>
             <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Footfall over the day.</p>
          </div>
          <div className="w-full h-[300px] min-h-[300px]">
             {hourlyData && hourlyData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                    <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', color: '#0f172a', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="patients" stroke="#FBBC05" strokeWidth={4} dot={{ r: 5, fill: '#FBBC05', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  </LineChart>
               </ResponsiveContainer>
             ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                 No trend data available
               </div>
             )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
