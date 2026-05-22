import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import AppRoutes from './routes';
import PasswordGate from './components/PasswordGate';

const queryClient = new QueryClient();

function App() {
  return (
    <PasswordGate>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <AppRoutes />
          </Layout>
        </Router>
      </QueryClientProvider>
    </PasswordGate>
  );
}

export default App;