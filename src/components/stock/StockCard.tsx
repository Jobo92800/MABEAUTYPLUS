import React, { useState } from 'react';
import { Minus, Plus, Settings } from 'lucide-react';
import type { StockLevelWithProduct, StockStatus } from '../../types/stock';
import { getStockStatus } from '../../services/stock';

interface StockCardProps {
  level: StockLevelWithProduct;
  onIncrement: (productId: string, delta: number) => void;
  onOpenDetail: (level: StockLevelWithProduct) => void;
}

const STATUS_STYLES: Record<StockStatus, { card: string; qty: string; badge: string; badgeText: string }> = {
  danger: {
    card: 'border-red-300 bg-red-50',
    qty: 'text-red-600',
    badge: 'bg-red-100 text-red-700',
    badgeText: 'Critique',
  },
  warning: {
    card: 'border-amber-300 bg-amber-50',
    qty: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    badgeText: 'Attention',
  },
  normal: {
    card: 'border-gray-200 bg-white',
    qty: 'text-gray-900',
    badge: 'bg-green-100 text-green-700',
    badgeText: 'Normal',
  },
};

const StockCard: React.FC<StockCardProps> = ({ level, onIncrement, onOpenDetail }) => {
  const [loading, setLoading] = useState(false);
  const status = getStockStatus(level);
  const styles = STATUS_STYLES[status];

  const handleDelta = async (delta: number) => {
    if (loading) return;
    setLoading(true);
    try {
      await onIncrement(level.product_id, delta);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md flex flex-col ${styles.card}`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${styles.badge}`}>
            {styles.badgeText}
          </span>
          <button
            onClick={() => onOpenDetail(level)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/60 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <h3 className="font-semibold text-gray-800 leading-snug text-sm">{level.product.name}</h3>
        <span className="text-xs text-gray-500">{level.product.unit}</span>
      </div>

      <div className={`text-4xl font-bold text-center my-3 ${styles.qty}`}>
        {level.quantity}
      </div>

      <div className="flex items-center justify-between gap-2 mt-2">
        <button
          onClick={() => handleDelta(-1)}
          disabled={loading || level.quantity <= 0}
          className="flex-1 flex items-center justify-center h-9 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleDelta(1)}
          disabled={loading}
          className="flex-1 flex items-center justify-center h-9 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-200 hover:text-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-400 text-center">
        Alerte: {level.alert_threshold} | Danger: {level.danger_threshold}
      </div>
    </div>
  );
};

export default StockCard;
