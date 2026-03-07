import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ScoutingForm from '../pages/ScoutingForm';
import Dashboard from '../pages/Dashboard';
import TeamDetails from '../pages/TeamDetails';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="scout" element={<ScoutingForm />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="team/:teamNumber" element={<TeamDetails />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 
