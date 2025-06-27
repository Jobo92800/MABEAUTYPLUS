import React, { useState, useEffect } from 'react';
import { format, addDays, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, X, Pencil, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { getSessions, addSession, updateSession, deleteSession } from '../../services/database';
import type { Session } from '../../types/session';
import { toast } from 'react-hot-toast';

interface ComplementAlimentaireTabProps {
  clientId: string;
  centerId: string;
  onExpiryStatusChange?: (hasExpired: boolean) => void; // Nouvelle prop pour communiquer le statut
}

interface ComplementSale {
  id?: string;
  clientId: string;
  centerId: string;
  date: string;
  type: string; // BURN, S.O.S, DÉTOX, SKIN
  quantity: number;
  createdAt?: string;
}

// SOS n'a plus de calcul automatique d'échéance
const COMPLEMENT_TYPES = [
  { 
    id: 'BURN', 
    label: 'BURN', 
    color: 'bg-yellow-500', 
    bgColor: 'bg-yellow-50', 
    textColor: 'text-yellow-700',
    daysPerBox: 15
  },
  { 
    id: 'SOS', 
    label: 'S.O.S', 
    color: 'bg-red-500', 
    bgColor: 'bg-red-50', 
    textColor: 'text-red-700',
    daysPerBox: null // Pas de calcul automatique pour SOS
  },
  { 
    id: 'DETOX', 
    label: 'DÉTOX', 
    color: 'bg-green-500', 
    bgColor: 'bg-green-50', 
    textColor: 'text-green-700',
    daysPerBox: 15
  },
  { 
    id: 'SKIN', 
    label: 'SKIN', 
    color: 'bg-blue-500', 
    bgColor: 'bg-blue-50', 
    textColor: 'text-blue-700',
    daysPerBox: 30
  }
];

const ComplementAlimentaireTab: React.FC<ComplementAlimentaireTabProps> = ({ 
  clientId, 
  centerId, 
  onExpiryStatusChange 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [sales, setSales] = useState<ComplementSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSale, setEditingSale] = useState<ComplementSale | null>(null);
  const [newSale, setNewSale] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: '',
    quantity: 1
  });

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSessions(clientId, centerId, 'complement-alimentaire');
      setSales(data.map(session => ({
        id: session.id,
        clientId: session.clientId,
        centerId: session.centerId,
        date: session.date,
        type: session.complementType || '',
        quantity: session.quantity || 1,
        createdAt: session.createdAt
      })));
    } catch (err: any) {
      console.error('Error fetching complement sales:', err);
      setError('Erreur lors du chargement des ventes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [clientId, centerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSale.type) {
      toast.error('Veuillez sélectionner un type de complément');
      return;
    }

    try {
      if (editingSale) {
        await updateSession({
          id: editingSale.id,
          clientId,
          centerId,
          type: 'complement-alimentaire',
          date: newSale.date,
          complementType: newSale.type,
          quantity: newSale.quantity,
          comment: `${newSale.type} - Quantité: ${newSale.quantity}`
        });
        toast.success('Vente mise à jour avec succès');
      } else {
        await addSession({
          clientId,
          centerId,
          type: 'complement-alimentaire',
          date: newSale.date,
          complementType: newSale.type,
          quantity: newSale.quantity,
          comment: `${newSale.type} - Quantité: ${newSale.quantity}`,
          number: sales.length + 1
        });
        toast.success('Complément ajouté avec succès');
      }

      await fetchSales();
      setShowAddForm(false);
      setEditingSale(null);
      setNewSale({
        date: format(new Date(), 'yyyy-MM-dd'),
        type: '',
        quantity: 1
      });
    } catch (error) {
      console.error('Error saving complement sale:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (sale: ComplementSale) => {
    setEditingSale(sale);
    setNewSale({
      date: sale.date,
      type: sale.type,
      quantity: sale.quantity
    });
    setShowAddForm(true);
  };

  const handleDelete = async (saleId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
      return;
    }

    try {
      await deleteSession(saleId);
      toast.success('Vente supprimée avec succès');
      await fetchSales();
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Calculer la date d'échéance pour une vente (sauf SOS)
  const calculateExpiryDate = (sale: ComplementSale) => {
    const complementType = COMPLEMENT_TYPES.find(t => t.id === sale.type);
    if (!complementType || !complementType.daysPerBox) return null; // SOS retourne null
    
    const totalDays = complementType.daysPerBox * sale.quantity;
    return addDays(new Date(sale.date), totalDays);
  };

  // Vérifier si un complément est expiré (SOS ne peut jamais être expiré)
  const isExpired = (sale: ComplementSale) => {
    if (sale.type === 'SOS') return false; // SOS ne peut jamais être expiré
    
    const expiryDate = calculateExpiryDate(sale);
    if (!expiryDate) return false;
    return isAfter(new Date(), expiryDate);
  };

  // Calculer les totaux par type et vérifier l'expiration (SOS exclu du calcul d'expiration)
  const calculateTotalsWithExpiry = () => {
    const totals = COMPLEMENT_TYPES.reduce((acc, type) => {
      acc[type.id] = { total: 0, isExpired: false, latestExpiryDate: null };
      return acc;
    }, {} as Record<string, { total: number; isExpired: boolean; latestExpiryDate: Date | null }>);

    // Grouper les ventes par type et calculer les totaux
    const salesByType = sales.reduce((acc, sale) => {
      if (!acc[sale.type]) acc[sale.type] = [];
      acc[sale.type].push(sale);
      return acc;
    }, {} as Record<string, ComplementSale[]>);

    // Pour chaque type, calculer le total et vérifier l'expiration
    Object.entries(salesByType).forEach(([type, typeSales]) => {
      if (!totals[type]) return;

      // SOS n'a pas de calcul d'expiration
      if (type === 'SOS') {
        totals[type] = {
          total: typeSales.reduce((sum, sale) => sum + sale.quantity, 0),
          isExpired: false, // SOS ne peut jamais être expiré
          latestExpiryDate: null
        };
        return;
      }

      // Trier les ventes par date (plus récente en premier)
      const sortedSales = typeSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      let remainingQuantity = 0;
      let currentDate = new Date();
      let isTypeExpired = false;

      // Calculer la quantité restante en partant de la vente la plus récente
      for (const sale of sortedSales) {
        const expiryDate = calculateExpiryDate(sale);
        if (expiryDate && isAfter(currentDate, expiryDate)) {
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
          const latestExpiryDate = calculateExpiryDate(latestSale);
          if (latestExpiryDate && isAfter(currentDate, latestExpiryDate)) {
            isTypeExpired = true;
          }
        }
      }

      totals[type] = {
        total: typeSales.reduce((sum, sale) => sum + sale.quantity, 0),
        isExpired: isTypeExpired,
        latestExpiryDate: null
      };
    });

    return totals;
  };

  // Fonction pour obtenir les couleurs d'un type (uniquement pour l'historique)
  const getTypeColors = (typeId: string) => {
    const type = COMPLEMENT_TYPES.find(t => t.id === typeId);
    return type || { color: 'bg-gray-500', bgColor: 'bg-gray-50', textColor: 'text-gray-700' };
  };

  const totalsWithExpiry = calculateTotalsWithExpiry();

  // Vérifier s'il y a au moins un complément expiré et notifier le parent (SOS exclu)
  useEffect(() => {
    const hasAnyExpired = Object.entries(totalsWithExpiry)
      .filter(([type]) => type !== 'SOS') // Exclure SOS de la vérification
      .some(([, total]) => total.isExpired);
    if (onExpiryStatusChange) {
      onExpiryStatusChange(hasAnyExpired);
    }
  }, [totalsWithExpiry, onExpiryStatusChange]);

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

  return (
    <div className="space-y-6">
      {/* Tableau récapitulatif avec gestion de l'expiration */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-base font-semibold leading-6 text-gray-900 mb-4">
            Récapitulatif des compléments alimentaires
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {COMPLEMENT_TYPES.map((type) => {
              const typeData = totalsWithExpiry[type.id] || { total: 0, isExpired: false };
              const isExpiredType = typeData.isExpired;
              
              return (
                <div 
                  key={type.id} 
                  className={`p-4 rounded-lg text-center border-l-4 transition-all duration-200 ${
                    isExpiredType 
                      ? 'bg-red-50 border-red-500' 
                      : 'bg-gray-50 border-brand-blue'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <div className={`text-lg font-semibold ${
                      isExpiredType ? 'text-red-700' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </div>
                    {isExpiredType && (
                      <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${
                    isExpiredType ? 'text-red-600' : 'text-brand-blue'
                  }`}>
                    {typeData.total}
                  </div>
                  {isExpiredType && (
                    <div className="text-xs text-red-600 mt-1">
                      Stock expiré
                    </div>
                  )}
                  {type.id === 'SOS' && (
                    <div className="text-xs text-gray-500 mt-1">
                      Pas d'échéance
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section des ventes */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-base font-semibold leading-6 text-gray-900">
                Historique des ventes
              </h2>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="flex items-center rounded-full bg-brand-blue px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un complément
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-900">
                  {editingSale ? 'Modifier la vente' : 'Nouveau complément'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingSale(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      id="date"
                      value={newSale.date}
                      onChange={(e) => setNewSale({ ...newSale, date: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Type de complément
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={newSale.type}
                      onChange={(e) => setNewSale({ ...newSale, type: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                      required
                    >
                      <option value="">Sélectionner un type</option>
                      {COMPLEMENT_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label} {type.daysPerBox ? `(${type.daysPerBox} jours/boîte)` : '(pas d\'échéance)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                      Quantité (boîtes)
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      id="quantity"
                      min="1"
                      value={newSale.quantity}
                      onChange={(e) => setNewSale({ ...newSale, quantity: parseInt(e.target.value) || 1 })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Aperçu de la date d'échéance (sauf pour SOS) */}
                {newSale.type && newSale.type !== 'SOS' && newSale.quantity && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm text-blue-700">
                        Date d'échéance calculée : {
                          (() => {
                            const complementType = COMPLEMENT_TYPES.find(t => t.id === newSale.type);
                            if (complementType && complementType.daysPerBox) {
                              const totalDays = complementType.daysPerBox * newSale.quantity;
                              const expiryDate = addDays(new Date(newSale.date), totalDays);
                              return format(expiryDate, 'dd MMMM yyyy', { locale: fr });
                            }
                            return '';
                          })()
                        }
                      </span>
                    </div>
                  </div>
                )}

                {/* Message pour SOS */}
                {newSale.type === 'SOS' && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        SOS : Pas de calcul automatique d'échéance
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {editingSale ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantité</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date d'échéance</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[...sales].reverse().map((sale) => {
                      const typeColors = getTypeColors(sale.type);
                      const expiryDate = calculateExpiryDate(sale);
                      const expired = isExpired(sale);
                      
                      return (
                        <tr key={sale.id} className={expired ? 'bg-red-50' : ''}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500">
                            {format(new Date(sale.date), 'dd MMMM yyyy', { locale: fr })}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex items-center rounded-full ${typeColors.bgColor} px-3 py-1 text-sm font-medium ${typeColors.textColor}`}>
                              {sale.type}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {sale.quantity} boîte{sale.quantity > 1 ? 's' : ''}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {sale.type === 'SOS' ? (
                              <span className="text-gray-400 italic">Pas d'échéance</span>
                            ) : expiryDate ? (
                              format(expiryDate, 'dd/MM/yyyy', { locale: fr })
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            {sale.type === 'SOS' ? (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                Pas d'échéance
                              </span>
                            ) : expired ? (
                              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Expiré
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                Valide
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEdit(sale)}
                                className="text-brand-blue hover:text-brand-blue/80"
                              >
                                <Pencil className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => sale.id && handleDelete(sale.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {sales.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">Aucune vente de complément enregistrée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplementAlimentaireTab;