import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Scale, Ruler, FileDown, Activity, 
  Sparkles, Zap, Heart, Coffee, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ClientForm from '../../components/clients/ClientForm';
import SessionsTab from '../../components/clients/SessionsTab';
import MensurationsTab from '../../components/clients/MensurationsTab';
import IShapeTab from '../../components/clients/IShapeTab';
import AdipologyTab from '../../components/clients/AdipologyTab';
import MenopauseTab from '../../components/clients/MenopauseTab';
import CavitalyseTab from '../../components/clients/CavitalyseTab';
import AdvanceLiftTab from '../../components/clients/AdvanceLiftTab';
import PressodynamieTab from '../../components/clients/PressodynamieTab';
import RelaxationTab from '../../components/clients/RelaxationTab';
import MesojetTab from '../../components/clients/MesojetTab';
import { getFullClientData, getMeasurements, getSessions, updateClient } from '../../services/database';
import { generateClientPDF } from '../../utils/pdfGenerator';
import type { FullClientData } from '../../types/client';
import type { Measurement } from '../../types/measurements';
import type { Session } from '../../types/session';

const menuCategories = [
  {
    name: 'Général',
    tabs: [
      { id: 'info', name: 'Informations', icon: User }
    ]
  },
  {
    name: 'Luxothérapie',
    tabs: [
      { id: 'sessions', name: 'Suivi des séances', icon: Scale },
      { id: 'mensurations', name: 'Mensurations', icon: Ruler },
      { id: 'relaxation', name: 'Relaxation', icon: Coffee },
      { id: 'menopause', name: 'Ménopause', icon: Activity }
    ]
  },
  {
    name: 'Soins Minceur',
    tabs: [
      { id: 'cavitalyse', name: 'Cavita-Lyse', icon: Sparkles },
      { id: 'adipology', name: 'Adipologie', icon: Activity },
      { id: 'ishape', name: 'I-Shape', icon: Activity },
      { id: 'pressodynamie', name: 'Pressodynamie', icon: Zap }
    ]
  },
  {
    name: 'Anti-âge',
    tabs: [
      { id: 'advanceLift', name: 'Advance Lift', icon: Heart },
      { id: 'mesojet', name: 'Mésojet', icon: Sparkles }
    ]
  }
];

const EditClientPage = () => {
  const { id, centerId } = useParams();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('info');
  const [clientData, setClientData] = useState<FullClientData | undefined>();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const fetchData = async () => {
    if (!id || !centerId) return;

    try {
      setLoading(true);
      setError(null);

      const client = await getFullClientData(id, centerId);
      setClientData(client);

      const [measurementsData, sessionsData] = await Promise.all([
        getMeasurements(id, centerId),
        getSessions(id, centerId, client.client.treatment)
      ]);

      setMeasurements(measurementsData);
      setSessions(sessionsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, centerId]);

  const handleSubmit = async (formData: FormData) => {
    if (!id || !centerId) return;

    try {
      await updateClient(id, formData, centerId);
      await fetchData();
      toast.success('Client mis à jour avec succès');
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Une erreur est survenue lors de la mise à jour du client');
    }
  };

  const handleDownloadPDF = async () => {
    if (!clientData || !measurements || !sessions) return;

    try {
      setGeneratingPDF(true);
      await generateClientPDF(clientData, measurements, sessions);
      toast.success('PDF généré avec succès');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

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

  if (!clientData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client non trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-blue">
          {clientData.client.firstName} {clientData.client.lastName}
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/centers/${centerId}/clients`)}
            className="flex items-center rounded-full px-6 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200 bg-gray-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={generatingPDF}
            className={`
              flex items-center rounded-full px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200
              ${generatingPDF 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-brand-blue hover:shadow-md'
              }
            `}
          >
            <FileDown className="h-4 w-4 mr-2" />
            {generatingPDF ? 'Génération...' : 'Télécharger PDF'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px" aria-label="Tabs">
          <div className="space-y-6">
            {menuCategories.map((category) => (
              <div key={category.name} className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500">{category.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {category.tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setCurrentTab(tab.id)}
                        className={`
                          group inline-flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
                          ${currentTab === tab.id
                            ? 'bg-brand-blue text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <Icon className={`
                          ${currentTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}
                          -ml-0.5 mr-2 h-5 w-5
                        `} />
                        {tab.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Content */}
      <div>
        {currentTab === 'info' && (
          <ClientForm onSubmit={handleSubmit} initialData={clientData} />
        )}
        {currentTab === 'sessions' && (
          <SessionsTab clientId={id!} centerId={centerId!} />
        )}
        {currentTab === 'mensurations' && (
          <MensurationsTab clientId={id!} centerId={centerId!} />
        )}
        {currentTab === 'ishape' && (
          <IShapeTab clientId={id!} centerId={centerId!} />
        )}
        {currentTab === 'adipology' && (
          <AdipologyTab clientId={id!} centerId={centerId!} />
        )}
        {currentTab === 'menopause' && (
          <MenopauseTab clientId={id!} centerId={centerId!} />
        )}
        {currentTab === 'cavitalyse' && (
          <CavitalyseTab clientId={id!} centerId={centerId!} />
        )}
        {currentTab === 'advanceLift' && (
          <AdvanceLiftTab clientId={id!} centerId={centerId!} />
        )}
        {currentTab === 'pressodynamie' && (
          <PressodynamieTab clientId={id!} centerId={centerId!} />
        )}
        {currentTab === 'relaxation' && (
          <RelaxationTab clientId={id!} centerId={centerId!} />
        )}
        {currentTab === 'mesojet' && (
          <MesojetTab clientId={id!} centerId={centerId!} />
        )}
      </div>
    </div>
  );
};

export default EditClientPage;