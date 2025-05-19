import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CenterSelection from '../pages/CenterSelection';
import ClientsPage from '../pages/clients/ClientsPage';
import NewClientPage from '../pages/clients/NewClientPage';
import EditClientPage from '../pages/clients/EditClientPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CenterSelection />} />
      <Route path="/centers/:centerId/clients" element={<ClientsPage />} />
      <Route path="/centers/:centerId/clients/new" element={<NewClientPage />} />
      <Route path="/centers/:centerId/clients/:id/edit" element={<EditClientPage />} />
    </Routes>
  );
};

export default AppRoutes;