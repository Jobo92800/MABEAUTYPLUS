import React, { useState } from 'react';
import { X, Plus, Minus, Save } from 'lucide-react';
import type { StockLevelWithProduct } from '../../types/stock';
import { updateStockQuantity, setStockLevel } from '../../services/stock';
import { toast } from 'react-hot-toast';

interface StockDetailModalProps {
  level: StockLevelWithProduct;
  onClose: () => void;
  onUpdated: () => void;
}

const StockDetailModal: React.FC<StockDetailModalProps> = ({ level, onClose, onUpdated }) => {
  const [delta, setDelta] = useState(1);
  const [note, setNote] = useState('');
  const [alertThreshold, setAlertThreshold] = useState(level.alert_threshold);
  const [dangerThreshold, setDangerThreshold] = useState(level.danger_threshold);
  const [manualQty, setManualQty] = useState(level.quantity);
  const [tab, setTab] = useState<'movement' | 'settings'>('movement');
  const [loading, setLoading] = useState(false);

  const handleMovement = async (type: 'entry' | 'exit') => {
    if (delta <= 0) return;
    setLoading(true);
    try {
      const actualDelta = type === 'entry' ? delta : -delta;
      await updateStockQuantity(level.product_id, level.center_id, actualDelta, note || undefined);
      toast.success(type === 'entry' ? `+${delta} ajouté` : `-${delta} retiré`);
      onUpdated();
      onClose();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await setStockLevel(
        level.product_id,
        level.center_id,
        manualQty,
        alertThreshold,
        dangerThreshold
      );
      toast.success('Paramètres mis à jour');
      onUpdated();
      onClose();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">{level.product.name}</h2>
            <p className="text-sm text-gray-500">Stock actuel: <span className="font-bold text-gray-800">{level.quantity} {level.product.unit}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab('movement')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'movement' ? 'text-brand-pink border-b-2 border-brand-pink' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Mouvement
          </button>
          <button
            onClick={() => setTab('settings')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'settings' ? 'text-brand-pink border-b-2 border-brand-pink' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Paramètres
          </button>
        </div>

        <div className="p-6">
          {tab === 'movement' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDelta(Math.max(1, delta - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={delta}
                    onChange={(e) => setDelta(Math.max(1, parseInt(e.target.value) || 1))}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="flex-1 text-center text-2xl font-bold border border-gray-200 rounded-lg py-2 focus:outline-none focus:border-brand-pink"
                  />
                  <button
                    onClick={() => setDelta(delta + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (optionnel)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Raison du mouvement..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleMovement('exit')}
                  disabled={loading || level.quantity <= 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                  Sortie
                </button>
                <button
                  onClick={() => handleMovement('entry')}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 border border-green-200 text-green-600 hover:bg-green-100 font-medium transition-colors disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                  Entrée
                </button>
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock initial / réinitialisation</label>
                <input
                  type="number"
                  min={0}
                  value={manualQty}
                  onChange={(e) => setManualQty(parseInt(e.target.value) || 0)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'alerte (orange)</label>
                <input
                  type="number"
                  min={0}
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(parseInt(e.target.value) || 0)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil de danger (rouge)</label>
                <input
                  type="number"
                  min={0}
                  value={dangerThreshold}
                  onChange={(e) => setDangerThreshold(parseInt(e.target.value) || 0)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
                />
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-blue text-white font-medium hover:bg-brand-blue/90 transition-colors disabled:opacity-40"
              >
                <Save className="h-4 w-4" />
                Enregistrer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDetailModal;
