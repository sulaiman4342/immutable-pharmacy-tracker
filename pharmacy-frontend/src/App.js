import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import Home from './pages/Home';
import DoctorDashboard from './pages/DoctorDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"           element={<Home />}               />
        <Route path="/doctor"     element={<DoctorDashboard />}    />
        <Route path="/pharmacist" element={<PharmacistDashboard />}/>
        <Route path="/admin"      element={<AdminDashboard />}     />
      </Routes>
    </BrowserRouter>
  );
}