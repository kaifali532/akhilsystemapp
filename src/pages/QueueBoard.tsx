import { useMemo, useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Activity, Clock, BrainCircuit } from 'lucide-react';
import { aiHelper } from '../lib/ai';

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
       // Sort by Priority then Token
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

  // Make an AI Prediction for the longest queue
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-gray-900 text-white p-6 rounded-xl shadow-inner">
         <div>
           <h1 className="text-3xl font-bold tracking-tight">Live Queue Board</h1>
           <p className="text-gray-300 mt-1 flex items-center gap-2">
             <Activity className="w-4 h-4 animate-pulse text-green-400" />
             Real-time status tracking
           </p>
         </div>
         <div className="flex gap-4">
             <button onClick={analyzeQueue} disabled={loadingAi} className="flex flex-col items-center justify-center p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition">
                 <BrainCircuit className="w-6 h-6 mb-1 text-indigo-100" />
                 <span className="text-xs font-semibold">{loadingAi ? 'Analyzing...' : 'AI Analyze'}</span>
             </button>
             <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-800 border border-gray-700">
                 <Clock className="w-6 h-6 mb-1 text-blue-400" />
                 <span className="text-xs font-semibold">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
             </div>
         </div>
      </div>

      {aiPrediction && (
         <div className="bg-white rounded-xl card-shadow border border-slate-100 p-4 ai-glow">
            <div className="flex items-center gap-2 mb-3">
               <div className="w-6 h-6 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-full flex items-center justify-center">
                  <BrainCircuit className="w-3 h-3 text-white" />
               </div>
               <h4 className="font-bold text-sm text-slate-800">AI Insights (Gemini Pro)</h4>
            </div>
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-sm text-blue-800">
               <div dangerouslySetInnerHTML={{__html: aiPrediction}} />
            </div>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {queueByDoctor.map(({doctor, list}: any) => {
           const inProgress = list.find((l:any) => l.status === 'in_progress');
           const nextUp = list.filter((l:any) => l.status === 'waiting');

           return (
              <div key={doctor.id} className="bg-white rounded-xl card-shadow border border-slate-100 flex flex-col overflow-hidden relative">
                {list.find((l:any)=>l.priority==='emergency') && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
                )}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-100 text-blue-600 flex items-center justify-center font-bold">
                       {doctor.name.charAt(4)}
                     </div>
                     <div>
                       <h4 className="font-semibold text-slate-800">{doctor.name}</h4>
                       <p className="text-xs text-slate-500">{doctor.specialization}</p>
                     </div>
                   </div>
                </div>
                
                <div className="flex-1">
                   {/* In Progress */}
                   <div className="p-4 border-b border-slate-50">
                     <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Now Consulting</p>
                     {inProgress ? (
                        <div className="flex items-center justify-between">
                            <div>
                               <div className="text-2xl font-bold text-blue-600 font-mono tracking-tighter">#{inProgress.token_number}</div>
                               <div className="text-sm font-medium text-slate-800 mt-1">{inProgress.patient?.name}</div>
                            </div>
                            <span className="status-chip bg-blue-100 text-blue-700 animate-pulse">In Progress</span>
                        </div>
                     ) : (
                        <div className="text-slate-400 italic py-2 text-sm">Doctor is available</div>
                     )}
                   </div>

                   {/* Next Up */}
                   <div className="p-4">
                     <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Next in Queue ({nextUp.length})</p>
                     <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                        {nextUp.map((q:any) => (
                           <div key={q.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <span className={`font-mono font-bold text-sm ${
                                   q.priority === 'emergency' ? 'text-red-500' : 'text-slate-600'
                                }`}>
                                  #{q.token_number}
                                </span>
                                <div>
                                  <div className="font-medium text-slate-800 text-sm">{q.patient?.name}</div>
                                  <div className="text-[10px] text-slate-400">Wait: ~{q.estimated_wait_time} min</div>
                                </div>
                              </div>
                              {q.priority === 'emergency' ? (
                                <span className="status-chip bg-red-100 text-red-700 animate-pulse">ER</span>
                              ) : (
                                <span className="status-chip bg-yellow-100 text-yellow-700">Waiting</span>
                              )}
                           </div>
                        ))}
                        {nextUp.length === 0 && (
                           <div className="text-center py-4 text-slate-400 text-sm">No waiting patients</div>
                        )}
                     </div>
                   </div>
                </div>
              </div>
           );
        })}
      </div>
    </div>
  );
}
