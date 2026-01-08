import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

// Auth
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import ClientList from './pages/Clients/ClientList';
import ClientForm from './pages/Clients/ClientForm';
import StaffList from './pages/Staff/StaffList';
import StaffForm from './pages/Staff/StaffForm';
import StaffPerformance from './pages/Staff/StaffPerformance';
import ProjectList from './pages/Projects/ProjectList';
import ProjectForm from './pages/Projects/ProjectForm';
import ProjectDetail from './pages/Projects/ProjectDetail';
import VehicleList from './pages/Vehicles/VehicleList';
import VehicleForm from './pages/Vehicles/VehicleForm';
import AssetList from './pages/Assets/AssetList';
import AssetForm from './pages/Assets/AssetForm';
import FinanceManagement from './pages/Finance/FinanceManagement';
import Settings from './pages/Settings/Settings';

import { AuthContext } from './context/AuthContext';
import api from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      Loading...
    </Box>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />

          {/* Clients */}
          <Route path="clients" element={<ClientList />} />
          <Route path="clients/new" element={<ClientForm />} />
          <Route path="clients/:id/edit" element={<ClientForm />} />

          {/* Staff */}
          <Route path="staff" element={<StaffList />} />
          <Route path="staff/new" element={<StaffForm />} />
          <Route path="staff/:id/edit" element={<StaffForm />} />
          <Route path="staff/:id/performance" element={<StaffPerformance />} />

          {/* Projects */}
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/new" element={<ProjectForm />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:id/edit" element={<ProjectForm />} />

          {/* Vehicles */}
          <Route path="vehicles" element={<VehicleList />} />
          <Route path="vehicles/new" element={<VehicleForm />} />
          <Route path="vehicles/:id/edit" element={<VehicleForm />} />

          {/* Assets */}
          <Route path="assets" element={<AssetList />} />
          <Route path="assets/new" element={<AssetForm />} />
          <Route path="assets/:id/edit" element={<AssetForm />} />

          {/* Finance */}
          <Route path="finance" element={<FinanceManagement />} />

          {/* Settings */}
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
