import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CenterSelection from '../pages/CenterSelection';
import ClientsPage from '../pages/clients/ClientsPage';
import NewClientPage from '../pages/clients/NewClientPage';
import EditClientPage from '../pages/clients/EditClientPage';
import StockPage from '../pages/StockPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CenterSelection />} />
      <Route path="/centers/:centerId/clients" element={<ClientsPage />} />
      <Route path="/centers/:centerId/clients/new" element={<NewClientPage />} />
      <Route path="/centers/:centerId/clients/:id/edit" element={<EditClientPage />} />
      <Route path="/centers/:centerId/stock" element={<StockPage />} />
    </Routes>
  );
};

export default AppRoutes;