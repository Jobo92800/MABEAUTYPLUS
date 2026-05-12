import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, Scale, Ruler, FileDown, Activity,
  Sparkles, Zap, Heart, Coffee, ArrowLeft, Pill, Brain, Droplet
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
import MesojetCorpsTab from '../../components/clients/MesojetCorpsTab';
import ComplementAlimentaireTab from '../../components/clients/ComplementAlimentaireTab';
import PsioTab from '../../components/clients/PsioTab';
import DomeTab from '../../components/clients/DomeTab';
import { getFullClientData, getMeasurements, getSessions, updateClient } from '../../services/database';
import { generateClientPDF } from '../../utils/pdfGenerator';
import CureFormModal from '../../components/clients/CureFormModal';
import type { FullClientData } from '../../types/client';
import type { Measurement } from '../../types/measurements';
import type { Session } from '../../types/session';
import { addDays, isAfter } from 'date-fns';

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
      { id: 'pressodynamie', name: 'Pressodynamie', icon: Zap },
      { id: 'mesojet-corps', name: 'Mésojet Corps', icon: Sparkles },
      { id: 'dome', name: 'Dôme', icon: Droplet }
    ]
  },
  {
    name: 'Anti-âge',
    tabs: [
      { id: 'advanceLift', name: 'Advance Lift', icon: Heart },
      { id: 'mesojet', name: 'Mésojet Visage', icon: Sparkles }
    ]
  },
  {
    name: 'Bien-être',
    tabs: [
      { id: 'psio', name: 'PSIO', icon: Brain }
    ]
  },
  {
    name: 'Compléments',
    tabs: [
      { id: 'complementAlimentaire', name: 'Complément Alimentaire', icon: Pill }
    ]
  }
];

// SOS n'a plus de calcul automatique d'échéance
const COMPLEMENT_TYPES = [
  { id: 'BURN', daysPerBox: 15 },
  { id: 'SOS', daysPerBox: null }, // Pas de calcul automatique pour SOS
  { id: 'DETOX', daysPerBox: 15 },
  { id: 'SKIN', daysPerBox: 30 }
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExpiredComplements, setHasExpiredComplements] = useState(false);
  const [showCureForm, setShowCureForm] = useState(false);

  // Fonction pour vérifier les compléments expirés (SOS exclu du calcul automatique)
  const checkExpiredComplements = async () => {
    if (!id || !centerId) return;

    try {
      const complementSessions = await getSessions(id, centerId, 'complement-alimentaire');
      
      // Calculer les totaux par type et vérifier l'expiration
      const totals = COMPLEMENT_TYPES.reduce((acc, type) => {
        acc[type.id] = { total: 0, isExpired: false };
        return acc;
      }, {} as Record<string, { total: number; isExpired: boolean }>);

      // Grouper les ventes par type
      const salesByType = complementSessions.reduce((acc, session) => {
        const type = session.complementType;
        if (!type) return acc;
        if (!acc[type]) acc[type] = [];
        acc[type].push({
          date: session.date,
          quantity: session.quantity || 1,
          type: type
        });
        return acc;
      }, {} as Record<string, Array<{ date: string; quantity: number; type: string }>>);

      // Pour chaque type, vérifier l'expiration (sauf SOS)
      Object.entries(salesByType).forEach(([type, typeSales]) => {
        if (!totals[type]) return;

        // SOS n'a pas de calcul automatique d'échéance
        if (type === 'SOS') {
          totals[type].total = typeSales.reduce((sum, sale) => sum + sale.quantity, 0);
          totals[type].isExpired = false; // SOS ne peut jamais être "expiré" automatiquement
          return;
        }

        // Trier les ventes par date (plus récente en premier)
        const sortedSales = typeSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        let remainingQuantity = 0;
        const currentDate = new Date();

        // Calculer la quantité restante en partant de la vente la plus récente
        for (const sale of sortedSales) {
          const complementType = COMPLEMENT_TYPES.find(t => t.id === sale.type);
          if (!complementType || !complementType.daysPerBox) continue;
          
          const totalDays = complementType.daysPerBox * sale.quantity;
          const expiryDate = addDays(new Date(sale.date), totalDays);
          
          if (isAfter(currentDate, expiryDate)) {
            // Cette vente est expirée, ne pas compter sa quantité
            continue;
          }
          remainingQuantity += sale.quantity;
        }

        // Si toutes les ventes sont expirées ou s'il n'y a plus de stock
        if (remainingQuantity === 0 && typeSales.length > 0) {
          // Vérifier si la vente la plus récente est expirée
          const latestSale = sortedSales[0];
          if (latestSale) {
            const complementType = COMPLEMENT_TYPES.find(t => t.id === latestSale.type);
            if (complementType && complementType.daysPerBox) {
              const totalDays = complementType.daysPerBox * latestSale.quantity;
              const expiryDate = addDays(new Date(latestSale.date), totalDays);
              if (isAfter(currentDate, expiryDate)) {
                totals[type].isExpired = true;
              }
            }
          }
        }

        totals[type].total = typeSales.reduce((sum, sale) => sum + sale.quantity, 0);
      });

      // Vérifier s'il y a au moins un complément expiré (SOS exclu)
      const hasAnyExpired = Object.entries(totals)
        .filter(([type]) => type !== 'SOS') // Exclure SOS de la vérification
        .some(([, total]) => total.isExpired);
      setHasExpiredComplements(hasAnyExpired);
    } catch (error) {
      console.error('Error checking expired complements:', error);
    }
  };

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

      // Vérifier les compléments expirés dès le chargement
      await checkExpiredComplements();
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

    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await updateClient(id, formData, centerId);
      await fetchData();
      toast.success('Client mis à jour avec succès');
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour du client');
    } finally {
      setIsSubmitting(false);
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

  // Fonction pour gérer le changement de statut d'expiration des compléments
  const handleComplementExpiryChange = (hasExpired: boolean) => {
    setHasExpiredComplements(hasExpired);
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
    <>
    {showCureForm && (
      <CureFormModal
        clientName={clientData ? `${clientData.client.firstName} ${clientData.client.lastName}` : undefined}
        onClose={() => setShowCureForm(false)}
      />
    )}
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-blue">
          {clientData.client.firstName} {clientData.client.lastName}
        </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/centers/${centerId}/clients`)}
            className="flex items-center rounded-full px-6 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200 bg-gray-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </button>
          <button
            onClick={() => setShowCureForm(true)}
            className="flex items-center rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200 bg-brand-pink"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Formulaire Cure
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
                    // Vérifier si c'est l'onglet Complément Alimentaire et s'il y a des compléments expirés
                    const isComplementTab = tab.id === 'complementAlimentaire';
                    const shouldBeOrange = isComplementTab && hasExpiredComplements;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setCurrentTab(tab.id)}
                        className={`
                          group inline-flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
                          ${currentTab === tab.id
                            ? shouldBeOrange 
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'bg-brand-blue text-white shadow-sm'
                            : shouldBeOrange
                              ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <Icon className={`
                          ${currentTab === tab.id 
                            ? 'text-white' 
                            : shouldBeOrange
                              ? 'text-orange-500 group-hover:text-orange-600'
                              : 'text-gray-400 group-hover:text-gray-500'
                          }
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
          <ClientForm onSubmit={handleSubmit} initialData={clientData} isSubmitting={isSubmitting} />
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
        {currentTab === 'psio' && (
          <PsioTab clientId={id!} centerId={centerId!} />
        )}
        {currentTab === 'mesojet' && (
          <MesojetTab clientId={id!} centerId={centerId!} />
        )}
        {currentTab === 'mesojet-corps' && (
          <MesojetCorpsTab clientId={id!} centerId={centerId!} />
        )}
        {currentTab === 'complementAlimentaire' && (
          <ComplementAlimentaireTab
            clientId={id!}
            centerId={centerId!}
            onExpiryStatusChange={handleComplementExpiryChange}
          />
        )}
        {currentTab === 'dome' && (
          <DomeTab initialData={clientData} />
        )}
      </div>
    </div>
    </>
  );
};

export default EditClientPage;