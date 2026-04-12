import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, AlertTriangle, Clock, RefreshCw, Search, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getStockLevels,
  getStockMovements,
  updateStockQuantity,
  getStockStatus,
} from '../services/stock';
import type { StockLevelWithProduct, StockMovement, StockCategory } from '../types/stock';
import { CATEGORY_LABELS, CATEGORY_COLORS, CENTER_SPECIFIC_CATEGORIES, ALL_CENTERS } from '../types/stock';
import StockCard from '../components/stock/StockCard';
import StockDetailModal from '../components/stock/StockDetailModal';
import StockHistory from '../components/stock/StockHistory';

type TabKey = 'stock' | 'history';

const AVAILABLE_CATEGORIES: StockCategory[] = ['complement', 'vetement', 'mesojet', 'kos', 'advance_beauty'];

const StockPage: React.FC = () => {
  const { centerId } = useParams<{ centerId: string }>();
  const [levels, setLevels] = useState<StockLevelWithProduct[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>('stock');
  const [selectedCategory, setSelectedCategory] = useState<StockCategory>('complement');
  const [detailLevel, setDetailLevel] = useState<StockLevelWithProduct | null>(null);
  const [search, setSearch] = useState('');

  const center = ALL_CENTERS.find((c) => c.id === centerId);

  const availableCategories = AVAILABLE_CATEGORIES.filter((cat) => {
    const specific = CENTER_SPECIFIC_CATEGORIES[centerId ?? ''];
    if (cat === 'complement' || cat === 'vetement') return true;
    if (!specific) return false;
    return specific.includes(cat);
  });

  const fetchLevels = useCallback(async () => {
    if (!centerId) return;
    try {
      setLoading(true);
      const data = await getStockLevels(centerId);
      setLevels(data);
    } catch {
      toast.error('Erreur lors du chargement des stocks');
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  const fetchHistory = useCallback(async () => {
    if (!centerId) return;
    try {
      setHistoryLoading(true);
      const data = await getStockMovements(centerId, 200);
      setMovements(data);
    } catch {
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setHistoryLoading(false);
    }
  }, [centerId]);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  useEffect(() => {
    if (tab === 'history') {
      fetchHistory();
    }
  }, [tab, fetchHistory]);

  useEffect(() => {
    if (!availableCategories.includes(selectedCategory)) {
      setSelectedCategory(availableCategories[0] ?? 'complement');
    }
  }, [centerId]);

  const handleIncrement = async (productId: string, delta: number) => {
    if (!centerId) return;
    try {
      await updateStockQuantity(productId, centerId, delta);
      await fetchLevels();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filteredLevels = levels.filter((l) => {
    if (l.product.category !== selectedCategory) return false;
    if (search && !l.product.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const alertCount = levels.filter((l) => getStockStatus(l) !== 'normal').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link
                to={centerId ? `/centers/${centerId}/clients` : '/'}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span className="text-sm">Retour</span>
              </Link>
              <div className="h-5 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-brand-pink" />
                <h1 className="font-semibold text-gray-900">Gestion des stocks</h1>
              </div>
              {center && (
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-blue/10 text-brand-blue">
                  {center.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {alertCount > 0 && (
                <div className="flex items-center gap-1.5 text-amber-600 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline">{alertCount} alerte{alertCount > 1 ? 's' : ''}</span>
                  <span className="sm:hidden">{alertCount}</span>
                </div>
              )}
              <button
                onClick={() => { fetchLevels(); if (tab === 'history') fetchHistory(); }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
          <button
            onClick={() => setTab('stock')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === 'stock'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Package className="h-4 w-4" />
            Stock
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === 'history'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Clock className="h-4 w-4" />
            Historique
          </button>
        </div>

        {tab === 'stock' && (
          <>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => {
                const colors = CATEGORY_COLORS[cat];
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                      isSelected
                        ? `${colors.bg} ${colors.text} ${colors.border} shadow-sm`
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-pink bg-white shadow-sm"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue" />
              </div>
            ) : filteredLevels.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Aucun produit trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredLevels.map((level) => (
                  <StockCard
                    key={level.id}
                    level={level}
                    onIncrement={handleIncrement}
                    onOpenDetail={setDetailLevel}
                  />
                ))}
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Légende</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-600">Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-gray-600">Alerte (sous le seuil)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-gray-600">Critique (sous le danger)</span>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'history' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Historique des mouvements</h2>
              <p className="text-sm text-gray-500 mt-0.5">Les 200 derniers mouvements</p>
            </div>
            <div className="p-4">
              <StockHistory movements={movements} loading={historyLoading} />
            </div>
          </div>
        )}
      </div>

      {detailLevel && (
        <StockDetailModal
          level={detailLevel}
          onClose={() => setDetailLevel(null)}
          onUpdated={fetchLevels}
        />
      )}
    </div>
  );
};

export default StockPage;
