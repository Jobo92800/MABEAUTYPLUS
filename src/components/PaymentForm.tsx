import React, { useState, useEffect } from 'react';
import { Plus, X, CreditCard, Calendar, Euro, Trash2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { PAYMENT_COLLECTION } from '../services/collections';

interface PaymentLine {
  amount: string;
  date: string;
  purpose: string;
  method: string;
  isPaid: boolean;
  isGiven: boolean;
}

interface PaymentCategory {
  id: string;
  name: string;
  totalAmount: string;
  deposit?: {
    amount: string;
    date: string;
    method: string;
    isPaid: boolean;
    isGiven: boolean;
  };
  installments: PaymentLine[];
}

interface PaymentFormProps {
  clientId?: string;
  formData?: any;
  prefix?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ clientId, formData, prefix }) => {
  const [categories, setCategories] = useState<PaymentCategory[]>([
    {
      id: '1',
      name: '',
      totalAmount: '',
      deposit: {
        amount: '',
        date: '',
        method: '',
        isPaid: false,
        isGiven: false
      },
      installments: [{ amount: '', date: '', purpose: '', method: '', isPaid: false, isGiven: false }]
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState('');

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
            setCategories(data.categories);
          }
          if (data.therapist) {
            setTherapist(data.therapist);
          }
        }
      } catch (error) {
        console.error('Error loading payment data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentData();
  }, [clientId]);

  const savePaymentData = async (newCategories: PaymentCategory[]) => {
    if (!clientId) return;

    try {
      const docRef = doc(db, PAYMENT_COLLECTION, clientId);
      await setDoc(docRef, {
        categories: newCategories,
        therapist,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving payment data:', error);
    }
  };

  const handleTotalAmountChange = (categoryId: string, value: string) => {
    const newCategories = categories.map(cat => 
      cat.id === categoryId ? { ...cat, totalAmount: value } : cat
    );
    setCategories(newCategories);
    savePaymentData(newCategories);
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

  const addCategory = () => {
    const newCategories = [
      ...categories,
      {
        id: (categories.length + 1).toString(),
        name: '',
        totalAmount: '',
        deposit: {
          amount: '',
          date: '',
          method: '',
          isPaid: false,
          isGiven: false
        },
        installments: [{ amount: '', date: '', purpose: '', method: '', isPaid: false, isGiven: false }]
      }
    ];
    setCategories(newCategories);
    savePaymentData(newCategories);
  };

  const removeCategory = (categoryId: string) => {
    if (categories.length === 1) return;
    const newCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(newCategories);
    savePaymentData(newCategories);
  };

  const getPaymentLineColor = (date: string, method: string, isPaid: boolean, isGiven: boolean) => {
    if (!date) return '';
    
    const paymentDate = new Date(date);
    const today = new Date();
    
    if (isPaid) {
      return 'bg-green-50';
    }
    
    if (method === 'cheque' && !isGiven && !isPaid) {
      return 'bg-red-500/10';
    }
    
    if (paymentDate < today && !isGiven && !isPaid) {
      return 'bg-red-500/10';
    }
    
    return '';
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Therapist Field */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <label htmlFor="therapist" className="block text-lg font-medium text-gray-900 mb-4">
          Thérapeute
        </label>
        <input
          type="text"
          name="therapist"
          id="therapist"
          value={therapist}
          onChange={(e) => {
            setTherapist(e.target.value);
            savePaymentData(categories);
          }}
          className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 shadow-sm focus:border-brand-blue focus:ring-brand-blue transition-colors"
          placeholder="Nom du thérapeute"
        />
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
            {/* Payment Name */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label htmlFor={`name-${category.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                Nom du règlement
              </label>
              <input
                type="text"
                id={`name-${category.id}`}
                value={category.name}
                onChange={(e) => {
                  const newCategories = categories.map(cat => 
                    cat.id === category.id ? { ...cat, name: e.target.value } : cat
                  );
                  setCategories(newCategories);
                  savePaymentData(newCategories);
                }}
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                placeholder="ex: 12 luxo + 9 i-shape"
              />
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
                  className="block w-full pl-10 rounded-lg border-gray-200 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Deposit Section */}
            <div className={`p-4 rounded-lg space-y-4 ${getPaymentLineColor(category.deposit?.date || '', category.deposit?.method || '', category.deposit?.isPaid || false, category.deposit?.isGiven || false)}`}>
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
                    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-start p-3 rounded-lg ${getPaymentLineColor(line.date, line.method, line.isPaid, line.isGiven)}`}
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