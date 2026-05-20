import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, X, Pencil, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getSessions, addSession, deleteSession, updateSession, getTotalTreatmentSessions, updateTotalTreatmentSessions } from '../../services/database';
import { getCurrentCureNumber, setCurrentCureNumber } from '../../services/database/operations/totalSessions';
import { saveIShapeTenuSize, getIShapeTenuSize } from '../../services/database/operations/client';
import type { Session } from '../../types/session';
import { toast } from 'react-hot-toast';

interface IShapeTabProps {
  clientId: string;
  centerId: string;
}

const CURE_COLORS: Record<number, { bg: string; border: string; badge: string; badgeText: string; hex: string }> = {
  1: { bg: 'bg-blue-50',   border: 'border-l-blue-400',   badge: 'bg-blue-100 text-blue-700',     badgeText: 'Cure 1', hex: '#60a5fa' },
  2: { bg: 'bg-green-50',  border: 'border-l-green-400',  badge: 'bg-green-100 text-green-700',   badgeText: 'Cure 2', hex: '#4ade80' },
  3: { bg: 'bg-amber-50',  border: 'border-l-amber-400',  badge: 'bg-amber-100 text-amber-700',   badgeText: 'Cure 3', hex: '#fbbf24' },
  4: { bg: 'bg-rose-50',   border: 'border-l-rose-400',   badge: 'bg-rose-100 text-rose-700',     badgeText: 'Cure 4', hex: '#fb7185' },
  5: { bg: 'bg-teal-50',   border: 'border-l-teal-400',   badge: 'bg-teal-100 text-teal-700',     badgeText: 'Cure 5', hex: '#2dd4bf' },
  6: { bg: 'bg-orange-50', border: 'border-l-orange-400', badge: 'bg-orange-100 text-orange-700', badgeText: 'Cure 6', hex: '#fb923c' },
};

const getCureColor = (n: number) => CURE_COLORS[n] ?? CURE_COLORS[1];

const emptyMeasurements = {
  arms: { right: '', left: '' },
  navel: '',
  hips: '',
  buttocks: '',
  thighs: { right: '', left: '' },
  calves: { right: '', left: '' }
};

const IShapeTab: React.FC<IShapeTabProps> = ({ clientId, centerId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [currentCure, setCurrentCure] = useState<number>(1);
  const [showNewCureConfirm, setShowNewCureConfirm] = useState(false);
  const [collapsedCures, setCollapsedCures] = useState<Set<number>>(new Set());
  const [tenuSize, setTenuSize] = useState<string>('');
  const [newSession, setNewSession] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    comment: '',
    photoTaken: false,
    weight: '',
    measurements: emptyMeasurements
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sessionsData, totalSessionsData, cureNumber, savedSize] = await Promise.all([
        getSessions(clientId, centerId, 'ishape'),
        getTotalTreatmentSessions(clientId, 'ishape'),
        getCurrentCureNumber(clientId, 'ishape'),
        getIShapeTenuSize(clientId),
      ]);

      const sorted = [...sessionsData].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const withNumbers = sorted.map((s, i) => ({ ...s, number: i + 1 }));
      setSessions(withNumbers);
      setTotalSessions(totalSessionsData);
      setCurrentCure(cureNumber);
      setTenuSize(savedSize);
    } catch {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId, centerId]);

  const handleTotalSessionsChange = async (value: number) => {
    try {
      await updateTotalTreatmentSessions(clientId, 'ishape', value);
      setTotalSessions(value);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleTenuSizeChange = async (size: string) => {
    const newSize = tenuSize === size ? '' : size;
    setTenuSize(newSize);
    try {
      await saveIShapeTenuSize(clientId, newSize);
    } catch {
      toast.error('Erreur lors de la sauvegarde de la taille');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedWeight = newSession.weight && !isNaN(parseFloat(newSession.weight)) ? parseFloat(newSession.weight) : null;
      if (editingSession) {
        const updated = { ...editingSession, ...newSession };
        if (parsedWeight !== null) updated.weight = parsedWeight;
        else delete updated.weight;
        await updateSession(updated);
        toast.success('Séance mise à jour');
      } else {
        const sessionData: Omit<import('../../types/session').Session, 'id'> = {
          clientId,
          centerId,
          type: 'ishape',
          date: newSession.date,
          comment: newSession.comment,
          photoTaken: newSession.photoTaken,
          measurements: newSession.measurements,
          number: 0,
          cureNumber: currentCure,
        };
        if (parsedWeight !== null) sessionData.weight = parsedWeight;
        await addSession(sessionData);

        const newTotal = Math.max(0, totalSessions - 1);
        await updateTotalTreatmentSessions(clientId, 'ishape', newTotal);
        setTotalSessions(newTotal);
        toast.success('Séance ajoutée');
      }

      await fetchData();
      setShowAddForm(false);
      setEditingSession(null);
      setNewSession({ date: format(new Date(), 'yyyy-MM-dd'), comment: '', photoTaken: false, weight: '', measurements: emptyMeasurements });
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setNewSession({
      date: session.date,
      comment: session.comment || '',
      photoTaken: session.photoTaken || false,
      weight: session.weight?.toString() || '',
      measurements: session.measurements || emptyMeasurements
    });
    setShowAddForm(true);
  };

  const handleDelete = async (sessionId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) return;
    try {
      await deleteSession(sessionId);
      toast.success('Séance supprimée');
      await fetchData();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleNewCure = async () => {
    const next = currentCure + 1;
    try {
      await setCurrentCureNumber(clientId, 'ishape', next);
      setCurrentCure(next);
      setShowNewCureConfirm(false);
      toast.success(`Cure ${next} démarrée`);
    } catch {
      toast.error('Erreur lors du démarrage de la nouvelle cure');
    }
  };

  const toggleCure = (n: number) => {
    setCollapsedCures(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n); else next.add(n);
      return next;
    });
  };

  const calculateTotalLost = (group: Session[]) => {
    if (group.length < 2) return null;
    const first = group[0];
    const last = group[group.length - 1];
    const diff = (a?: string, b?: string) => {
      const av = parseFloat(a ?? ''), bv = parseFloat(b ?? '');
      return isNaN(av) || isNaN(bv) ? 0 : av - bv;
    };
    return {
      armsRight: diff(first.measurements?.arms?.right, last.measurements?.arms?.right),
      armsLeft:  diff(first.measurements?.arms?.left,  last.measurements?.arms?.left),
      navel:     diff(first.measurements?.navel,     last.measurements?.navel),
      hips:      diff(first.measurements?.hips,      last.measurements?.hips),
      buttocks:  diff(first.measurements?.buttocks,  last.measurements?.buttocks),
      thighsRight: diff(first.measurements?.thighs?.right, last.measurements?.thighs?.right),
      thighsLeft:  diff(first.measurements?.thighs?.left,  last.measurements?.thighs?.left),
      calvesRight: diff(first.measurements?.calves?.right, last.measurements?.calves?.right),
      calvesLeft:  diff(first.measurements?.calves?.left,  last.measurements?.calves?.left),
    };
  };

  // Group by cure
  const cureGroups: Record<number, Session[]> = sessions.reduce((acc, s) => {
    const cn = s.cureNumber ?? 1;
    if (!acc[cn]) acc[cn] = [];
    acc[cn].push(s);
    return acc;
  }, {} as Record<number, Session[]>);
  const cureNumbers = Object.keys(cureGroups).map(Number).sort((a, b) => b - a);

  // Global totals (all sessions)
  const globalLost = calculateTotalLost(sessions);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Séances I-Shape restantes</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={totalSessions}
              onChange={(e) => handleTotalSessionsChange(parseInt(e.target.value) || 0)}
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
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getCureColor(currentCure).badge}`}>
              {getCureColor(currentCure).badgeText}
            </span>
          </div>
          <button
            onClick={() => setShowNewCureConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Nouvelle cure
          </button>
        </div>

        {/* Taille Tenue */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-3">Taille Tenue</p>
          <div className="flex gap-2">
            {['S', 'M', 'L', 'XL'].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleTenuSizeChange(size)}
                className={`
                  flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-150
                  ${tenuSize === size
                    ? 'bg-brand-blue border-brand-blue text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-brand-blue hover:text-brand-blue'
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* New Cure Confirmation */}
      {showNewCureConfirm && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-amber-800">Démarrer la cure {currentCure + 1} ?</p>
            <p className="text-sm text-amber-600 mt-0.5">Les nouvelles séances seront comptées dans la cure {currentCure + 1}.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setShowNewCureConfirm(false)} className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 text-sm hover:bg-amber-100 transition-colors">
              Annuler
            </button>
            <button onClick={handleNewCure} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors">
              Confirmer
            </button>
          </div>
        </div>
      )}

      {/* Global summary cards */}
      {globalLost && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Haut du corps',
              items: [
                { label: 'Tour de nombril', value: globalLost.navel },
                { label: 'Tour de hanches', value: globalLost.hips },
                { label: 'Tour de fesses', value: globalLost.buttocks },
              ]
            },
            {
              title: 'Bras',
              items: [
                { label: 'Bras droit', value: globalLost.armsRight },
                { label: 'Bras gauche', value: globalLost.armsLeft },
              ]
            },
            {
              title: 'Jambes',
              items: [
                { label: 'Cuisse droite', value: globalLost.thighsRight },
                { label: 'Cuisse gauche', value: globalLost.thighsLeft },
                { label: 'Mollet droit', value: globalLost.calvesRight },
                { label: 'Mollet gauche', value: globalLost.calvesLeft },
              ]
            }
          ].map(card => (
            <div key={card.title} className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">{card.title}</h3>
              <div className="space-y-1.5">
                {card.items.map(item => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className={`text-sm font-medium ${item.value > 0 ? 'text-green-600' : item.value < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {item.value > 0 ? '-' : item.value < 0 ? '+' : ''}{Math.abs(item.value).toFixed(1)} cm
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sessions grouped by cure */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Suivi des séances</h2>
              <p className="text-sm text-gray-500 mt-0.5">I-Shape par cure</p>
            </div>
            <button
              onClick={() => { setShowAddForm(true); setEditingSession(null); setNewSession({ date: format(new Date(), 'yyyy-MM-dd'), comment: '', photoTaken: false, weight: '', measurements: emptyMeasurements }); }}
              className="flex items-center rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une séance
            </button>
          </div>

          {showAddForm && (
            <div className={`mb-5 p-4 rounded-xl border-l-4 ${getCureColor(editingSession?.cureNumber ?? currentCure).border} ${getCureColor(editingSession?.cureNumber ?? currentCure).bg}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900">{editingSession ? 'Modifier la séance' : 'Nouvelle séance'}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCureColor(editingSession?.cureNumber ?? currentCure).badge}`}>
                    {getCureColor(editingSession?.cureNumber ?? currentCure).badgeText}
                  </span>
                </div>
                <button onClick={() => { setShowAddForm(false); setEditingSession(null); }} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" value={newSession.date} onChange={(e) => setNewSession({ ...newSession, date: e.target.value })} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
                    <input type="number" step="0.1" value={newSession.weight} onChange={(e) => setNewSession({ ...newSession, weight: e.target.value })} onWheel={(e) => e.currentTarget.blur()} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm" placeholder="Ex: 65.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                  <input type="text" value={newSession.comment} onChange={(e) => setNewSession({ ...newSession, comment: e.target.value })} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bras</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Droit</label>
                        <input type="text" value={newSession.measurements.arms.right} onChange={(e) => setNewSession({ ...newSession, measurements: { ...newSession.measurements, arms: { ...newSession.measurements.arms, right: e.target.value } } })} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Gauche</label>
                        <input type="text" value={newSession.measurements.arms.left} onChange={(e) => setNewSession({ ...newSession, measurements: { ...newSession.measurements, arms: { ...newSession.measurements.arms, left: e.target.value } } })} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombril</label>
                    <input type="text" value={newSession.measurements.navel} onChange={(e) => setNewSession({ ...newSession, measurements: { ...newSession.measurements, navel: e.target.value } })} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hanches</label>
                    <input type="text" value={newSession.measurements.hips} onChange={(e) => setNewSession({ ...newSession, measurements: { ...newSession.measurements, hips: e.target.value } })} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fesses</label>
                    <input type="text" value={newSession.measurements.buttocks} onChange={(e) => setNewSession({ ...newSession, measurements: { ...newSession.measurements, buttocks: e.target.value } })} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuisses</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Droite</label>
                        <input type="text" value={newSession.measurements.thighs.right} onChange={(e) => setNewSession({ ...newSession, measurements: { ...newSession.measurements, thighs: { ...newSession.measurements.thighs, right: e.target.value } } })} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Gauche</label>
                        <input type="text" value={newSession.measurements.thighs.left} onChange={(e) => setNewSession({ ...newSession, measurements: { ...newSession.measurements, thighs: { ...newSession.measurements.thighs, left: e.target.value } } })} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mollets</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Droit</label>
                        <input type="text" value={newSession.measurements.calves.right} onChange={(e) => setNewSession({ ...newSession, measurements: { ...newSession.measurements, calves: { ...newSession.measurements.calves, right: e.target.value } } })} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Gauche</label>
                        <input type="text" value={newSession.measurements.calves.left} onChange={(e) => setNewSession({ ...newSession, measurements: { ...newSession.measurements, calves: { ...newSession.measurements.calves, left: e.target.value } } })} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="photoTaken" checked={newSession.photoTaken} onChange={(e) => setNewSession({ ...newSession, photoTaken: e.target.checked })} className="h-4 w-4 text-brand-blue focus:ring-brand-pink border-gray-300 rounded" />
                    <label htmlFor="photoTaken" className="text-sm text-gray-900">Photo prise</label>
                  </div>
                  <button type="submit" className="rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200">
                    {editingSession ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {cureNumbers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucune séance enregistrée</p>
          ) : (
            <div className="space-y-4">
              {cureNumbers.map((cn) => {
                const color = getCureColor(cn);
                const group = cureGroups[cn];
                const reversed = [...group].reverse();
                const isCollapsed = collapsedCures.has(cn);
                const cureLost = calculateTotalLost(group);

                return (
                  <div key={cn} className="rounded-xl border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => toggleCure(cn)}
                      className={`w-full flex items-center justify-between px-4 py-3 ${color.bg} border-l-4 ${color.border} hover:brightness-95 transition-all`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color.badge}`}>
                          {color.badgeText}
                        </span>
                        <span className="text-sm text-gray-600">{group.length} séance{group.length > 1 ? 's' : ''}</span>
                        {cureLost && (
                          <span className="text-xs text-gray-500">
                            Nombril: <span className={cureLost.navel > 0 ? 'text-green-600' : cureLost.navel < 0 ? 'text-red-500' : 'text-gray-400'}>
                              {cureLost.navel > 0 ? '-' : cureLost.navel < 0 ? '+' : ''}{Math.abs(cureLost.navel).toFixed(1)} cm
                            </span>
                          </span>
                        )}
                        {cn === currentCure && <span className="text-xs text-gray-400 italic">en cours</span>}
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
                              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Commentaire</th>
                              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Photo</th>
                              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {reversed.map((session) => (
                              <tr key={session.id} className={`hover:${color.bg} transition-colors`}>
                                <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900">{session.number}</td>
                                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600">
                                  {format(new Date(session.date), 'dd MMMM yyyy', { locale: fr })}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600">
                                  {session.weight ? `${session.weight} kg` : '—'}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-500 min-w-[180px] break-words whitespace-normal">
                                  {session.comment || '—'}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3 text-sm text-center">
                                  {session.photoTaken
                                    ? <span className="text-green-600 font-bold">✓</span>
                                    : <span className="text-gray-300">✗</span>}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3 text-sm text-right">
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => handleEdit(session)} className="text-brand-blue hover:text-brand-blue/70 transition-colors">
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => session.id && handleDelete(session.id)} className="text-red-500 hover:text-red-700 transition-colors">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
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

      {/* Charts */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white bg-brand-blue px-3 py-2 rounded-lg mb-4">
              Évolution Bras et Mollets
            </h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sessions.map(s => ({
                  date: format(new Date(s.date), 'dd/MM'),
                  brasDroit: parseFloat(s.measurements?.arms?.right) || null,
                  brasGauche: parseFloat(s.measurements?.arms?.left) || null,
                  molletDroit: parseFloat(s.measurements?.calves?.right) || null,
                  molletGauche: parseFloat(s.measurements?.calves?.left) || null,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="brasDroit" name="Bras droit" stroke="#35aedc" connectNulls dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="brasGauche" name="Bras gauche" stroke="#f42abe" connectNulls dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="molletDroit" name="Mollet droit" stroke="#10B981" connectNulls dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="molletGauche" name="Mollet gauche" stroke="#F59E0B" connectNulls dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white bg-brand-blue px-3 py-2 rounded-lg mb-4">
              Évolution Tronc
            </h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sessions.map(s => ({
                  date: format(new Date(s.date), 'dd/MM'),
                  nombril: parseFloat(s.measurements?.navel) || null,
                  hanches: parseFloat(s.measurements?.hips) || null,
                  fesses: parseFloat(s.measurements?.buttocks) || null,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="nombril" name="Nombril" stroke="#35aedc" connectNulls dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="hanches" name="Hanches" stroke="#f42abe" connectNulls dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="fesses" name="Fesses" stroke="#10B981" connectNulls dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white bg-brand-blue px-3 py-2 rounded-lg mb-4">
              Évolution du Poids
            </h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sessions.filter(s => s.weight).map(s => ({
                  date: format(new Date(s.date), 'dd/MM'),
                  poids: s.weight,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="poids" name="Poids (kg)" stroke="#35aedc" strokeWidth={2} dot={{ r: 4, fill: '#35aedc' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IShapeTab;
