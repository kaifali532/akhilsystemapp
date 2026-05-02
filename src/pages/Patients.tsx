import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Plus, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Patient Management</h1>
          <p className="text-slate-500 text-sm mt-1">View and manage patient records.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Patient</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Full Name</Label>
                  <Input value={name} onChange={e=>setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input type="number" value={age} onChange={e=>setAge(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={gender} 
                    onChange={e=>setGender(e.target.value)}
                  >
                     <option>Male</option>
                     <option>Female</option>
                     <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Phone Number</Label>
                  <Input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} required />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Address</Label>
                  <Input value={address} onChange={e=>setAddress(e.target.value)} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">Save Record</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl card-shadow border border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
           <h4 className="font-semibold text-slate-800">All Patients</h4>
           <div className="relative w-64">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
             <Input 
               placeholder="Search name or phone..." 
               className="pl-9 h-9 bg-slate-50 border-slate-200 text-sm focus-visible:ring-blue-500"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
        <div className="overflow-hidden flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Age/Gender</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600 divide-y divide-slate-50">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-3 font-mono font-bold text-slate-500 text-xs">#{patient.id.substring(0,6)}</td>
                  <td className="px-6 py-3 font-medium text-slate-800">{patient.name}</td>
                  <td className="px-6 py-3">{patient.age} <span className="text-[10px] opacity-60 ml-1">({patient.gender.charAt(0)})</span></td>
                  <td className="px-6 py-3 text-slate-500">{patient.phone}</td>
                  <td className="px-6 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                       <FileText className="w-4 h-4 mr-2" /> History
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                   <td colSpan={5} className="text-center py-8 text-slate-400">
                      No patients found matching your search.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
