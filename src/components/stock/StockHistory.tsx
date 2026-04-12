import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowUp, ArrowDown, Clock } from 'lucide-react';
import type { StockMovement } from '../../types/stock';

interface StockHistoryProps {
  movements: StockMovement[];
  loading: boolean;
}

const StockHistory: React.FC<StockHistoryProps> = ({ movements, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue" />
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">Aucun mouvement enregistré</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <div className="-mx-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Quantité</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {movements.map((mv) => (
              <tr key={mv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                  {format(new Date(mv.moved_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">
                  {mv.product?.name ?? '—'}
                </td>
                <td className="px-4 py-3">
                  {mv.movement_type === 'entry' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                      <ArrowUp className="h-3 w-3" /> Entrée
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-full">
                      <ArrowDown className="h-3 w-3" /> Sortie
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                  {mv.movement_type === 'entry' ? '+' : '-'}{mv.quantity}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {mv.note || <span className="text-gray-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockHistory;
