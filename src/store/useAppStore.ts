import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEMO_DATA } from '../lib/demo-data';

interface AppState {
  isDemoMode: boolean;
  user: any | null;
  role: string | null;
  doctors: any[];
  patients: any[];
  appointments: any[];
  queue: any[];
  
  // Actions
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchData: () => Promise<void>;
  subscribeToChanges: () => void;
  
  bookAppointment: (patientId: string, doctorId: string, time: string) => Promise<void>;
  updateQueueStatus: (queueId: string, status: string) => Promise<void>;
  addPatient: (data: any) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isDemoMode: !isSupabaseConfigured,
  user: null,
  role: null,
  doctors: [],
  patients: [],
  appointments: [],
  queue: [],

  subscribeToChanges: () => {
    if (get().isDemoMode) return;
    
    supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue' },
        (payload) => {
          // Whenever queue changes, just re-fetch gracefully
          get().fetchData();
        }
      )
      .subscribe();
  },

  login: async (email: string, password?: string) => {
    if (get().isDemoMode) {
      const user = DEMO_DATA.users.find(u => u.email === email) || DEMO_DATA.users[0];
      set({ user, role: user.role });
      await get().fetchData();
      return;
    }
    
    // Real Supabase login
    const { data, error } = await supabase.auth.signInWithPassword({
       email,
       password: password || 'password123'
    });

    if (error) {
       console.error("Login failed:", error.message);
       alert("Login failed: " + error.message);
       return;
    }

    if (data?.user) {
       // Fetch user role from public.users table
       const { data: userProfile } = await supabase.from('users').select('*').eq('id', data.user.id).single();
       set({ user: data.user, role: userProfile?.role || 'receptionist' });
       await get().fetchData();
    }
  },

  logout: async () => {
    set({ user: null, role: null });
  },

  fetchData: async () => {
    if (get().isDemoMode) {
      const now = new Date();
      // Generate some demo appointments today
      const appointments = Array.from({ length: 30 }).map((_, i) => ({
        id: `a${i}`,
        patient_id: `p${(i % 19) + 1}`,
        doctor_id: `d${(i % 5) + 1}`,
        appointment_time: new Date(now.setHours(9 + Math.floor(i / 5), (i % 5) * 15)).toISOString(),
        status: 'booked'
      }));

      // Generate queue
      const queue = appointments.map((app, i) => ({
        id: `q${i}`,
        appointment_id: app.id,
        doctor_id: app.doctor_id,
        token_number: i + 1,
        priority: Math.random() > 0.8 ? 'emergency' : 'normal',
        status: i === 0 ? 'in_progress' : 'waiting',
        estimated_wait_time: i * 15,
      }));

      set({
        doctors: DEMO_DATA.doctors,
        patients: DEMO_DATA.patients,
        appointments,
        queue,
      });
      return;
    }

    try {
      // Real Supabase Fetching
      const [doctors, patients, appointments, queue] = await Promise.all([
        supabase.from('doctors').select('*'),
        supabase.from('patients').select('*'),
        supabase.from('appointments').select('*'),
        supabase.from('queue').select('*, appointments(*, patients(*))')
      ]);

      set({
        doctors: doctors.data || [],
        patients: patients.data || [],
        appointments: appointments.data || [],
        queue: queue.data || [],
      });
    } catch (error) {
      console.error('Error fetching from Supabase', error);
    }
  },

  bookAppointment: async (patientId, doctorId, time) => {
    if (get().isDemoMode) {
      const newApp = {
        id: Math.random().toString(),
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_time: time,
        status: 'booked'
      };
      
      const newQueue = {
        id: Math.random().toString(),
        appointment_id: newApp.id,
        doctor_id: doctorId,
        token_number: get().queue.length + 1,
        priority: 'normal',
        status: 'waiting',
        estimated_wait_time: 30, // Mock calculation
      };

      set({ 
        appointments: [...get().appointments, newApp],
        queue: [...get().queue, newQueue]
      });
      return;
    }

    // Supabase
    const { data: newApp } = await supabase.from('appointments').insert({
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_time: time
    }).select().single();

    if (newApp) {
      await supabase.from('queue').insert({
        appointment_id: newApp.id,
        doctor_id: doctorId
      });
      await get().fetchData();
    }
  },

  updateQueueStatus: async (queueId, status) => {
    if (get().isDemoMode) {
      set(state => ({
        queue: state.queue.map(q => q.id === queueId ? { ...q, status } : q)
      }));
      return;
    }

    await supabase.from('queue').update({ status }).eq('id', queueId);
    await get().fetchData();
  },

  addPatient: async (data) => {
    if (get().isDemoMode) {
      const newPatient = { id: Math.random().toString(), ...data };
      set(state => ({ patients: [...state.patients, newPatient] }));
      return;
    }

    await supabase.from('patients').insert(data);
    await get().fetchData();
  }
}));
