import { useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Play, Check, FileText, BrainCircuit, Activity, Stethoscope } from 'lucide-react';
import { aiHelper } from '../lib/ai';
import { motion, AnimatePresence } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

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

  if(!docProfile) return <div className="p-8 text-center glass-card rounded-2xl mx-auto mt-20 max-w-sm">No doctor profile associated.</div>;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
       <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass-card p-5 rounded-[1.5rem] card-shadow shrink-0 gap-4">
         <div className="flex items-center gap-4">
             <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-4 rounded-[1rem] text-white shadow-[0_4px_15px_rgba(66,133,244,0.4)]">
               <Stethoscope className="w-8 h-8" />
             </div>
             <div>
               <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Welcome, {docProfile.name}</h1>
               <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Have a great shift today.</p>
             </div>
         </div>
         <div className="flex gap-6 h-full items-center">
             <div className="text-center px-4 border-r border-slate-200 dark:border-slate-800">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Wait</span>
                <span className="block text-2xl font-black text-slate-800 dark:text-slate-100">{docQueue.length}</span>
             </div>
             <div className="text-center px-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emergency</span>
                <span className="block text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500">
                   {docQueue.filter(q => q.priority === 'emergency').length}
                </span>
             </div>
         </div>
       </motion.div>

       <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 overflow-hidden">
          
          {/* Active Consultation Sidebar */}
          <motion.div variants={itemVariants} className="xl:col-span-1 glass-card rounded-[1.5rem] flex flex-col h-full overflow-hidden border border-white/50 dark:border-slate-800/50 card-shadow neon-hover-blue transition-all duration-300">
             <div className="bg-white/50 dark:bg-slate-900/50 p-5 border-b border-white/50 dark:border-slate-800/50 font-bold text-slate-500 uppercase tracking-widest text-xs flex justify-between items-center shrink-0">
                <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> Queue Manager</span>
                <span className="px-2 py-1 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-full text-[10px]">
                   {docQueue.length} Pending
                </span>
             </div>
             
             <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-transparent custom-scrollbar">
               <AnimatePresence mode="popLayout">
                 {/* Current */}
                 {currentPatient && (
                   <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 relative overflow-hidden backdrop-blur-sm shadow-[0_0_15px_rgba(66,133,244,0.1)]">
                     <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-400 to-indigo-500 shadow-[0_0_10px_rgba(66,133,244,0.5)]"></div>
                     <p className="text-[10px] font-bold text-blue-500 mb-1.5 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <span className="relative flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                       </span>
                       IN PROGRESS - TKN {currentPatient.token_number}
                     </p>
                     <p className="font-bold text-lg text-slate-800 dark:text-slate-100 ml-1">{currentPatient.patient?.name}</p>
                     <p className="text-xs text-slate-500 font-medium ml-1 flex items-center gap-2 mt-1">
                        {currentPatient.patient?.age} yrs • {currentPatient.patient?.gender}
                     </p>
                   </motion.div>
                 )}

                 {/* Next */}
                 {nextPatient && !currentPatient && (
                   <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 relative overflow-hidden backdrop-blur-sm">
                     <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
                     <p className="text-[10px] font-bold text-amber-500 mb-1.5 uppercase tracking-widest ml-1">UP NEXT - TKN {nextPatient.token_number}</p>
                     <p className="font-bold text-lg text-slate-800 dark:text-slate-100 ml-1">{nextPatient.patient?.name}</p>
                     <p className="text-xs text-slate-500 font-medium ml-1 mt-1">Ready for consultation</p>
                   </motion.div>
                 )}
               </AnimatePresence>

               <div className="space-y-2 mt-4">
                 {docQueue.slice(currentPatient ? 1 : (nextPatient ? 1 : 0), 6).map((q:any) => (
                    <motion.div layout key={q.id} className="bg-white/40 dark:bg-black/20 border border-white/50 dark:border-slate-800/50 rounded-xl p-3 flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity backdrop-blur-sm">
                       <div className="flex gap-3 items-center">
                          <span className="font-mono font-black text-slate-300 dark:text-slate-600 text-sm">#{q.token_number}</span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{q.patient?.name}</span>
                       </div>
                       {q.priority === 'emergency' && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-red-500/10 text-red-600 border border-red-500/20">ER</span>}
                    </motion.div>
                 ))}
                 {docQueue.length > 5 && <p className="text-center text-[10px] text-slate-400 p-2 font-bold uppercase tracking-wider">+{docQueue.length - 5} more patients</p>}
               </div>
             </div>
             
             {/* Action Button */}
             <div className="p-5 bg-white/50 dark:bg-slate-900/50 border-t border-white/50 dark:border-slate-800/50 shrink-0">
                {!currentPatient && nextPatient ? (
                   <Button onClick={startNext} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white rounded-full h-12 shadow-[0_4px_15px_rgba(66,133,244,0.4)] hover:shadow-[0_6px_25px_rgba(66,133,244,0.6)] font-bold tracking-wider transition-all">
                     <Play className="w-4 h-4 mr-2 fill-current" /> CALL NEXT (TKN {nextPatient.token_number})
                   </Button>
                ) : currentPatient ? (
                   <Button onClick={completeCurrent} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-full h-12 shadow-[0_4px_15px_rgba(52,168,83,0.4)] hover:shadow-[0_6px_25px_rgba(52,168,83,0.6)] font-bold tracking-wider transition-all">
                     <Check className="w-4 h-4 mr-2" /> COMPLETE CONSULT
                   </Button>
                ) : (
                   <Button variant="outline" disabled className="w-full rounded-full h-12 font-bold tracking-wider bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400">QUEUE IS EMPTY</Button>
                )}
             </div>
          </motion.div>

          {/* Consultation Workspace */}
          <motion.div variants={itemVariants} className="xl:col-span-2 glass-card rounded-[1.5rem] flex flex-col h-full overflow-hidden border border-white/50 dark:border-slate-800/50 card-shadow">
             <AnimatePresence mode="wait">
               {currentPatient ? (
                  <motion.div key="active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col h-full">
                  <div className="p-6 border-b border-white/50 dark:border-slate-800/50 shrink-0 flex justify-between items-start bg-white/50 dark:bg-[#1C1C1E]/50">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">{currentPatient.patient?.name}</h2>
                      <div className="flex gap-4 items-center">
                         <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500">DoB: {new Date().getFullYear() - (currentPatient.patient?.age || 0)}</span>
                         <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500">Contact: {currentPatient.patient?.phone}</span>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-2xl font-bold font-mono shadow-sm">TKN #{currentPatient.token_number}</span>
                  </div>
                  
                  <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar bg-transparent">
                     <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white/40 dark:bg-black/20 p-2 pl-4 rounded-full border border-white/50 dark:border-slate-800/50 backdrop-blur-sm">
                           <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-500" /> Clinical Notes
                           </Label>
                           <Button variant="ghost" size="sm" onClick={generateSummary} disabled={generating || !notes} className="h-9 rounded-full text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 px-4 font-bold">
                              <BrainCircuit className={`w-4 h-4 mr-2 ${generating ? 'animate-pulse' : ''}`} /> {generating ? 'Analyzing...' : 'AI Summary'}
                           </Button>
                        </div>
                        <textarea 
                          className="w-full min-h-[220px] p-5 text-sm rounded-[1.5rem] bg-white/70 dark:bg-black/50 border-white dark:border-slate-800 shadow-inner resize-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none backdrop-blur-sm placeholder:text-slate-400"
                          placeholder="Enter chief complaints, history, and examination findings..."
                          value={notes}
                          onChange={(e)=>setNotes(e.target.value)}
                        ></textarea>
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white/40 dark:bg-black/20 p-2 pl-4 rounded-full border border-white/50 dark:border-slate-800/50 backdrop-blur-sm">
                           <Label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              Rx Prescription & Advice
                           </Label>
                        </div>
                        <textarea 
                          className="w-full min-h-[160px] p-5 text-sm rounded-[1.5rem] bg-slate-50/70 dark:bg-[#1A1A1C]/70 border-white dark:border-slate-800 shadow-inner resize-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none font-mono placeholder:text-slate-400 backdrop-blur-sm"
                          placeholder="1. Tab Paracetamol 500mg SOS&#10;2. Drink plenty of warm fluids"
                          value={prescription}
                          onChange={(e)=>setPrescription(e.target.value)}
                        ></textarea>
                     </div>
                  </div>
                  </motion.div>
               ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-transparent">
                     <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-full flex items-center justify-center mb-8 shadow-inner border border-white/50 dark:border-slate-700/50 relative">
                        <div className="absolute inset-0 bg-blue-500/5 rounded-full animate-pulse blur-xl"></div>
                        <Stethoscope className="w-12 h-12 text-slate-300 dark:text-slate-600 relative z-10" />
                     </div>
                     <h3 className="text-2xl font-black text-slate-400 dark:text-slate-500 mb-3 tracking-tight">No Active Consultation</h3>
                     <p className="text-slate-400 font-medium max-w-sm text-sm">Please call the next patient from the queue to start their consultation session.</p>
                  </motion.div>
               )}
             </AnimatePresence>
          </motion.div>
       </div>
    </motion.div>
  );
}
