import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Users, UserPlus, Clock, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Hospital Overview</h1>
        <p className="text-gray-500">Key Performance Indicators for Today</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-4 rounded-xl card-shadow border border-slate-100">
          <p className="text-slate-400 text-xs font-medium mb-1 uppercase">Total Patients</p>
          <h3 className="text-2xl font-bold text-slate-800">{stats.totalPatients}</h3>
          <p className="text-[10px] text-green-500 font-bold mt-1">+12% vs last month</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl card-shadow border border-slate-100">
          <p className="text-slate-400 text-xs font-medium mb-1 uppercase">Today's Appointments</p>
          <h3 className="text-2xl font-bold text-slate-800">{stats.appointmentsToday}</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Across {doctors.length} doctors</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl card-shadow border border-slate-100">
          <p className="text-slate-400 text-xs font-medium mb-1 uppercase">Avg Wait Time</p>
          <h3 className="text-2xl font-bold text-slate-800">{stats.avgWaitTime} <span className="text-sm font-normal text-slate-400">min</span></h3>
          <p className="text-[10px] text-orange-500 font-bold mt-1">Critical focus needed</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl card-shadow border border-slate-100">
          <p className="text-slate-400 text-xs font-medium mb-1 uppercase">Doctor Utilization</p>
          <h3 className="text-2xl font-bold text-slate-800">{stats.utilization}%</h3>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${stats.utilization}%` }}></div>
          </div>
        </div>
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl card-shadow border border-slate-100 p-6 flex flex-col">
          <div className="mb-4">
             <h4 className="font-semibold text-slate-800">Doctor Workload</h4>
             <p className="text-xs text-slate-400">Number of assigned patients in queue per doctor.</p>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={stats.loadByDoctor} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
                 <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
                 <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Bar dataKey="patients" fill="#2563eb" radius={[4, 4, 0, 0]} />
               </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl card-shadow border border-slate-100 p-6 flex flex-col">
          <div className="mb-4">
             <h4 className="font-semibold text-slate-800">Patient Inflow Trend</h4>
             <p className="text-xs text-slate-400">Footfall over the day.</p>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
                 <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
                 <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Line type="monotone" dataKey="patients" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
               </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
