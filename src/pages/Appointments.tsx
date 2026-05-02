import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { format, parseISO } from 'date-fns';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Appointments() {
  const { appointments, patients, doctors, bookAppointment } = useAppStore();
  const [open, setOpen] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const enrichedAppointments = useMemo(() => {
    return appointments.map(a => {
       const patient = patients.find(p => p.id === a.patient_id);
       const doctor = doctors.find(d => d.id === a.doctor_id);
       return { ...a, patient, doctor };
    }).sort((a,b) => new Date(b.appointment_time).getTime() - new Date(a.appointment_time).getTime());
  }, [appointments, patients, doctors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(selectedPatient && selectedDoctor && date && time) {
       const dt = new Date(`${date}T${time}:00`).toISOString();
       bookAppointment(selectedPatient, selectedDoctor, dt);
       setOpen(false);
       setSelectedPatient(''); setSelectedDoctor(''); setDate(''); setTime('');
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Appointments</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Manage hospital bookings and schedule.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="w-full sm:w-auto" />}>
            <>
              <Plus className="w-4 h-4 mr-2" /> Book Appointment
            </>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] overflow-hidden rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-black/90 backdrop-blur-xl">
            <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Schedule New Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-bold text-slate-500">Select Patient</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger className="rounded-xl h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Search patient..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {patients.map(p => (
                       <SelectItem key={p.id} value={p.id} className="rounded-lg">{p.name} ({p.phone})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-bold text-slate-500">Select Doctor</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger className="rounded-xl h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Choose doctor..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {doctors.map(d => (
                       <SelectItem key={d.id} value={d.id} className="rounded-lg">{d.name} - {d.specialization}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider font-bold text-slate-500">Date</Label>
                  <input type="date" className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" required value={date} onChange={e=>setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider font-bold text-slate-500">Time</Label>
                  <input type="time" className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" required value={time} onChange={e=>setTime(e.target.value)} />
                </div>
              </div>

              <DialogFooter className="mt-8">
                <Button type="submit" className="w-full">Confirm Booking</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <motion.div variants={itemVariants} className="glass-card rounded-[1.5rem] card-shadow flex flex-col neon-hover-yellow transition-all duration-300 overflow-hidden">
        <div className="p-5 border-b border-white/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/50 dark:bg-[#1C1C1E]/50">
           <h4 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
             <CalendarIcon className="w-5 h-5 text-yellow-500" />
             All Appointments
           </h4>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr className="border-b border-white/50 dark:border-slate-800/50">
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600 dark:text-slate-300 divide-y divide-white/20 dark:divide-slate-800/50">
              {enrichedAppointments.map((app) => (
                <tr key={app.id} className="hover:bg-yellow-50/30 dark:hover:bg-yellow-900/10 transition-colors group">
                  <td className="px-6 py-4 font-bold whitespace-nowrap text-slate-800 dark:text-slate-200">
                    {format(parseISO(app.appointment_time), 'MMM dd, h:mm a')}
                  </td>
                  <td className="px-6 py-4">
                     <div className="font-bold text-slate-800 dark:text-slate-100">{app.patient?.name}</div>
                     <div className="text-[10px] text-slate-500 font-medium">{app.patient?.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="font-bold text-slate-800 dark:text-slate-100">{app.doctor?.name}</div>
                     <div className="text-[10px] text-slate-500 font-medium">{app.doctor?.specialization}</div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ${
                       app.status === 'completed' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                       app.status === 'cancelled' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                       'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                     }`}>
                       {app.status}
                     </span>
                  </td>
                </tr>
              ))}
              {enrichedAppointments.length === 0 && (
                <tr>
                   <td colSpan={4} className="text-center py-12 text-slate-400 dark:text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                         <CalendarIcon className="w-8 h-8 mb-3 opacity-20" />
                         <p className="font-medium">No appointments found.</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
