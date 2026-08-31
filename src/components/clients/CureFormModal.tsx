import React, { useMemo, useState } from 'react';
import { X, Sparkles, Plus, Minus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { saveCureData } from '../../services/database';
import type { ClientCureData } from '../../types/client';

interface CareService {
  id: string;
  name: string;
  defaultPrice: number;
}

const CARE_SERVICES: CareService[] = [
  { id: 'luxo-pdp', name: 'Luxothérapie Perte de Poids', defaultPrice: 59 },
  { id: 'luxo-relax', name: 'Luxothérapie Relaxation', defaultPrice: 59 },
  { id: 'luxo-meno', name: 'Luxothérapie Ménopause', defaultPrice: 59 },
  { id: 'ishape', name: 'I-Shape', defaultPrice: 90 },
  { id: 'cavitalyse', name: 'Cavitalyse', defaultPrice: 90 },
  { id: 'adipologie', name: 'Adipologie', defaultPrice: 90 },
  { id: 'presso', name: 'Pressodynamie', defaultPrice: 60 },
  { id: 'meso-corps', name: 'Mésojet Corps', defaultPrice: 120 },
  { id: 'meso-visage', name: 'Mésojet Visage', defaultPrice: 120 },
  { id: 'advance-lift', name: 'Advance Lift', defaultPrice: 120 },
  { id: 'psio', name: 'PSIO', defaultPrice: 40 },
  { id: 'guide', name: 'Guide rééquilibrage', defaultPrice: 29 },
  { id: 'tenue', name: 'Tenue I-Shape', defaultPrice: 60 },
];

interface LineItem {
  careServiceId: string;
  sessions: number;
  pricePerSession: number;
}

interface CureFormModalProps {
  clientId?: string;
  centerId?: string;
  clientName?: string;
  onClose: () => void;
  onSaved?: () => void;
  onCureData?: (data: ClientCureData) => void;
}

const CureFormModal: React.FC<CureFormModalProps> = ({
  clientId,
  clientName,
  onClose,
  onSaved,
  onCureData,
}) => {
  const [lines, setLines] = useState<LineItem[]>([]);
  const [installmentCount, setInstallmentCount] = useState(4);
  const [saving, setSaving] = useState(false);

  const availableServices = useMemo(
    () => CARE_SERVICES.filter(s => !lines.some(l => l.careServiceId === s.id)),
    [lines],
  );

  const addLine = (id: string) => {
    const service = CARE_SERVICES.find(s => s.id === id);
    if (!service) return;
    setLines([...lines, { careServiceId: id, sessions: 1, pricePerSession: service.defaultPrice }]);
  };

  const updateLine = (index: number, patch: Partial<LineItem>) => {
    setLines(lines.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const total = useMemo(
    () => lines.reduce((sum, l) => sum + l.sessions * l.pricePerSession, 0),
    [lines],
  );

  const installments = useMemo(() => {
    if (installmentCount <= 0 || total <= 0) return [];
    const base = Math.floor(total / installmentCount);
    const remainder = total - base * installmentCount;
    return Array.from({ length: installmentCount }, (_, i) => ({
      index: i + 1,
      amount: base + (i === 0 ? remainder : 0),
    }));
  }, [total, installmentCount]);

  const canSave = lines.length > 0 && total > 0 && lines.every(l => l.sessions > 0 && l.pricePerSession >= 0);

  const buildCureData = (): ClientCureData => ({
    totalPrice: total,
    installmentCount,
    installments,
    savedAt: new Date().toISOString(),
    treatments: lines.map(l => {
      const service = CARE_SERVICES.find(s => s.id === l.careServiceId)!;
      return {
        name: service.name,
        sessions: l.sessions,
        pricePerSession: l.pricePerSession,
        careServiceId: l.careServiceId,
      };
    }),
    careServiceIds: lines.map(l => l.careServiceId),
  });

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    const cureData = buildCureData();
    try {
      if (clientId) {
        await saveCureData(clientId, cureData);
        toast.success('Cure enregistrée sur la fiche client');
        onSaved?.();
      } else {
        onCureData?.(cureData);
        toast.success('Cure préparée. Elle sera enregistrée à la création du client.');
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'enregistrement de la cure");
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' €';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-pink" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">Formulaire Cure</h2>
              {clientName && <p className="text-xs text-gray-500">{clientName}</p>}
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-white hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Ajouter un soin</h3>
            <div className="flex flex-wrap gap-2">
              {availableServices.map(s => (
                <button
                  key={s.id}
                  onClick={() => addLine(s.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-brand-blue bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {s.name}
                </button>
              ))}
              {availableServices.length === 0 && (
                <p className="text-xs text-gray-400">Tous les soins ont été ajoutés.</p>
              )}
            </div>
          </section>

          {lines.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Soins sélectionnés</h3>
              <div className="space-y-2">
                {lines.map((line, i) => {
                  const service = CARE_SERVICES.find(s => s.id === line.careServiceId)!;
                  const subtotal = line.sessions * line.pricePerSession;
                  return (
                    <div key={line.careServiceId} className="grid grid-cols-12 gap-3 items-center bg-gray-50 rounded-xl px-3 py-3">
                      <div className="col-span-12 sm:col-span-5">
                        <p className="text-sm font-medium text-gray-800">{service.name}</p>
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <label className="text-[10px] uppercase tracking-wide text-gray-400">Séances</label>
                        <input
                          type="number"
                          min={1}
                          value={line.sessions}
                          onChange={e => updateLine(i, { sessions: Math.max(1, parseInt(e.target.value) || 0) })}
                          className="mt-0.5 w-full rounded-lg border border-gray-200 px-2 py-1 text-sm focus:border-brand-pink focus:ring-brand-pink"
                        />
                      </div>
                      <div className="col-span-5 sm:col-span-2">
                        <label className="text-[10px] uppercase tracking-wide text-gray-400">Prix / séance</label>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={line.pricePerSession}
                          onChange={e => updateLine(i, { pricePerSession: Math.max(0, parseFloat(e.target.value) || 0) })}
                          className="mt-0.5 w-full rounded-lg border border-gray-200 px-2 py-1 text-sm focus:border-brand-pink focus:ring-brand-pink"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-2 text-right">
                        <label className="text-[10px] uppercase tracking-wide text-gray-400">Sous-total</label>
                        <p className="text-sm font-semibold text-gray-800">{fmt(subtotal)}</p>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => removeLine(i)}
                          className="rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          aria-label="Retirer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-blue-50 ring-1 ring-blue-100 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-blue-500 font-semibold">Total cure</p>
              <p className="text-2xl font-bold text-brand-blue">{fmt(total)}</p>
            </div>
            <div className="rounded-xl bg-white ring-1 ring-gray-200 px-4 py-3">
              <label className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Nombre d'échéances</label>
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={() => setInstallmentCount(Math.max(1, installmentCount - 1))}
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
                  aria-label="Réduire"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-lg font-semibold text-gray-800">{installmentCount}</span>
                <button
                  onClick={() => setInstallmentCount(Math.min(12, installmentCount + 1))}
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
                  aria-label="Augmenter"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          {installments.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Échéancier</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {installments.map(inst => (
                  <div key={inst.index} className="rounded-xl bg-pink-50 ring-1 ring-pink-100 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-pink-500 font-semibold">
                      Échéance {inst.index}
                    </p>
                    <p className="text-base font-bold text-brand-pink">{fmt(inst.amount)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-brand-pink hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Enregistrement...' : clientId ? 'Enregistrer la cure' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CureFormModal;
