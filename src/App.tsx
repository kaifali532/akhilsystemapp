import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { useAppStore } from './store/useAppStore';
import { supabase } from './lib/supabase';

import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import QueueBoard from './pages/QueueBoard';
import DoctorPanel from './pages/DoctorPanel';
import Login from './pages/Login';
import Landing from './pages/Landing';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, role } = useAppStore();
  
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // If not allowed, redirect to a sensible default or just home
    if (role === 'doctor') return <Navigate to="/doctor" replace />;
    if (role === 'receptionist' || role === 'admin') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const { user, role, fetchData, restoreSession, isDemoMode } = useAppStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (user) {
      fetchData();
      
      let channel: ReturnType<typeof supabase.channel> | null = null;
      
      if (!isDemoMode) {
        channel = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'queue' },
            (payload) => {
              fetchData().catch(e => console.error("Error fetching data on realtime event", e));
            }
          )
          .subscribe((status) => {
             if (status === 'SUBSCRIBED') {
               console.log('Successfully subscribed to realtime changes');
             }
          });
      }
      
      const interval = setInterval(() => {
          fetchData().catch(e => console.error("Error polling data", e));
      }, 30000); // 30s
      
      return () => {
        clearInterval(interval);
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, [user, fetchData, isDemoMode]);

  return (
    <AppLayout>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Landing Page for guests, otherwise redirect to appropriate dashboard */}
        <Route path="/" element={
          !user ? <Landing /> : (
            role === 'doctor' ? <Navigate to="/doctor" replace /> :
            <Navigate to="/dashboard" replace />
          )
        } />

        {/* Dashboards */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
             <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Admin / Receptionist Routes */}
        <Route path="/patients" element={
          <ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor']}>
             <Patients />
          </ProtectedRoute>
        } />
        <Route path="/appointments" element={
          <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
             <Appointments />
          </ProtectedRoute>
        } />
        
        {/* Universal */}
        <Route path="/queue" element={
          <ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor']}>
             <QueueBoard />
          </ProtectedRoute>
        } />
        
        {/* Doctor Context */}
        <Route path="/doctor" element={
          <ProtectedRoute allowedRoles={['doctor', 'admin']}>
             <DoctorPanel />
          </ProtectedRoute>
        } />
        
      </Routes>
    </AppLayout>
  );
}
