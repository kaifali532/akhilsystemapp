import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Plus, FileText, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
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

export default function Patients() {
  const { patients, addPatient } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  
  // New Patient Form
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone?.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPatient({ name, age: parseInt(age), gender, phone, address });
    setOpen(false);
    // Reset
    setName(''); setAge(''); setPhone(''); setAddress('');
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Patient Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">View and manage patient records.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] overflow-hidden rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-black/90 backdrop-blur-xl">
            <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
              <DialogTitle className="text-xl font-bold">Register New Patient</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label className="text-xs uppercase tracking-wider font-bold text-slate-500">Full Name</Label>
                  <Input value={name} onChange={e=>setName(e.target.value)} required className="rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500 h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider font-bold text-slate-500">Age</Label>
                  <Input type="number" value={age} onChange={e=>setAge(e.target.value)} required className="rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500 h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider font-bold text-slate-500">Gender</Label>
                  <select 
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    value={gender} 
                    onChange={e=>setGender(e.target.value)}
                  >
                     <option>Male</option>
                     <option>Female</option>
                     <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-xs uppercase tracking-wider font-bold text-slate-500">Phone</Label>
                  <Input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} required className="rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500 h-10" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-xs uppercase tracking-wider font-bold text-slate-500">Address</Label>
                  <Input value={address} onChange={e=>setAddress(e.target.value)} required className="rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500 h-10" />
                </div>
              </div>
              <DialogFooter className="mt-8">
                <Button type="submit" className="w-full">Save Record</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <motion.div variants={itemVariants} className="glass-card rounded-[1.5rem] card-shadow flex flex-col neon-hover-blue transition-all duration-300 overflow-hidden">
        <div className="p-5 border-b border-white/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/50 dark:bg-[#1C1C1E]/50">
           <h4 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
             <User className="w-5 h-5 text-blue-500" />
             Patient Records
           </h4>
           <div className="relative w-full sm:w-72 group">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
             <Input 
               placeholder="Search by name or phone..." 
               className="pl-9 h-10 bg-white/70 dark:bg-black/50 border-white dark:border-slate-700 rounded-full text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500/50"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr className="border-b border-white/50 dark:border-slate-800/50">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Patient Profile</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600 dark:text-slate-300 divide-y divide-white/20 dark:divide-slate-800/50">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-slate-400 text-xs">#{patient.id.substring(0,8)}</td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                             {patient.name.charAt(0)}
                         </div>
                         <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100">{patient.name}</div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5">{patient.age}y • {patient.gender}</div>
                         </div>
                     </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-500">{patient.phone}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="h-9 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity">
                       <FileText className="w-4 h-4 mr-2" /> View History
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                   <td colSpan={4} className="text-center py-12 text-slate-400 dark:text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                         <User className="w-8 h-8 mb-3 opacity-20" />
                         <p className="font-medium">No patients found matching your search.</p>
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
