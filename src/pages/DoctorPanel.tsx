import { useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Play, Check, FileText, BrainCircuit, Activity } from 'lucide-react';
import { aiHelper } from '../lib/ai';

export default function DoctorPanel() {
  const { user, doctors, queue, patients, updateQueueStatus, isDemoMode } = useAppStore();
  
  // Find current doctor mapping
  const docProfile = useMemo(() => {
     if(isDemoMode && user) {
        return doctors.find(d => d.user_id === user.id) || doctors[0]; // fallback for demo
     }
     return doctors.find(d => d.user_id === user?.id);
  }, [user, doctors, isDemoMode]);

  const docQueue = useMemo(() => {
     if(!docProfile) return [];
     return queue
        .filter(q => q.doctor_id === docProfile.id && q.status !== 'done')
        .map(q => {
           const patient = patients.find(p => p.id === q.patients?.id /* if real supabase */ || p.id === useAppStore.getState().appointments.find(a=>a.id===q.appointment_id)?.patient_id);
           return { ...q, patient };
        })
        .sort((a,b) => {
           const pA = a.priority === 'emergency' ? 0 : 1;
           const pB = b.priority === 'emergency' ? 0 : 1;
           return (pA - pB) || (a.token_number - b.token_number);
        });
  }, [queue, docProfile, patients]);

  const currentPatient = docQueue.find(q => q.status === 'in_progress');
  const nextPatient = docQueue.find(q => q.status === 'waiting');

  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [generating, setGenerating] = useState(false);

  const startNext = async () => {
     if(nextPatient) {
        await updateQueueStatus(nextPatient.id, 'in_progress');
     }
  };

  const completeCurrent = async () => {
     if(currentPatient) {
        await updateQueueStatus(currentPatient.id, 'done');
        setNotes('');
        setPrescription('');
     }
  };

  const generateSummary = async () => {
    if(!notes) return;
    setGenerating(true);
    const summary = await aiHelper.summarizePatientHistory([notes]);
    setNotes(notes + '\n\n--- AI SUMMARY ---\n' + summary);
    setGenerating(false);
  };

  if(!docProfile) return <div className="p-8 text-center bg-white rounded-lg shadow">No doctor profile associated.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
       <div className="flex justify-between items-center bg-white p-4 rounded-xl card-shadow border border-slate-100 shrink-0">
         <div className="flex items-center gap-4">
             <div className="bg-blue-50 p-3 rounded-full text-blue-600 border border-blue-100">
               <Activity className="w-6 h-6" />
             </div>
             <div>
               <h1 className="text-xl font-bold tracking-tight text-slate-800">Welcome, {docProfile.name}</h1>
               <p className="text-sm text-slate-500 mt-1">Have a great shift today.</p>
             </div>
         </div>
         <div className="flex gap-4">
             <div className="text-center px-4 border-r border-slate-200">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Total Wait</span>
                <span className="block text-xl font-bold text-slate-800">{docQueue.length}</span>
             </div>
             <div className="text-center px-4">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency</span>
                <span className="block text-xl font-bold text-red-600">
                   {docQueue.filter(q => q.priority === 'emergency').length}
                </span>
             </div>
         </div>
       </div>

       <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          
          {/* Active Consultation Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-xl card-shadow border border-slate-100 flex flex-col h-full overflow-hidden">
             <div className="bg-slate-50 p-4 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-widest text-[10px] flex justify-between items-center shrink-0">
                Queue Management
                <span className="status-chip bg-slate-200 text-slate-600">{docQueue.length} Pending</span>
             </div>
             
             <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-white">
               {/* Current */}
               {currentPatient && (
                 <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                   <p className="text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-wider">IN PROGRESS - TKN {currentPatient.token_number}</p>
                   <p className="font-semibold text-slate-800">{currentPatient.patient?.name}</p>
                   <p className="text-[10px] text-slate-500">{currentPatient.patient?.age} yrs • {currentPatient.patient?.gender}</p>
                 </div>
               )}

               {/* Next */}
               {nextPatient && !currentPatient && (
                 <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-4 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                   <p className="text-[10px] font-bold text-amber-600 mb-1 uppercase tracking-wider">UP NEXT - TKN {nextPatient.token_number}</p>
                   <p className="font-semibold text-slate-800">{nextPatient.patient?.name}</p>
                 </div>
               )}

               {docQueue.slice(currentPatient ? 1 : (nextPatient ? 1 : 0), 6).map((q:any) => (
                  <div key={q.id} className="bg-white border border-slate-100 rounded-lg p-3 flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity">
                     <div className="flex gap-3">
                        <span className="font-mono font-bold text-slate-400 w-6">#{q.token_number}</span>
                        <span className="text-sm font-medium text-slate-700">{q.patient?.name}</span>
                     </div>
                     {q.priority === 'emergency' && <span className="status-chip bg-red-100 text-red-700">ER</span>}
                  </div>
               ))}
               {docQueue.length > 5 && <p className="text-center text-[10px] text-slate-400 p-2 font-bold uppercase tracking-wider">+{docQueue.length - 5} more patients</p>}
             </div>
             
             {/* Action Button */}
             <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
                {!currentPatient && nextPatient ? (
                   <Button onClick={startNext} className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-xs font-bold uppercase tracking-wider shadow-sm">
                     <Play className="w-4 h-4 mr-2" /> CALL NEXT (TKN {nextPatient.token_number})
                   </Button>
                ) : currentPatient ? (
                   <Button onClick={completeCurrent} className="w-full bg-green-600 hover:bg-green-700 h-10 text-xs font-bold uppercase tracking-wider shadow-sm">
                     <Check className="w-4 h-4 mr-2" /> Complete Consult
                   </Button>
                ) : (
                   <Button variant="outline" disabled className="w-full h-10 text-xs uppercase tracking-wider border-slate-200">Queue is Empty</Button>
                )}
             </div>
          </div>

          {/* Consultation Workspace */}
          <div className="lg:col-span-2 bg-white rounded-xl card-shadow border border-slate-100 flex flex-col h-full overflow-hidden">
             {currentPatient ? (
                <>
                <div className="p-6 border-b border-slate-100 shrink-0 flex justify-between items-start bg-slate-50/50">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">{currentPatient.patient?.name}</h2>
                    <p className="text-slate-500 text-sm">DoB: {new Date().getFullYear() - (currentPatient.patient?.age || 0)} • Contact: {currentPatient.patient?.phone}</p>
                  </div>
                  <span className="status-chip bg-blue-100 text-blue-700">Token #{currentPatient.token_number}</span>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                   <div className="space-y-3">
                      <div className="flex justify-between items-center">
                         <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                            <FileText className="w-4 h-4 mr-2" /> Clinical Notes
                         </Label>
                         <Button variant="ghost" size="sm" onClick={generateSummary} disabled={generating || !notes} className="h-8 text-blue-600 hover:bg-blue-50">
                            <BrainCircuit className="w-4 h-4 mr-2" /> {generating ? 'Analyzing...' : 'AI Summary'}
                         </Button>
                      </div>
                      <textarea 
                        className="w-full min-h-[200px] p-4 text-sm rounded-lg border-slate-200 shadow-sm resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all border outline-none bg-white"
                        placeholder="Enter chief complaints, history, and examination findings..."
                        value={notes}
                        onChange={(e)=>setNotes(e.target.value)}
                      ></textarea>
                   </div>

                   <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                         Rx Prescription & Advice
                      </Label>
                      <textarea 
                        className="w-full min-h-[150px] p-4 text-sm rounded-lg border-slate-200 shadow-sm resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all border outline-none font-mono bg-slate-50"
                        placeholder="1. Tab Paracetamol 500mg SOS&#10;2. Drink plenty of warm fluids"
                        value={prescription}
                        onChange={(e)=>setPrescription(e.target.value)}
                      ></textarea>
                   </div>
                </div>
                </>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                   <div className="w-24 h-24 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center mb-6">
                      <Activity className="w-10 h-10 text-slate-300" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-500 mb-2">No Active Consultation</h3>
                   <p className="text-slate-400 max-w-sm text-sm">Please call the next patient from the queue to start their consultation session.</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
