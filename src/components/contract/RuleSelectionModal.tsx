import React from 'react';
import { X, Ligature as FileSignature, ChevronRight } from 'lucide-react';
import type { PaymentCategoryInfo } from '../../services/contractService';

const CARE_SERVICE_NAMES: Record<string, string> = {
  'luxo-pdp': 'Luxo - PDP',
  'luxo-relax': 'Luxo - Relax',
  'luxo-meno': 'Luxo - Méno',
  'ishape': 'I-Shape',
  'cavitalyse': 'Cavitalyse',
  'adipologie': 'Adipologie',
  'presso': 'Presso',
  'meso-corps': 'Méso Corps',
  'meso-visage': 'Méso Visage',
  'advance-lift': 'Advance Lift',
  'psio': 'Psio',
  'guide': 'Guide',
  'tenue': 'Tenue',
};

interface RuleSelectionModalProps {
  clientName: string;
  categories: PaymentCategoryInfo[];
  onSelect: (index: number) => void;
  onClose: () => void;
}

const RuleSelectionModal: React.FC<RuleSelectionModalProps> = ({
  clientName,
  categories,
  onSelect,
  onClose,
}) => {
  const formatAmount = (amount: string) => {
    const n = parseFloat(amount);
    if (isNaN(n)) return '';
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  };

  const getCareLabel = (cs: { id: string; name: string; sessions: string }) => {
    const label = CARE_SERVICE_NAMES[cs.id] ?? cs.name ?? cs.id;
    return `${label} · ${cs.sessions} séance${parseInt(cs.sessions, 10) > 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Sélectionner un règlement</h2>
            <p className="text-sm text-gray-500 mt-0.5">{clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Categories list */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {categories.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <FileSignature className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Aucun règlement trouvé pour ce client.</p>
            </div>
          ) : (
            categories.map((cat) => {
              const ordinals = ['1er', '2ème', '3ème', '4ème', '5ème', '6ème'];
              const label = ordinals[cat.index] ?? `${cat.index + 1}ème`;
              const amount = formatAmount(cat.totalAmount);

              return (
                <button
                  key={cat.index}
                  onClick={() => onSelect(cat.index)}
                  className="w-full text-left group flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-brand-blue hover:bg-blue-50/40 transition-all duration-150"
                >
                  {/* Index badge */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 group-hover:bg-brand-blue group-hover:text-white text-gray-600 flex items-center justify-center font-bold text-sm transition-colors">
                    {cat.index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-gray-900">
                        Règlement {label}
                      </span>
                      {amount && (
                        <span className="text-sm font-bold text-brand-blue flex-shrink-0">
                          {amount}
                        </span>
                      )}
                    </div>

                    {cat.careServices.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {cat.careServices.map((cs, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors"
                          >
                            {getCareLabel(cs)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Aucun soin renseigné</p>
                    )}
                  </div>

                  <ChevronRight className="flex-shrink-0 h-4 w-4 text-gray-300 group-hover:text-brand-blue mt-1 transition-colors" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RuleSelectionModal;
