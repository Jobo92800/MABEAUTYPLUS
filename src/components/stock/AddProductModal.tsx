import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { addCustomProduct } from '../../services/stock';
import type { StockCategory } from '../../types/stock';
import { CATEGORY_LABELS } from '../../types/stock';

interface AddProductModalProps {
  centerId: string;
  selectedCategory: StockCategory;
  availableCategories: StockCategory[];
  onClose: () => void;
  onAdded: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  centerId,
  selectedCategory,
  availableCategories,
  onClose,
  onAdded,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<StockCategory>(selectedCategory);
  const [unit, setUnit] = useState('pièce');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await addCustomProduct(name.trim().toUpperCase(), category, unit.trim() || 'pièce', centerId);
      toast.success('Produit ajouté avec succès');
      onAdded();
      onClose();
    } catch {
      toast.error("Erreur lors de l'ajout du produit");
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
            <h2 className="font-semibold text-gray-900">Ajouter un produit</h2>
            <p className="text-sm text-gray-500">Nouveau produit dans le stock</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du produit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: NOUVEAU PRODUIT"
              autoFocus
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-pink transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as StockCategory)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-pink bg-white transition-colors"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
            <div className="flex gap-2">
              {['pièce', 'boîte', 'flacon', 'kg', 'L'].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                    unit === u
                      ? 'bg-brand-pink/10 border-brand-pink text-brand-pink font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {u}
                </button>
              ))}
              <input
                type="text"
                value={['pièce', 'boîte', 'flacon', 'kg', 'L'].includes(unit) ? '' : unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Autre..."
                className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-pink transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-pink text-white text-sm font-medium hover:bg-brand-pink/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
