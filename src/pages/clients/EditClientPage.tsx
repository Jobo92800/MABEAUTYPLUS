import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Scale, Ruler, FileDown, Activity, Sparkles, Zap, Heart, Coffee, ArrowLeft, Pill, Brain, Droplet, MessageSquare, AlertTriangle, X, Ligature as FileSignature, CheckCircle, Eye } from 'lucide-react';
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
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { PAYMENT_COLLECTION } from '../../services/collections';
import { generateClientPDF } from '../../utils/pdfGenerator';
import CureFormModal from '../../components/clients/EmpreinteBilanModal';
import ClientNoteModal from '../../components/clients/ClientNoteModal';
import ContractSignatureModal from '../../components/contract/ContractSignatureModal';
import RuleSelectionModal from '../../components/contract/RuleSelectionModal';
import type { FullClientData } from '../../types/client';
import type { Measurement } from '../../types/measurements';
import type { Session } from '../../types/session';
import { buildContractData, loadPaymentCategories, getSignedContracts, getSignedContractPdf } from '../../services/contractService';
import type { ContractData, SignedContractRecord, PaymentCategoryInfo } from '../../services/contractService';
import { addDays, isAfter, format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ordinalFr = ['1ère', '2ème', '3ème', '4ème', '5ème', '6ème'];
// ordinalFr kept for use in other parts of this file

const CARE_SERVICE_LABELS: Record<string, string> = {
  'luxo-pdp': 'Luxothérapie Perte de Poids',
  'luxo-relax': 'Luxothérapie Relaxation',
  'luxo-meno': 'Luxothérapie Ménopause',
  'ishape': 'I-Shape',
  'cavitalyse': 'Cavitalyse',
  'adipologie': 'Adipologie',
  'presso': 'Presso',
  'meso-corps': 'Méso Corps',
  'meso-visage': 'Méso Visage',
  'advance-lift': 'Advance Lift',
  'psio': 'Psio',
  'guide': 'Guide rééquilibrage alimentaire',
  'tenue': 'Tenue I-Shape',
  'dome': 'Dôme',
};

const CURE_TAB_COLORS = [
  { tab: 'bg-blue-500 text-white', inactive: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100', amount: 'text-blue-600' },
  { tab: 'bg-green-500 text-white', inactive: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100', amount: 'text-green-600' },
  { tab: 'bg-amber-500 text-white', inactive: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100', amount: 'text-amber-600' },
  { tab: 'bg-rose-500 text-white', inactive: 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100', amount: 'text-rose-600' },
  { tab: 'bg-teal-500 text-white', inactive: 'bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100', amount: 'text-teal-600' },
  { tab: 'bg-orange-500 text-white', inactive: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100', amount: 'text-orange-600' },
];

interface PaymentCategoryRaw {
  id: string;
  ruleName?: string;
  name?: string;
  careServices: Array<{ id: string; name?: string; sessions: string }>;
  totalAmount: string;
  deposit?: { amount: string; date: string; method: string; isPaid: boolean; isGiven: boolean };
  installments: Array<{ amount: string; date: string; purpose: string; method: string; isPaid: boolean; isGiven: boolean }>;
}

const CuresPanel: React.FC<{ clientId: string }> = ({ clientId }) => {
  const [categories, setCategories] = useState<PaymentCategoryRaw[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const fmt = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' €';
  const ordinals = ['1ère', '2ème', '3ème', '4ème', '5ème', '6ème'];
  const tabOrdinals = ['1er', '2ème', '3ème', '4ème', '5ème', '6ème'];

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, PAYMENT_COLLECTION, clientId));
        if (snap.exists()) {
          const cats: PaymentCategoryRaw[] = snap.data().categories ?? [];
          setCategories(cats.filter(c => c.totalAmount && parseFloat(c.totalAmount) > 0));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId]);

  if (loading || categories.length === 0) return null;

  const cat = categories[activeIndex];
  const total = parseFloat(cat.totalAmount) || 0;
  const activeServices = (cat.careServices ?? []).filter(cs => {
    const n = parseInt(cs.sessions, 10);
    return !isNaN(n) && n > 0;
  });
  const installments = (cat.installments ?? []).filter(i => i.amount && parseFloat(i.amount) > 0);
  const color = CURE_TAB_COLORS[activeIndex % CURE_TAB_COLORS.length];

  return (
    <div className="mt-6 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Règlements enregistrés</h3>
        {categories.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {categories.map((c, i) => {
              const tc = CURE_TAB_COLORS[i % CURE_TAB_COLORS.length];
              const isActive = i === activeIndex;
              const label = c.ruleName || c.name || `Règlement ${tabOrdinals[i] ?? i + 1}`;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveIndex(i)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150 ${isActive ? tc.tab + ' border-transparent shadow-sm' : tc.inactive + ' border'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            {cat.ruleName || cat.name || 'Règlement 1er'}
          </p>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        {/* Total */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm text-gray-500">Total cure</span>
          <span className={`text-2xl font-bold ${color.amount}`}>{fmt(total)}</span>
        </div>

        {/* Services */}
        {activeServices.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Soins</p>
            <div className="space-y-1">
              {activeServices.map((cs, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-50">
                  <span className="text-gray-700">{CARE_SERVICE_LABELS[cs.id] ?? cs.name ?? cs.id}</span>
                  <span className="text-gray-500 font-medium">{cs.sessions} séance{parseInt(cs.sessions, 10) > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deposit */}
        {cat.deposit?.amount && parseFloat(cat.deposit.amount) > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Acompte</p>
            <div className={`rounded-xl p-3 flex justify-between items-center ring-1 ${cat.deposit.isPaid ? 'bg-green-50 ring-green-200' : 'bg-gray-50 ring-gray-200'}`}>
              <span className={`text-xs font-bold uppercase tracking-wide ${cat.deposit.isPaid ? 'text-green-600' : 'text-gray-400'}`}>
                Acompte{cat.deposit.isPaid ? ' — Payé' : ''}
              </span>
              <span className={`text-lg font-bold ${cat.deposit.isPaid ? 'text-green-600' : 'text-brand-blue'}`}>
                {fmt(parseFloat(cat.deposit.amount))}
              </span>
            </div>
          </div>
        )}

        {/* Installments */}
        {installments.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Échéancier — {installments.length}× paiement{installments.length > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {installments.map((inst, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-3 flex flex-col gap-1 ring-1 ${inst.isPaid ? 'bg-green-50 ring-green-200' : i === 0 ? 'bg-pink-50 ring-pink-200' : 'bg-gray-50 ring-gray-100'}`}
                >
                  <span className={`text-xs font-bold uppercase tracking-wide ${inst.isPaid ? 'text-green-600' : i === 0 ? 'text-pink-600' : 'text-gray-400'}`}>
                    {ordinals[i] ?? `${i + 1}ème`} échéance{inst.isPaid ? ' ✓' : ''}
                  </span>
                  <span className={`text-lg font-bold ${inst.isPaid ? 'text-green-600' : i === 0 ? 'text-pink-600' : 'text-brand-blue'}`}>
                    {fmt(parseFloat(inst.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
      { id: 'sessions', name: 'PDP', icon: Scale },
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
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [exceptionText, setExceptionText] = useState('');
  const [exceptionDraft, setExceptionDraft] = useState('');
  const [savingException, setSavingException] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);
  const [signedContracts, setSignedContracts] = useState<SignedContractRecord[]>([]);
  const [showRuleSelection, setShowRuleSelection] = useState(false);
  const [paymentCategories, setPaymentCategories] = useState<PaymentCategoryInfo[]>([]);

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

      // Charger l'exception cure
      const exceptionDoc = await getDoc(doc(db, 'client-exceptions', id));
      const savedText = exceptionDoc.exists() ? (exceptionDoc.data().text ?? '') : '';
      setExceptionText(savedText);

      // Vérifier les compléments expirés dès le chargement
      await checkExpiredComplements();

      // Charger les contrats signés
      if (id) {
        try {
          const contracts = await getSignedContracts(id);
          setSignedContracts(contracts);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenContractModal = async () => {
    if (!clientData || !id) return;
    setLoadingContract(true);
    try {
      const categories = await loadPaymentCategories(id);
      if (categories.length > 1) {
        setPaymentCategories(categories);
        setShowRuleSelection(true);
      } else {
        const data = await buildContractData(clientData.client, 0);
        if (!data) {
          toast.error('Impossible de charger les données du centre');
          return;
        }
        setContractData(data);
        setShowContractModal(true);
      }
    } catch (err) {
      console.error('Error building contract:', err);
      toast.error('Erreur lors du chargement du contrat');
    } finally {
      setLoadingContract(false);
    }
  };

  const handleRuleSelected = async (categoryIndex: number) => {
    if (!clientData) return;
    setShowRuleSelection(false);
    setLoadingContract(true);
    try {
      const data = await buildContractData(clientData.client, categoryIndex);
      if (!data) {
        toast.error('Impossible de charger les données du centre');
        return;
      }
      setContractData(data);
      setShowContractModal(true);
    } catch (err) {
      console.error('Error building contract:', err);
      toast.error('Erreur lors du chargement du contrat');
    } finally {
      setLoadingContract(false);
    }
  };

  const handleContractSigned = async () => {
    setShowContractModal(false);
    if (id) {
      const contracts = await getSignedContracts(id);
      setSignedContracts(contracts);
    }
  };

  const handleDownloadSignedContract = async (contractId: string) => {
    try {
      const pdfBase64 = await getSignedContractPdf(contractId);
      if (!pdfBase64) {
        toast.error('PDF introuvable');
        return;
      }
      const binary = atob(pdfBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrat_${clientData?.client.lastName ?? 'client'}_${contractId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Erreur lors du téléchargement');
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

  const handleSaveException = async () => {
    if (!id) return;
    setSavingException(true);
    try {
      await setDoc(doc(db, 'client-exceptions', id), { text: exceptionDraft });
      setExceptionText(exceptionDraft);
      setShowExceptionModal(false);
      toast.success('Exception cure sauvegardée');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSavingException(false);
    }
  };

  if (!clientData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client non trouvé</p>
      </div>
    );
  }

  return (
    <>
    {showContractModal && contractData && clientData && (
      <ContractSignatureModal
        contractData={contractData}
        clientId={id!}
        centerId={centerId!}
        clientName={`${clientData.client.firstName} ${clientData.client.lastName}`}
        onClose={() => setShowContractModal(false)}
        onSigned={handleContractSigned}
      />
    )}
    {showRuleSelection && clientData && (
      <RuleSelectionModal
        clientName={`${clientData.client.firstName} ${clientData.client.lastName}`}
        categories={paymentCategories}
        onSelect={handleRuleSelected}
        onClose={() => setShowRuleSelection(false)}
      />
    )}
    {showCureForm && (
      <CureFormModal
        clientId={id}
        centerId={centerId}
        clientName={clientData ? `${clientData.client.firstName} ${clientData.client.lastName}` : undefined}
        onClose={() => setShowCureForm(false)}
        onSaved={() => fetchData()}
      />
    )}
    <ClientNoteModal
      isOpen={showNoteModal}
      onClose={() => setShowNoteModal(false)}
      client={clientData.client}
      centerId={centerId!}
    />

    {/* Modal Exception cure */}
    {showExceptionModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowExceptionModal(false)} />
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-red-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h2 className="text-base font-semibold text-red-700">Exception cure — Contre-indication</h2>
            </div>
            <button onClick={() => setShowExceptionModal(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-gray-500">Indiquez toute contre-indication ou exception à prendre en compte pour ce client.</p>
            <textarea
              rows={5}
              value={exceptionDraft}
              onChange={(e) => setExceptionDraft(e.target.value)}
              placeholder="Ex : allergie au latex, antécédents cardiaques, traitement anticoagulant..."
              className="block w-full rounded-xl border border-gray-200 shadow-sm focus:border-red-400 focus:ring-red-400 text-sm resize-none p-3"
            />
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => setShowExceptionModal(false)}
              className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveException}
              disabled={savingException}
              className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {savingException ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    )}
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold text-brand-blue pt-1">
          {clientData.client.firstName} {clientData.client.lastName}
        </h1>
        <div className="flex flex-col items-end gap-2">
          {/* Ligne 1 : 4 boutons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/centers/${centerId}/clients`)}
              className="flex items-center rounded-full px-6 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200 bg-gray-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </button>
            <button
              onClick={() => setShowNoteModal(true)}
              className="flex items-center rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200 bg-amber-500"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Commentaire
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
            <button
              onClick={handleOpenContractModal}
              disabled={loadingContract}
              className={`
                flex items-center rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200
                ${loadingContract
                  ? 'bg-gray-400 cursor-not-allowed'
                  : signedContracts.length > 0
                    ? 'bg-emerald-500 hover:shadow-md'
                    : 'bg-brand-pink hover:shadow-md'
                }
              `}
            >
              {signedContracts.length > 0 ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <FileSignature className="h-4 w-4 mr-2" />
              )}
              {loadingContract ? 'Chargement...' : signedContracts.length > 0 ? 'Nouveau contrat' : 'Faire signer le contrat'}
            </button>
          </div>
          {/* Ligne 2 : bouton Exception cure */}
          {exceptionText.trim() ? (
            <button
              onClick={() => { setExceptionDraft(exceptionText); setShowExceptionModal(true); }}
              className="flex flex-col items-center gap-2 rounded-2xl px-6 py-4 font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 w-full bg-red-600 hover:bg-red-700 text-center group"
            >
              <div className="flex items-center gap-2.5 justify-center">
                <span className="text-lg leading-none">⚠️</span>
                <span className="text-base tracking-wide">Exception cure</span>
                <span className="text-lg leading-none">⚠️</span>
              </div>
              <div className="w-full h-px bg-red-400/60 rounded-full" />
              <p className="text-sm font-normal text-red-100 leading-relaxed whitespace-pre-wrap line-clamp-3 w-full text-center">
                {exceptionText}
              </p>
            </button>
          ) : (
            <button
              onClick={() => { setExceptionDraft(''); setShowExceptionModal(true); }}
              className="flex items-center justify-center rounded-full px-8 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all duration-200 w-full bg-gray-400 hover:bg-gray-500"
            >
              Exception cure
            </button>
          )}
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
          <>
            <ClientForm
              key={clientData?.client.updatedAt || 'initial'}
              onSubmit={handleSubmit}
              initialData={clientData}
              isSubmitting={isSubmitting}
            />
            {id && <CuresPanel clientId={id} />}
            {signedContracts.length > 0 && (
              <div className="mt-6 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Contrat{signedContracts.length > 1 ? 's' : ''} signé{signedContracts.length > 1 ? 's' : ''}
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {signedContracts.map((c) => (
                    <div key={c.id} className="flex items-center justify-between px-6 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          Signé le {format(new Date(c.signed_at), 'd MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                        <p className="text-xs text-gray-400">{c.client_name} — {c.center_id}</p>
                      </div>
                      <button
                        onClick={() => handleDownloadSignedContract(c.id)}
                        className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold text-brand-blue bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        Télécharger
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
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