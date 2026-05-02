import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { useAppStore } from './store/useAppStore';

// Mock Import Pages (We will create them next)
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import QueueBoard from './pages/QueueBoard';
import DoctorPanel from './pages/DoctorPanel';
import Login from './pages/Login';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, role } = useAppStore();
  
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const { user, fetchData, subscribeToChanges } = useAppStore();

  useEffect(() => {
    if (user) {
      fetchData();
      subscribeToChanges();
      
      // Auto-refresh interval (mocking realtime if in purely demo mode)
      const interval = setInterval(() => {
          fetchData();
      }, 30000); // 30s
      return () => clearInterval(interval);
    }
  }, [user, fetchData, subscribeToChanges]);

  return (
    <AppLayout>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin / Receptionist Routes */}
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
             <Dashboard />
          </ProtectedRoute>
        } />
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
