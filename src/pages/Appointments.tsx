import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { format, parseISO } from 'date-fns';
import { Plus } from 'lucide-react';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Appointments</h1>
          <p className="text-gray-500">Manage hospital bookings and schedule.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Patient</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Search patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(p => (
                       <SelectItem key={p.id} value={p.id}>{p.name} ({p.phone})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Doctor</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose doctor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(d => (
                       <SelectItem key={d.id} value={d.id}>{d.name} - {d.specialization}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <input type="date" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors" required value={date} onChange={e=>setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <input type="time" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors" required value={time} onChange={e=>setTime(e.target.value)} />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full mt-4">Confirm Booking</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl card-shadow border border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
           <h4 className="font-semibold text-slate-800">All Appointments</h4>
        </div>
        <div className="overflow-hidden flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Doctor</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600 divide-y divide-slate-50">
              {enrichedAppointments.map((app) => (
                <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-3 font-medium whitespace-nowrap text-slate-800 text-sm">
                    {format(parseISO(app.appointment_time), 'MMM dd, h:mm a')}
                  </td>
                  <td className="px-6 py-3">
                     <div className="font-medium">{app.patient?.name}</div>
                     <div className="text-[10px] text-slate-400">{app.patient?.phone}</div>
                  </td>
                  <td className="px-6 py-3">
                     <div className="font-medium">{app.doctor?.name}</div>
                     <div className="text-[10px] text-slate-400">{app.doctor?.specialization}</div>
                  </td>
                  <td className="px-6 py-3">
                     <span className={`status-chip ${
                       app.status === 'completed' ? 'bg-green-100 text-green-700' :
                       app.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                       'bg-blue-100 text-blue-700'
                     }`}>
                       {app.status}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
