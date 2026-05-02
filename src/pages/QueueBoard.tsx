import { useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Activity, Clock, BrainCircuit } from 'lucide-react';
import { aiHelper } from '../lib/ai';
import { motion, AnimatePresence } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function QueueBoard() {
  const { queue, patients, doctors, appointments, isDemoMode } = useAppStore();
  const [aiPrediction, setAiPrediction] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const enrichedQueue = useMemo(() => {
    return queue.map(q => {
      const appointment = appointments.find(a => a.id === q.appointment_id);
      const patient = patients.find(p => p.id === appointment?.patient_id);
      const doctor = doctors.find(d => d.id === q.doctor_id);
      return { ...q, patient, doctor, appointment_time: appointment?.appointment_time };
    }).sort((a,b) => {
       const pA = a.priority === 'emergency' ? 0 : a.priority === 'vip' ? 1 : 2;
       const pB = b.priority === 'emergency' ? 0 : b.priority === 'vip' ? 1 : 2;
       if(pA !== pB) return pA - pB;
       return a.token_number - b.token_number;
    });
  }, [queue, patients, doctors, appointments]);

  const queueByDoctor = useMemo(() => {
    const grouped = {} as any;
    enrichedQueue.forEach(q => {
        if(q.status === 'done') return;
        if(!grouped[q.doctor_id]) grouped[q.doctor_id] = { doctor: q.doctor, list: [] };
        grouped[q.doctor_id].list.push(q);
    });
    return Object.values(grouped);
  }, [enrichedQueue]);

  const analyzeQueue = async () => {
     if(!isDemoMode && !import.meta.env.VITE_GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
        setAiPrediction("Please set GEMINI_API_KEY to use AI Optimization.");
        return;
     }

     setLoadingAi(true);
     const busiest = queueByDoctor.sort((a:any,b:any) => b.list.length - a.list.length)[0];
     if(busiest) {
        const docSpeed = busiest.doctor.consultation_time;
        const qSummary = busiest.list.map((q:any) => ({ token: q.token_number, priority: q.priority }));
        const prediction = await aiHelper.predictWaitTime(qSummary, docSpeed);
        setAiPrediction(prediction);
     }
     setLoadingAi(false);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center glass-card border-none bg-black/90 dark:bg-black p-6 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.1)] text-white relative overflow-hidden">
         <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-blue-500/20 blur-[100px] pointer-events-none" />
         <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
               <h1 className="text-3xl font-bold tracking-tight">Live Queue Board</h1>
               <p className="text-blue-200 mt-1 flex items-center gap-2 text-sm font-medium">
                 <Activity className="w-4 h-4 text-green-400" />
                 Real-time status tracking
               </p>
             </div>
             <div className="flex gap-4">
                 <button onClick={analyzeQueue} disabled={loadingAi} className="flex flex-col items-center justify-center p-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all hover:scale-105 active:scale-95 group">
                     <BrainCircuit className="w-6 h-6 mb-1 text-indigo-300 group-hover:text-indigo-200 transition-colors" />
                     <span className="text-xs font-bold tracking-wider uppercase text-indigo-100">{loadingAi ? 'Analyzing...' : 'AI Analyze'}</span>
                 </button>
                 <div className="flex flex-col items-center justify-center p-3 px-6 rounded-2xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-md text-slate-300">
                     <Clock className="w-6 h-6 mb-1 text-slate-400" />
                     <span className="text-xs font-bold tracking-wider uppercase">
                       {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </span>
                 </div>
             </div>
         </div>
      </div>

      <AnimatePresence>
          {aiPrediction && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card rounded-[1.5rem] card-shadow p-6 neon-hover-blue overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                      <BrainCircuit className="w-4 h-4" />
                   </div>
                   <h4 className="font-bold text-slate-800 dark:text-white">AI Queue Optimization</h4>
                </div>
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                   <div dangerouslySetInnerHTML={{__html: aiPrediction}} />
                </div>
             </motion.div>
          )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {queueByDoctor.map(({doctor, list}: any) => {
           const inProgress = list.find((l:any) => l.status === 'in_progress');
           const nextUp = list.filter((l:any) => l.status === 'waiting');
           const hasEmergency = list.some((l:any) => l.priority === 'emergency');

           return (
              <motion.div variants={itemVariants} key={doctor.id} className={`glass-card rounded-[1.5rem] card-shadow flex flex-col overflow-hidden relative transition-all duration-300 ${hasEmergency ? 'neon-hover-red border-red-500/30' : 'neon-hover-blue'}`}>
                {hasEmergency && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0" />
                )}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-white/50 dark:bg-[#1C1C1E]/50">
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl shadow-inner">
                       {doctor.name.replace('Dr. ', '').charAt(0)}
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-800 dark:text-white text-lg">{doctor.name}</h4>
                       <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{doctor.specialization}</p>
                     </div>
                   </div>
                </div>
                
                <div className="flex-1 flex flex-col bg-white/30 dark:bg-black/20">
                   {/* In Progress */}
                   <div className="p-5 border-b border-slate-100/50 dark:border-slate-800/50">
                     <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wider">Now Consulting</p>
                     <AnimatePresence mode="popLayout">
                         {inProgress ? (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center justify-between">
                                <div>
                                   <div className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 font-mono tracking-tighter shadow-sm drop-shadow-md">
                                     #{inProgress.token_number}
                                   </div>
                                   <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{inProgress.patient?.name}</div>
                                </div>
                                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_0_10px_rgba(52,168,83,0.3)]">
                                  In Progress
                                </span>
                            </motion.div>
                         ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 dark:text-slate-500 italic py-4 text-sm font-medium">Doctor is available</motion.div>
                         )}
                     </AnimatePresence>
                   </div>

                   {/* Next Up */}
                   <div className="p-5 flex-1">
                     <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-wider">Next in Queue ({nextUp.length})</p>
                     <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence>
                            {nextUp.map((q:any) => (
                               <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={q.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/60 dark:bg-[#1C1C1E]/60 border border-white/50 dark:border-slate-700/30 shadow-sm hover:scale-[1.02] transition-transform">
                                  <div className="flex items-center gap-4">
                                    <span className={`text-xl font-mono font-black ${
                                       q.priority === 'emergency' ? 'text-red-500 drop-shadow-[0_0_8px_rgba(234,67,53,0.5)]' : 'text-slate-600 dark:text-slate-400'
                                    }`}>
                                      #{q.token_number}
                                    </span>
                                    <div>
                                      <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{q.patient?.name}</div>
                                      <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Wait: ~{q.estimated_wait_time} min</div>
                                    </div>
                                  </div>
                                  {q.priority === 'emergency' ? (
                                    <span className="px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-[0_0_10px_rgba(234,67,53,0.3)]">ER</span>
                                  ) : (
                                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-[0_0_10px_rgba(251,188,5,0.2)]">Waiting</span>
                                  )}
                               </motion.div>
                            ))}
                        </AnimatePresence>
                        {nextUp.length === 0 && (
                           <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm font-medium">No waiting patients</div>
                        )}
                     </div>
                   </div>
                </div>
              </motion.div>
           );
        })}
      </div>
    </motion.div>
  );
}
