import React, { useState, useEffect } from 'react';
import { getFullClientData } from '../../services/database';
import type { FullClientData } from '../../types/client';
import MesojetCorpsForm from './treatments/MesojetCorpsForm';

interface MesojetCorpsTabProps {
  clientId: string;
  centerId: string;
}

const MesojetCorpsTab: React.FC<MesojetCorpsTabProps> = ({ clientId, centerId }) => {
  const [clientData, setClientData] = useState<FullClientData | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getFullClientData(clientId, centerId);
        setClientData(data);
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId, centerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-brand-blue hover:text-brand-pink transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return <MesojetCorpsForm initialData={clientData} />;
};

export default MesojetCorpsTab;
