export const DEMO_DATA = {
  users: [
    { id: 'u1', email: 'admin@akhilsystems.com', role: 'admin', full_name: 'Admin User' },
    { id: 'u2', email: 'reception@akhilsystems.com', role: 'receptionist', full_name: 'Front Desk' },
    { id: 'd1_user', email: 'dr.smith@akhilsystems.com', role: 'doctor', full_name: 'Dr. John Smith' },
  ],
  doctors: [
    { id: 'd1', user_id: 'd1_user', name: 'Dr. John Smith', specialization: 'Cardiology', consultation_time: 15, available_from: '09:00', available_to: '17:00' },
    { id: 'd2', user_id: 'd2_user', name: 'Dr. Sarah Lee', specialization: 'Pediatrics', consultation_time: 20, available_from: '09:00', available_to: '14:00' },
    { id: 'd3', user_id: 'd3_user', name: 'Dr. Amit Patel', specialization: 'Orthopedics', consultation_time: 15, available_from: '10:00', available_to: '18:00' },
    { id: 'd4', user_id: 'd4_user', name: 'Dr. Emily Chen', specialization: 'Dermatology', consultation_time: 10, available_from: '09:00', available_to: '13:00' },
    { id: 'd5', user_id: 'd5_user', name: 'Dr. Michael Brown', specialization: 'General Medicine', consultation_time: 10, available_from: '08:00', available_to: '20:00' },
  ],
  patients: Array.from({ length: 20 }).map((_, i) => ({
    id: `p${i + 1}`,
    name: `Patient ${i + 1}`,
    age: Math.floor(Math.random() * 60) + 10,
    gender: Math.random() > 0.5 ? 'Male' : 'Female',
    phone: `+91 987654321${i % 10}`,
    address: `Street ${i + 1}, City`,
  })),
  appointments: [], // Will be generated dynamically in the store
  queue: [] // Generated dynamically
};
