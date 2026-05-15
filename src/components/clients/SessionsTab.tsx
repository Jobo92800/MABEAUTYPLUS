import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, X, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getMeasurements, addMeasurement } from '../../services/database';
import { getTotalTreatmentSessions, updateTotalTreatmentSessions, getCurrentCureNumber, setCurrentCureNumber } from '../../services/database/operations/totalSessions';
import type { Measurement } from '../../types/measurements';
import SessionRow from '../sessions/SessionRow';
import { toast } from 'react-hot-toast';

interface SessionsTabProps {
  clientId: string;
  centerId: string;
}

const CURE_COLORS: Record<number, { bg: string; border: string; badge: string; badgeText: string; dot: string; hex: string }> = {
  1: { bg: 'bg-blue-50',   border: 'border-l-blue-400',   badge: 'bg-blue-100 text-blue-700',   badgeText: 'Cure 1', dot: 'bg-blue-400',   hex: '#60a5fa' },
  2: { bg: 'bg-green-50',  border: 'border-l-green-400',  badge: 'bg-green-100 text-green-700', badgeText: 'Cure 2', dot: 'bg-green-400',  hex: '#4ade80' },
  3: { bg: 'bg-amber-50',  border: 'border-l-amber-400',  badge: 'bg-amber-100 text-amber-700', badgeText: 'Cure 3', dot: 'bg-amber-400',  hex: '#fbbf24' },
  4: { bg: 'bg-rose-50',   border: 'border-l-rose-400',   badge: 'bg-rose-100 text-rose-700',   badgeText: 'Cure 4', dot: 'bg-rose-400',   hex: '#fb7185' },
  5: { bg: 'bg-teal-50',   border: 'border-l-teal-400',   badge: 'bg-teal-100 text-teal-700',   badgeText: 'Cure 5', dot: 'bg-teal-400',   hex: '#2dd4bf' },
  6: { bg: 'bg-orange-50', border: 'border-l-orange-400', badge: 'bg-orange-100 text-orange-700', badgeText: 'Cure 6', dot: 'bg-orange-400', hex: '#fb923c' },
};

const getCureColor = (cureNumber: number) => CURE_COLORS[cureNumber] ?? CURE_COLORS[1];

const SessionsTab: React.FC<SessionsTabProps> = ({ clientId, centerId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newWeight, setNewWeight] = useState('');
  const [newComment, setNewComment] = useState('');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [currentCure, setCurrentCure] = useState<number>(1);
  const [showNewCureConfirm, setShowNewCureConfirm] = useState(false);
  const [collapsedCures, setCollapsedCures] = useState<Set<number>>(new Set());

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [measurementsData, totalSessionsData, cureNumber] = await Promise.all([
        getMeasurements(clientId, centerId),
        getTotalTreatmentSessions(clientId, 'luxotherapy'),
        getCurrentCureNumber(clientId, 'luxotherapy'),
      ]);
      setMeasurements(measurementsData);
      setTotalSessions(totalSessionsData || 0);
      setCurrentCure(cureNumber);
    } catch {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId, centerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newWeight) return;

    try {
      await addMeasurement(clientId, centerId, {
        date: newDate,
        weight: parseFloat(newWeight),
        comment: newComment,
        photoTaken,
        cureNumber: currentCure,
      });

      const newTotalSessions = Math.max(0, totalSessions - 1);
      await updateTotalTreatmentSessions(clientId, 'luxotherapy', newTotalSessions);
      setTotalSessions(newTotalSessions);

      setShowAddForm(false);
      setNewDate(format(new Date(), 'yyyy-MM-dd'));
      setNewWeight('');
      setNewComment('');
      setPhotoTaken(false);
      await fetchData();
      toast.success('Séance ajoutée');
    } catch {
      toast.error("Erreur lors de l'ajout de la séance");
    }
  };

  const handleTotalSessionsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    try {
      await updateTotalTreatmentSessions(clientId, 'luxotherapy', value);
      setTotalSessions(value);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleNewCure = async () => {
    const nextCure = currentCure + 1;
    try {
      await setCurrentCureNumber(clientId, 'luxotherapy', nextCure);
      setCurrentCure(nextCure);
      setShowNewCureConfirm(false);
      toast.success(`Cure ${nextCure} démarrée`);
    } catch {
      toast.error('Erreur lors du démarrage de la nouvelle cure');
    }
  };

  const toggleCureCollapse = (cureNum: number) => {
    setCollapsedCures(prev => {
      const next = new Set(prev);
      if (next.has(cureNum)) next.delete(cureNum);
      else next.add(cureNum);
      return next;
    });
  };

  // Group measurements by cure
  const sorted = [...measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const cureGroups = sorted.reduce<Record<number, Measurement[]>>((acc, m) => {
    const cn = m.cureNumber ?? 1;
    if (!acc[cn]) acc[cn] = [];
    acc[cn].push(m);
    return acc;
  }, {});
  const cureNumbers = Object.keys(cureGroups).map(Number).sort((a, b) => b - a);

  // Chart data: one line per cure, keyed by ISO date for correct sorting
  const chartDataByCure: Record<number, { isoDate: string; date: string; weight: number }[]> = {};
  Object.entries(cureGroups).forEach(([cn, ms]) => {
    chartDataByCure[Number(cn)] = [...ms]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(m => ({ isoDate: m.date, date: format(new Date(m.date), 'dd/MM'), weight: m.weight }));
  });

  // Merge all dates sorted chronologically
  const allIsoDates = [...new Set(Object.values(chartDataByCure).flatMap(d => d.map(p => p.isoDate)))]
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const chartData = allIsoDates.map(isoDate => {
    const label = format(new Date(isoDate), 'dd/MM');
    const point: Record<string, string | number> = { date: label };
    Object.entries(chartDataByCure).forEach(([cn, data]) => {
      const found = data.find(p => p.isoDate === isoDate);
      if (found) point[`cure${cn}`] = found.weight;
    });
    return point;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  const totalWeightLoss = measurements.length >= 2
    ? (() => {
        const byDate = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return byDate[byDate.length - 1].weight - byDate[0].weight;
      })()
    : null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {totalWeightLoss !== null && (
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-5">
            <p className="text-sm text-gray-500 mb-1">Perte totale depuis début</p>
            <div className={`text-2xl font-bold ${totalWeightLoss < 0 ? 'text-green-600' : 'text-red-500'}`}>
              {totalWeightLoss < 0 ? '' : '+'}{totalWeightLoss.toFixed(1)} kg
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Séances restantes</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={totalSessions}
              onChange={handleTotalSessionsChange}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-20 text-2xl font-bold border-0 border-b-2 border-gray-200 focus:border-brand-blue focus:outline-none bg-transparent"
              min="0"
            />
            <span className="text-sm text-gray-400">séances</span>
          </div>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Cure en cours</p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getCureColor(currentCure).badge}`}>
                {getCureColor(currentCure).badgeText}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowNewCureConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Nouvelle cure
          </button>
        </div>
      </div>

      {/* New Cure Confirmation */}
      {showNewCureConfirm && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-amber-800">Démarrer la cure {currentCure + 1} ?</p>
            <p className="text-sm text-amber-600 mt-0.5">Les nouvelles séances seront comptées dans la cure {currentCure + 1} avec une nouvelle couleur.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowNewCureConfirm(false)}
              className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 text-sm hover:bg-amber-100 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleNewCure}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              Confirmer
            </button>
          </div>
        </div>
      )}

      {/* Sessions Table */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Suivi des séances</h2>
              <p className="text-sm text-gray-500 mt-0.5">Liste des mesures par cure</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex items-center rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une séance
            </button>
          </div>

          {showAddForm && (
            <div className={`mb-5 p-4 rounded-xl border-l-4 ${getCureColor(currentCure).border} ${getCureColor(currentCure).bg}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900">Nouvelle séance</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCureColor(currentCure).badge}`}>
                    {getCureColor(currentCure).badgeText}
                  </span>
                </div>
                <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="photoTaken"
                      checked={photoTaken}
                      onChange={(e) => setPhotoTaken(e.target.checked)}
                      className="h-4 w-4 text-brand-blue focus:ring-brand-pink border-gray-300 rounded"
                    />
                    <label htmlFor="photoTaken" className="text-sm text-gray-900">Photo prise</label>
                  </div>
                  <button
                    type="submit"
                    className="rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grouped by cure */}
          {cureNumbers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucune séance enregistrée</p>
          ) : (
            <div className="space-y-4">
              {cureNumbers.map((cureNum) => {
                const color = getCureColor(cureNum);
                const cureMeasurements = cureGroups[cureNum];
                const isCollapsed = collapsedCures.has(cureNum);
                const cureByDate = [...cureMeasurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                const cureWeightLoss = cureByDate.length >= 2
                  ? cureByDate[cureByDate.length - 1].weight - cureByDate[0].weight
                  : null;

                return (
                  <div key={cureNum} className={`rounded-xl border border-gray-100 overflow-hidden`}>
                    {/* Cure header */}
                    <button
                      onClick={() => toggleCureCollapse(cureNum)}
                      className={`w-full flex items-center justify-between px-4 py-3 ${color.bg} border-l-4 ${color.border} hover:brightness-95 transition-all`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color.badge}`}>
                          {color.badgeText}
                        </span>
                        <span className="text-sm text-gray-600">{cureMeasurements.length} séance{cureMeasurements.length > 1 ? 's' : ''}</span>
                        {cureWeightLoss !== null && (
                          <span className={`text-sm font-medium ${cureWeightLoss < 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {cureWeightLoss < 0 ? '' : '+'}{cureWeightLoss.toFixed(1)} kg
                          </span>
                        )}
                        {cureNum === currentCure && (
                          <span className="text-xs text-gray-400 italic">en cours</span>
                        )}
                      </div>
                      {isCollapsed ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronUp className="h-4 w-4 text-gray-400" />}
                    </button>

                    {!isCollapsed && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">N°</th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Poids (kg)</th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Variation</th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Commentaire</th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Photo</th>
                              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {cureMeasurements.map((measurement, index, arr) => {
                              const nextMeasurement = arr[index + 1];
                              const variation = nextMeasurement
                                ? measurement.weight - nextMeasurement.weight
                                : null;
                              return (
                                <tr key={measurement.id} className={`hover:${color.bg} transition-colors`}>
                                  <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900">
                                    {arr.length - index}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600">
                                    {format(new Date(measurement.date), 'dd MMMM yyyy', { locale: fr })}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-gray-900">
                                    {measurement.weight.toFixed(1)}
                                  </td>
                                  <td className={`whitespace-nowrap px-3 py-3 text-sm font-medium ${
                                    variation === null ? 'text-gray-400' :
                                    variation > 0 ? 'text-red-500' : 'text-green-600'
                                  }`}>
                                    {variation === null ? '—' : (variation > 0 ? '+' : '') + variation.toFixed(1)}
                                  </td>
                                  <td className="px-3 py-3 text-sm text-gray-500 max-w-[200px] truncate">
                                    {measurement.comment || '—'}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-3 text-sm text-center">
                                    {measurement.photoTaken
                                      ? <span className="text-green-600 font-bold">✓</span>
                                      : <span className="text-gray-300">✗</span>}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-3 text-sm text-right">
                                    <SessionRow
                                      session={measurement}
                                      onUpdate={fetchData}
                                      previousWeight={index < arr.length - 1 ? arr[index + 1].weight : undefined}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Weight Evolution Chart */}
      {measurements.length > 0 && (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Évolution du poids</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)} kg`]} />
                <Legend formatter={(value) => {
                  const cn = parseInt(value.replace('cure', ''));
                  return getCureColor(cn).badgeText;
                }} />
                {cureNumbers.map((cn) => (
                  <Line
                    key={cn}
                    type="monotone"
                    dataKey={`cure${cn}`}
                    stroke={getCureColor(cn).hex}
                    strokeWidth={2}
                    dot={{ fill: getCureColor(cn).hex, r: 4 }}
                    connectNulls={false}
                    name={`cure${cn}`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsTab;
