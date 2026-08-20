import React, { useState, useEffect } from 'react';
import { Plus, X, CreditCard, Calendar, Euro, Trash2, Calculator } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../services/firebase';
import { PAYMENT_COLLECTION } from '../services/collections';
import { getClientPaymentDataFromAirtable, updateClientTherapistInAirtable, updateClientMontantCureInAirtable, updateClientMontantCureByIndexInAirtable, updateClientAcompteInAirtable, updateClientAvoirInAirtable, updateClientSoinsInAirtable } from '../services/airtable';
import { InstallmentsCalculator } from './InstallmentsCalculator';

interface PaymentLine {
  amount: string;
  date: string;
  purpose: string;
  method: string;
  isPaid: boolean;
  isGiven: boolean;
}

interface CareService {
  id: string;
  name: string;
  sessions: string;
}

interface PaymentCategory {
  id: string;
  name: string;
  ruleName: string;
  careServices: CareService[];
  totalAmount: string;
  deposit?: {
    amount: string;
    date: string;
    method: string;
    isPaid: boolean;
    isGiven: boolean;
  };
  installments: PaymentLine[];
  avoir?: {
    amount: string;
    comment: string;
  };
}

interface PaymentFormProps {
  clientId?: string;
  formData?: any;
  prefix?: string;
  centerId?: string;
  clientFirstName?: string;
  clientLastName?: string;
}

const CARE_SERVICES = [
  { id: 'luxo-pdp', name: 'Luxo - PDP' },
  { id: 'luxo-relax', name: 'Luxo - Relax' },
  { id: 'luxo-meno', name: 'Luxo - Méno' },
  { id: 'ishape', name: 'I-Shape' },
  { id: 'cavitalyse', name: 'Cavitalyse' },
  { id: 'adipologie', name: 'Adipologie' },
  { id: 'presso', name: 'Presso' },
  { id: 'meso-corps', name: 'Méso Corps' },
  { id: 'meso-visage', name: 'Méso Visage' },
  { id: 'advance-lift', name: 'Advance Lift' },
  { id: 'psio', name: 'Psio' },
  { id: 'dome', name: 'Dôme' },
  { id: 'guide', name: 'Guide' },
  { id: 'tenue', name: 'Tenue' }
];

const TREATMENT_LABELS: Record<string, string> = {
  'luxotherapy': 'Luxo - PDP',
  'relaxation': 'Luxo - Relax',
  'menopause': 'Luxo - Méno',
  'ishape': 'I-Shape',
  'cavitalyse': 'Cavitalyse',
  'adipology': 'Adipologie',
  'pressodynamie': 'Presso',
  'mesojet-corps': 'Méso Corps',
  'mesojet': 'Méso Visage',
  'radiofrequency-mesojet': 'RF Mésojet',
  'advance-lift': 'Advance Lift',
  'psio': 'Psio'
};

export const THERAPISTS_BY_CENTER: Record<string, string[]> = {
  'grau-du-roi': ['Marie', 'Fanny', 'Nadia', 'Stéphanie'],
  'le-cres': ['Alexandra', 'Paola', 'Malvina', 'Flora'],
  'serignant': ['Caroll', 'Aude', 'Marie-san'],
  'cabestany': ['Audrey', 'Sara', 'Alexandra C', 'Marine'],
  'avignon': ['Alexandra 2', 'Laura']
};

const PaymentForm: React.FC<PaymentFormProps> = ({ clientId, formData, prefix, centerId, clientFirstName, clientLastName }) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [categories, setCategories] = useState<PaymentCategory[]>([
    {
      id: '1',
      name: '',
      ruleName: '',
      careServices: [],
      totalAmount: '',
      deposit: {
        amount: '',
        date: '',
        method: '',
        isPaid: false,
        isGiven: false
      },
      installments: [{ amount: '', date: '', purpose: '', method: '', isPaid: false, isGiven: false }],
      avoir: {
        amount: '',
        comment: ''
      }
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [therapists, setTherapists] = useState<string[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const loadPaymentData = async () => {
      if (!clientId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const docRef = doc(db, PAYMENT_COLLECTION, clientId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          if (Array.isArray(data.categories) && data.categories.length > 0) {
            const updatedCategories = data.categories.map((cat: any) => {
              return {
                ...cat,
                ruleName: cat.ruleName || cat.name || '',
                name: cat.name || '',
                careServices: cat.careServices || [],
                installments: cat.installments || [{ amount: '', date: '', purpose: '', method: '', isPaid: false, isGiven: false }],
                deposit: cat.deposit || { amount: '', date: '', method: '', isPaid: false, isGiven: false },
                avoir: cat.avoir || { amount: '', comment: '' }
              };
            });
            setCategories(updatedCategories);

            if (clientFirstName && clientLastName && centerId) {
              updatedCategories.forEach((cat: any, index: number) => {
                const amount = parseFloat(cat.totalAmount || '0');
                if (!isNaN(amount) && amount > 0) {
                  updateClientMontantCureByIndexInAirtable(clientFirstName, clientLastName, centerId, index + 1, amount)
                    .catch(() => {});
                }
              });
            }
          }
          if (data.therapists) {
            setTherapists(data.therapists);
          } else if (data.therapist) {
            setTherapists([data.therapist]);
          }
        }
      } catch (error) {
        console.error('Error loading payment data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentData();
  }, [clientId, clientFirstName, clientLastName, centerId]);

  const savePaymentData = async (newCategories?: PaymentCategory[], newTherapists?: string[]) => {
    if (!clientId) return;

    try {
      const docRef = doc(db, PAYMENT_COLLECTION, clientId);
      await setDoc(docRef, {
        categories: newCategories || categories,
        therapists: newTherapists !== undefined ? newTherapists : therapists,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving payment data:', error);
    }
  };

  const handleTotalAmountChange = async (categoryId: string, value: string) => {
    const newCategories = categories.map(cat =>
      cat.id === categoryId ? { ...cat, totalAmount: value } : cat
    );
    setCategories(newCategories);
    await savePaymentData(newCategories);

    if (clientFirstName && clientLastName && centerId) {
      const categoryIndex = newCategories.findIndex(cat => cat.id === categoryId);
      const amount = parseFloat(value || '0');
      if (!isNaN(amount) && amount > 0 && categoryIndex >= 0) {
        const cureIndex = categoryIndex + 1;
        updateClientMontantCureByIndexInAirtable(clientFirstName, clientLastName, centerId, cureIndex, amount)
          .then(() => toast.success(`Règlement ${cureIndex} synchronisé`))
          .catch(err => {
            const msg = err?.message || String(err);
            toast.error(`Erreur cure ${cureIndex}: ${msg.substring(0, 120)}`);
          });
      }
    }
  };

  const handleTotalAmountBlur = async (categoryId: string, value: string) => {
    if (!clientFirstName || !clientLastName || !centerId) return;
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    const amount = parseFloat(value || '0');
    if (!isNaN(amount) && amount > 0 && categoryIndex >= 0) {
      const cureIndex = categoryIndex + 1;
      try {
        await updateClientMontantCureByIndexInAirtable(clientFirstName, clientLastName, centerId, cureIndex, amount);
        toast.success(`Règlement ${cureIndex} synchronisé`);
      } catch (err: any) {
        const msg = err?.message || String(err);
        toast.error(`Erreur cure ${cureIndex}: ${msg.substring(0, 120)}`);
      }
    }
  };

  const handleDepositChange = (categoryId: string, field: keyof PaymentCategory['deposit'], value: any) => {
    const newCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          deposit: {
            ...cat.deposit,
            [field]: value
          }
        };
      }
      return cat;
    });
    setCategories(newCategories);
    savePaymentData(newCategories);

    if (field === 'amount' && clientFirstName && clientLastName && centerId) {
      const acompteAmount = newCategories.reduce(
        (total, category) => total + (parseFloat(category.deposit?.amount || '') || 0),
        0
      );
      updateClientAcompteInAirtable(clientFirstName, clientLastName, centerId, acompteAmount).catch((error) => {
        console.error('[PaymentForm] Erreur synchronisation Acompte:', error);
      });
    }
  };

  const handlePaymentLineChange = (categoryId: string, index: number, field: keyof PaymentLine, value: any) => {
    const newCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        const newInstallments = [...cat.installments];
        newInstallments[index] = { ...newInstallments[index], [field]: value };
        return { ...cat, installments: newInstallments };
      }
      return cat;
    });
    setCategories(newCategories);
    savePaymentData(newCategories);
  };

  const addPaymentLine = (categoryId: string) => {
    const newCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          installments: [...cat.installments, { amount: '', date: '', purpose: '', method: '', isPaid: false, isGiven: false }]
        };
      }
      return cat;
    });
    setCategories(newCategories);
    savePaymentData(newCategories);
  };

  const removePaymentLine = (categoryId: string, index: number) => {
    const newCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        const newInstallments = cat.installments.filter((_, i) => i !== index);
        // Ensure at least one installment remains
        if (newInstallments.length === 0) {
          newInstallments.push({ amount: '', date: '', purpose: '', method: '', isPaid: false, isGiven: false });
        }
        return { ...cat, installments: newInstallments };
      }
      return cat;
    });
    setCategories(newCategories);
    savePaymentData(newCategories);
  };

  const handleRuleNameChange = (categoryId: string, ruleName: string) => {
    const newCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, ruleName };
      }
      return cat;
    });
    setCategories(newCategories);
    savePaymentData(newCategories);
  };

  const addCategory = () => {
    const newCategories = [
      ...categories,
      {
        id: Date.now().toString(),
        name: '',
        ruleName: '',
        careServices: [],
        totalAmount: '',
        deposit: {
          amount: '',
          date: '',
          method: '',
          isPaid: false,
          isGiven: false
        },
        installments: [{ amount: '', date: '', purpose: '', method: '', isPaid: false, isGiven: false }],
        avoir: {
          amount: '',
          comment: ''
        }
      }
    ];
    setCategories(newCategories);
    savePaymentData(newCategories);
  };

  const handleCareServiceToggle = (categoryId: string, serviceId: string) => {
    const newCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        const existingService = cat.careServices.find(cs => cs.id === serviceId);
        let updatedCareServices;

        if (existingService) {
          updatedCareServices = cat.careServices.filter(cs => cs.id !== serviceId);
        } else {
          updatedCareServices = [...cat.careServices, { id: serviceId, name: CARE_SERVICES.find(cs => cs.id === serviceId)?.name || '', sessions: '' }];
        }

        return {
          ...cat,
          careServices: updatedCareServices
        };
      }
      return cat;
    });
    setCategories(newCategories);
    savePaymentData(newCategories);

    if (clientFirstName && clientLastName && centerId) {
      const allCareServiceIds = newCategories.flatMap(cat => cat.careServices.map((cs: any) => cs.id));
      updateClientSoinsInAirtable(clientFirstName, clientLastName, centerId, allCareServiceIds).catch(() => {});
    }
  };

  const handleCareServiceSessionsChange = (categoryId: string, serviceId: string, sessions: string) => {
    const newCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        const updatedCareServices = cat.careServices.map(cs =>
          cs.id === serviceId ? { ...cs, sessions } : cs
        );

        return {
          ...cat,
          careServices: updatedCareServices
        };
      }
      return cat;
    });
    setCategories(newCategories);
    savePaymentData(newCategories);
  };

  const handleTherapistToggle = async (therapistName: string) => {
    const newTherapists = therapists.includes(therapistName)
      ? therapists.filter(t => t !== therapistName)
      : [...therapists, therapistName];
    setTherapists(newTherapists);
    await savePaymentData(undefined, newTherapists);

    if (clientFirstName && clientLastName && centerId) {
      try {
        await updateClientTherapistInAirtable(clientFirstName, clientLastName, centerId, newTherapists);
      } catch (error) {
        console.warn('Échec de la mise à jour du thérapeute dans Airtable:', error);
      }
    }
  };

  const removeCategory = (categoryId: string) => {
    if (categories.length === 1) return;
    const newCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(newCategories);
    savePaymentData(newCategories);
  };

  const handleAvoirChange = async (categoryId: string, field: 'amount' | 'comment', value: string) => {
    const newCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          avoir: {
            ...cat.avoir,
            [field]: value
          }
        };
      }
      return cat;
    });
    setCategories(newCategories);
    await savePaymentData(newCategories);

    // Mettre à jour Airtable seulement si c'est le montant qui change
    if (field === 'amount' && clientFirstName && clientLastName && centerId) {
      const category = newCategories.find(cat => cat.id === categoryId);
      if (category && category.avoir) {
        const avoirAmount = category.avoir.amount || '';

        console.log('Mise à jour Avoir dans Airtable:', {
          clientFirstName,
          clientLastName,
          centerId,
          avoirAmount
        });

        try {
          await updateClientAvoirInAirtable(clientFirstName, clientLastName, centerId, avoirAmount);
          console.log('✓ Avoir mis à jour avec succès dans Airtable');
        } catch (error) {
          console.error('✗ Échec de la mise à jour de l\'Avoir dans Airtable:', error);
        }
      }
    }
  };

  // Nouvelle logique simplifiée pour les couleurs
  const getPaymentLineColor = (isPaid: boolean, isGiven: boolean, hasAmount: boolean) => {
    // Si pas de montant, pas de couleur
    if (!hasAmount) return '';

    // Si payé -> vert
    if (isPaid) {
      return 'bg-green-50 border-green-200';
    }

    // Si donné -> gris
    if (isGiven) {
      return 'bg-gray-100 border-gray-300';
    }

    // Si ni payé ni donné -> rouge
    return 'bg-red-50 border-red-200';
  };

  const handleCalculatorValidate = async (data: { total: number; installments: number[]; careServiceIds: string[]; careServicesWithSessions: Array<{ id: string; sessions: string }>; paymentMode: 'standard' | 'alma' }) => {
    const categoryIdToUpdate = activeCategoryId || categories[0]?.id;

    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryIdToUpdate) {
        // Build updated care services: merge existing with new, preserving existing sessions,
        // using calculator sessions for new or already-checked services
        const incomingMap = new Map(data.careServicesWithSessions.map(cs => [cs.id, cs.sessions]));
        const existingIds = new Set(cat.careServices.map((cs: any) => cs.id));

        // Update sessions on existing services that are in the new selection
        const updatedExisting = cat.careServices.map((cs: any) => ({
          ...cs,
          sessions: incomingMap.has(cs.id) ? incomingMap.get(cs.id)! : cs.sessions,
        }));

        // Add brand new services not already in the list
        const newServices = data.careServicesWithSessions
          .filter(cs => !existingIds.has(cs.id))
          .map(cs => ({ id: cs.id, name: CARE_SERVICES.find(s => s.id === cs.id)?.name || '', sessions: cs.sessions }));

        return {
          ...cat,
          careServices: [...updatedExisting, ...newServices],
          totalAmount: data.total.toString(),
          installments: data.paymentMode === 'alma'
            ? [{
                amount: data.total.toString(),
                date: '',
                purpose: 'Règlement Alma',
                method: 'alma',
                isPaid: false,
                isGiven: false
              }]
            : data.installments.map((amount, index) => ({
                amount: amount.toString(),
                date: '',
                purpose: index === 0 ? 'Première échéance' : `Échéance ${index + 1}`,
                method: '',
                isPaid: false,
                isGiven: false
              }))
        };
      }
      return cat;
    });

    setCategories(updatedCategories);
    await savePaymentData(updatedCategories);

    if (clientFirstName && clientLastName && centerId) {
      const categoryIndex = updatedCategories.findIndex(cat => cat.id === categoryIdToUpdate);
      if (categoryIndex >= 0 && data.total > 0) {
        const cureIndex = categoryIndex + 1;
        try {
          await updateClientMontantCureByIndexInAirtable(clientFirstName, clientLastName, centerId, cureIndex, data.total);
          toast.success(`Règlement ${cureIndex} synchronisé avec Airtable`);
        } catch (err) {
          console.error(`[PaymentForm] Erreur Montant Cure ${cureIndex}:`, err);
          toast.error(`Erreur synchro Airtable règlement ${cureIndex}`);
        }
      }

      const allCareServiceIds = updatedCategories.flatMap(cat => cat.careServices.map((cs: any) => cs.id));
      updateClientSoinsInAirtable(clientFirstName, clientLastName, centerId, allCareServiceIds).catch(() => {});
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  const availableTherapists = centerId ? THERAPISTS_BY_CENTER[centerId] || [] : [];

  return (
    <div className="space-y-8">
      <InstallmentsCalculator
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        clientName={formData?.name || ''}
        onValidate={handleCalculatorValidate}
      />

      {/* Therapist Field */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <label className="block text-lg font-medium text-gray-900 mb-4">
          Thérapeute{therapists.length > 1 ? 's' : ''}
        </label>
        {availableTherapists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availableTherapists.map((therapist) => (
              <label key={therapist} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={therapists.includes(therapist)}
                  onChange={() => handleTherapistToggle(therapist)}
                  className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                />
                <span className="text-sm text-gray-700">{therapist}</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Aucun centre sélectionné ou thérapeutes disponibles</p>
        )}
        {therapists.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Sélectionné{therapists.length > 1 ? 's' : ''} :</span>
            {therapists.map((t) => (
              <span key={t} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-blue text-white">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {categories.map((category, categoryIndex) => (
        <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-blue to-brand-pink p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Règlement {categoryIndex + 1}
              </h3>
              {categories.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCategory(category.id)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Rule Name with Calculator Button */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor={`ruleName-${category.id}`} className="block text-sm font-medium text-gray-700">
                  Nom de règlement
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategoryId(category.id);
                    setShowCalculator(true);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Calculator className="h-4 w-4" />
                  Calcul des échéances
                </button>
              </div>
              <input
                type="text"
                name={`ruleName-${category.id}`}
                id={`ruleName-${category.id}`}
                value={category.ruleName}
                onChange={(e) => handleRuleNameChange(category.id, e.target.value)}
                placeholder="Ex: Prénom Nom - Luxo PDP"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
              />
            </div>

            {/* Care Services */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Soins Appliqués
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CARE_SERVICES.map((service) => {
                  const isChecked = category.careServices.some(cs => cs.id === service.id);
                  const careService = category.careServices.find(cs => cs.id === service.id);

                  return (
                    <div key={service.id} className="space-y-2">
                      <label className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCareServiceToggle(category.id, service.id)}
                          className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                        />
                        <span className="text-sm text-gray-700">{service.name}</span>
                      </label>
                      {isChecked && (
                        <input
                          type="text"
                          value={careService?.sessions || ''}
                          onChange={(e) => handleCareServiceSessionsChange(category.id, service.id, e.target.value)}
                          placeholder="Nb de séances"
                          className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {category.careServices.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 font-medium">Résumé :</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {category.careServices.map(cs => `${cs.sessions || '?'} ${cs.name}`).join(' + ')}
                  </p>
                </div>
              )}
            </div>

            {/* Total Amount */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label htmlFor={`totalAmount-${category.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                Tarif total cure {categoryIndex + 1}
              </label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  name={`totalAmount-${category.id}`}
                  id={`totalAmount-${category.id}`}
                  value={category.totalAmount}
                  onChange={(e) => handleTotalAmountChange(category.id, e.target.value)}
                  onBlur={(e) => handleTotalAmountBlur(category.id, e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="block w-full pl-10 rounded-lg border-gray-200 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Deposit Section */}
            <div className={`p-4 rounded-lg space-y-4 border-2 ${getPaymentLineColor(
              category.deposit?.isPaid || false, 
              category.deposit?.isGiven || false, 
              !!(category.deposit?.amount && parseFloat(category.deposit.amount) > 0)
            )}`}>
              <h4 className="text-sm font-medium text-gray-900">Acompte</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Amount */}
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={category.deposit?.amount || ''}
                    onChange={(e) => handleDepositChange(category.id, 'amount', e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="block w-full pl-10 rounded-lg border-gray-200 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                    placeholder="Montant"
                  />
                </div>

                {/* Date */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={category.deposit?.date || ''}
                    onChange={(e) => handleDepositChange(category.id, 'date', e.target.value)}
                    className="block w-full pl-10 rounded-lg border-gray-200 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Payment Method */}
                <div className="relative flex-1">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={category.deposit?.method || ''}
                    onChange={(e) => handleDepositChange(category.id, 'method', e.target.value)}
                    className="block w-full pl-10 rounded-lg border-gray-200 shadow-sm focus:border-brand-blue focus:ring-brand-blue appearance-none"
                  >
                    <option value="">Moyen de paiement</option>
                    <option value="cheque">Chèque</option>
                    <option value="especes">Espèces</option>
                    <option value="cb">Carte bancaire</option>
                    <option value="alma">Alma</option>
                  </select>
                </div>

                {/* Status Checkboxes */}
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={category.deposit?.isPaid || false}
                      onChange={(e) => handleDepositChange(category.id, 'isPaid', e.target.checked)}
                      className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                    />
                    <span className="text-sm text-gray-700">Payé</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={category.deposit?.isGiven || false}
                      onChange={(e) => handleDepositChange(category.id, 'isGiven', e.target.checked)}
                      className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                    />
                    <span className="text-sm text-gray-700">Donné</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Installments Section */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-900">
                  Règlement en plusieurs fois
                </h4>
                <button
                  type="button"
                  onClick={() => addPaymentLine(category.id)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-brand-blue hover:text-brand-pink transition-colors rounded-full hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un paiement
                </button>
              </div>

              <div className="space-y-3">
                {category.installments.map((line, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-start p-3 rounded-lg border-2 ${getPaymentLineColor(
                      line.isPaid,
                      line.isGiven,
                      !!(line.amount && parseFloat(line.amount) > 0)
                    )}`}
                  >
                    {/* Amount */}
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Montant"
                        value={line.amount}
                        onChange={(e) => handlePaymentLineChange(category.id, index, 'amount', e.target.value)}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="block w-full pl-10 rounded-lg border-gray-200 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                      />
                    </div>

                    {/* Date */}
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={line.date}
                        onChange={(e) => handlePaymentLineChange(category.id, index, 'date', e.target.value)}
                        className="block w-full pl-10 rounded-lg border-gray-200 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                      />
                    </div>

                    {/* Purpose */}
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Pour"
                        value={line.purpose}
                        onChange={(e) => handlePaymentLineChange(category.id, index, 'purpose', e.target.value)}
                        className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                      />
                    </div>

                    {/* Payment Method */}
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={line.method}
                        onChange={(e) => handlePaymentLineChange(category.id, index, 'method', e.target.value)}
                        className="block w-full pl-10 rounded-lg border-gray-200 shadow-sm focus:border-brand-blue focus:ring-brand-blue appearance-none"
                      >
                        <option value="">Paiement</option>
                        <option value="cheque">Chèque</option>
                        <option value="especes">Espèces</option>
                        <option value="cb">Carte bancaire</option>
                        <option value="alma">Alma</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={line.isPaid}
                          onChange={(e) => handlePaymentLineChange(category.id, index, 'isPaid', e.target.checked)}
                          className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                        />
                        <span className="text-sm text-gray-700">Payé</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={line.isGiven}
                          onChange={(e) => handlePaymentLineChange(category.id, index, 'isGiven', e.target.checked)}
                          className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                        />
                        <span className="text-sm text-gray-700">Donné</span>
                      </label>
                    </div>

                    {/* Delete Button */}
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => removePaymentLine(category.id, index)}
                        disabled={category.installments.length === 1}
                        className={`p-2 rounded-full transition-colors ${
                          category.installments.length === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                        }`}
                        title={category.installments.length === 1 ? 'Au moins une ligne de paiement est requise' : 'Supprimer cette ligne'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Avoir Section */}
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Avoir</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant de l'avoir
                  </label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={category.avoir?.amount || ''}
                      onChange={(e) => handleAvoirChange(category.id, 'amount', e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire avoir
                  </label>
                  <input
                    type="text"
                    placeholder="Commentaire..."
                    value={category.avoir?.comment || ''}
                    onChange={(e) => handleAvoirChange(category.id, 'comment', e.target.value)}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Add Category Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={addCategory}
          className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-blue to-brand-pink rounded-full shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une catégorie de règlement
        </button>
      </div>
    </div>
  );
};

export default PaymentForm;