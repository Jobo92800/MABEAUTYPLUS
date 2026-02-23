import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingDown, TrendingUp, Edit2, Save, X } from 'lucide-react';
import { doc, getDoc, setDoc, collection, addDoc, query, orderBy, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SectionTitlePink from '../../SectionTitlePink';
import type { FullClientData } from '../../../types/client';

interface BodyZone {
  brasHautDroit: string;
  brasHautGauche: string;
  brasMilieuDroit: string;
  brasMilieuGauche: string;
  brasBasDroit: string;
  brasBasGauche: string;
  ventre: string;
  hanche: string;
  taille: string;
  fesses: string;
  sousFessier: string;
  cuisseHautDroit: string;
  cuisseHautGauche: string;
  cuisseMilieuDroit: string;
  cuisseMilieuGauche: string;
  cuisseBasDroit: string;
  cuisseBasGauche: string;
  molletDroit: string;
  molletGauche: string;
}

interface MesojetCorpsSession {
  id?: string;
  date: string;
  sessionNumber: number;
  comments: string;
  zones: BodyZone;
}

interface MesojetCorpsFormProps {
  initialData?: FullClientData;
}

const zoneLabels: Record<keyof BodyZone, string> = {
  brasHautDroit: 'Bras haut D',
  brasHautGauche: 'Bras haut G',
  brasMilieuDroit: 'Bras milieu D',
  brasMilieuGauche: 'Bras milieu G',
  brasBasDroit: 'Bras bas D',
  brasBasGauche: 'Bras bas G',
  ventre: 'Ventre',
  hanche: 'Hanche',
  taille: 'Taille',
  fesses: 'Fesses',
  sousFessier: 'Sous-fessier',
  cuisseHautDroit: 'Cuisse haut D',
  cuisseHautGauche: 'Cuisse haut G',
  cuisseMilieuDroit: 'Cuisse milieu D',
  cuisseMilieuGauche: 'Cuisse milieu G',
  cuisseBasDroit: 'Cuisse bas D',
  cuisseBasGauche: 'Cuisse bas G',
  molletDroit: 'Mollet D',
  molletGauche: 'Mollet G'
};

const MesojetCorpsForm: React.FC<MesojetCorpsFormProps> = ({ initialData }) => {
  const [sessions, setSessions] = useState<MesojetCorpsSession[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(3);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<MesojetCorpsSession | null>(null);

  const [newSession, setNewSession] = useState<MesojetCorpsSession>({
    date: format(new Date(), 'yyyy-MM-dd'),
    sessionNumber: 1,
    comments: '',
    zones: {
      brasHautDroit: '',
      brasHautGauche: '',
      brasMilieuDroit: '',
      brasMilieuGauche: '',
      brasBasDroit: '',
      brasBasGauche: '',
      ventre: '',
      hanche: '',
      taille: '',
      fesses: '',
      sousFessier: '',
      cuisseHautDroit: '',
      cuisseHautGauche: '',
      cuisseMilieuDroit: '',
      cuisseMilieuGauche: '',
      cuisseBasDroit: '',
      cuisseBasGauche: '',
      molletDroit: '',
      molletGauche: '',
    }
  });

  useEffect(() => {
    const loadSessions = async () => {
      if (!initialData?.client.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const sessionsRef = collection(db, 'mesojetCorpsSessions');
        const q = query(
          sessionsRef,
          orderBy('sessionNumber', 'asc')
        );
        const querySnapshot = await getDocs(q);

        const loadedSessions: MesojetCorpsSession[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.clientId === initialData.client.id) {
            loadedSessions.push({
              id: doc.id,
              ...data
            } as MesojetCorpsSession);
          }
        });

        setSessions(loadedSessions);

        if (loadedSessions.length > 0) {
          setNewSession(prev => ({
            ...prev,
            sessionNumber: loadedSessions[loadedSessions.length - 1].sessionNumber + 1
          }));
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [initialData?.client.id]);

  const handleAddSession = async () => {
    if (!initialData?.client.id) return;

    try {
      const sessionsRef = collection(db, 'mesojetCorpsSessions');
      const docRef = await addDoc(sessionsRef, {
        ...newSession,
        clientId: initialData.client.id,
        createdAt: new Date().toISOString()
      });

      const newSessionWithId = { ...newSession, id: docRef.id };
      setSessions([...sessions, newSessionWithId]);

      setNewSession({
        date: format(new Date(), 'yyyy-MM-dd'),
        sessionNumber: newSession.sessionNumber + 1,
        comments: '',
        zones: {
          brasHautDroit: '',
          brasHautGauche: '',
          brasMilieuDroit: '',
          brasMilieuGauche: '',
          brasBasDroit: '',
          brasBasGauche: '',
          ventre: '',
          hanche: '',
          taille: '',
          fesses: '',
          sousFessier: '',
          cuisseHautDroit: '',
          cuisseHautGauche: '',
          cuisseMilieuDroit: '',
          cuisseMilieuGauche: '',
          cuisseBasDroit: '',
          cuisseBasGauche: '',
          molletDroit: '',
          molletGauche: '',
        }
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!sessionId) return;

    try {
      await deleteDoc(doc(db, 'mesojetCorpsSessions', sessionId));
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleEditSession = (session: MesojetCorpsSession) => {
    setEditingSessionId(session.id || null);
    setEditingSession({ ...session });
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingSession(null);
  };

  const handleSaveEdit = async () => {
    if (!editingSession || !editingSessionId) return;

    try {
      const sessionRef = doc(db, 'mesojetCorpsSessions', editingSessionId);
      await updateDoc(sessionRef, {
        date: editingSession.date,
        sessionNumber: editingSession.sessionNumber,
        comments: editingSession.comments,
        zones: editingSession.zones
      });

      setSessions(sessions.map(s => s.id === editingSessionId ? editingSession : s));
      setEditingSessionId(null);
      setEditingSession(null);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleEditZoneChange = (zone: keyof BodyZone, value: string) => {
    if (!editingSession) return;
    setEditingSession({
      ...editingSession,
      zones: {
        ...editingSession.zones,
        [zone]: value
      }
    });
  };

  const toggleSessionExpanded = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const handleZoneChange = (zone: keyof BodyZone, value: string) => {
    setNewSession(prev => ({
      ...prev,
      zones: {
        ...prev.zones,
        [zone]: value
      }
    }));
  };

  const renderZoneInput = (label: string, zoneKey: keyof BodyZone) => {
    return (
      <div className="flex items-center gap-2">
        <label className="flex-1 text-sm">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            step="0.1"
            value={newSession.zones[zoneKey]}
            onChange={(e) => handleZoneChange(zoneKey, e.target.value)}
            className="w-20 px-2 py-1 text-sm rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            placeholder="cm"
          />
          <span className="text-xs text-gray-500">cm</span>
        </div>
      </div>
    );
  };

  const getChartData = (zoneKey: keyof BodyZone) => {
    return sessions
      .filter(session => session.zones[zoneKey] && session.zones[zoneKey] !== '')
      .map(session => ({
        session: `S${session.sessionNumber}`,
        date: format(new Date(session.date), 'dd/MM'),
        valeur: parseFloat(session.zones[zoneKey])
      }));
  };

  const calculateDifferences = (session: MesojetCorpsSession, index: number) => {
    const differences: Array<{
      zone: keyof BodyZone;
      label: string;
      current: number;
      diffFromFirst: number;
      diffFromPrevious: number;
    }> = [];

    const currentSession = session;
    const firstSession = sessions[0];
    const previousSession = index > 0 ? sessions[index - 1] : null;

    Object.keys(session.zones).forEach((key) => {
      const zoneKey = key as keyof BodyZone;
      const currentValue = parseFloat(currentSession.zones[zoneKey]);

      if (!isNaN(currentValue) && currentValue > 0) {
        const firstValue = firstSession ? parseFloat(firstSession.zones[zoneKey]) : null;
        const previousValue = previousSession ? parseFloat(previousSession.zones[zoneKey]) : null;

        const diffFromFirst = firstValue ? currentValue - firstValue : 0;
        const diffFromPrevious = previousValue ? currentValue - previousValue : 0;

        differences.push({
          zone: zoneKey,
          label: zoneLabels[zoneKey],
          current: currentValue,
          diffFromFirst: diffFromFirst,
          diffFromPrevious: diffFromPrevious
        });
      }
    });

    return differences;
  };

  const calculateTotalDifference = () => {
    if (sessions.length < 2) return { total: 0, count: 0 };

    const lastSession = sessions[sessions.length - 1];
    const firstSession = sessions[0];
    let totalDiff = 0;
    let count = 0;

    Object.keys(lastSession.zones).forEach((key) => {
      const zoneKey = key as keyof BodyZone;
      const lastValue = parseFloat(lastSession.zones[zoneKey]);
      const firstValue = parseFloat(firstSession.zones[zoneKey]);

      if (!isNaN(lastValue) && !isNaN(firstValue) && lastValue > 0 && firstValue > 0) {
        totalDiff += (lastValue - firstValue);
        count++;
      }
    });

    return { total: totalDiff, count };
  };

  const groupDifferencesByCategory = (differences: Array<{
    zone: keyof BodyZone;
    label: string;
    current: number;
    diffFromFirst: number;
    diffFromPrevious: number;
  }>) => {
    const categories = {
      bras: {
        title: 'Bras',
        zones: [] as typeof differences
      },
      jambes: {
        title: 'Jambes',
        zones: [] as typeof differences
      },
      ventre: {
        title: 'Ventre',
        zones: [] as typeof differences
      },
      fesses: {
        title: 'Fesses',
        zones: [] as typeof differences
      }
    };

    const brasZones = ['brasHautDroit', 'brasHautGauche', 'brasBasDroit', 'brasBasGauche', 'brasMilieuDroit', 'brasMilieuGauche'];
    const jambesZones = ['cuisseHautDroit', 'cuisseHautGauche', 'cuisseMilieuDroit', 'cuisseMilieuGauche', 'cuisseBasDroit', 'cuisseBasGauche', 'molletDroit', 'molletGauche'];
    const ventreZones = ['ventre', 'hanche', 'taille'];
    const fessesZones = ['fesses', 'sousFessier'];

    differences.forEach(diff => {
      if (brasZones.includes(diff.zone)) {
        categories.bras.zones.push(diff);
      } else if (jambesZones.includes(diff.zone)) {
        categories.jambes.zones.push(diff);
      } else if (ventreZones.includes(diff.zone)) {
        categories.ventre.zones.push(diff);
      } else if (fessesZones.includes(diff.zone)) {
        categories.fesses.zones.push(diff);
      }
    });

    return Object.values(categories).filter(cat => cat.zones.length > 0);
  };

  const renderDifferenceValue = (diff: number) => {
    if (diff === 0) {
      return <span className="text-gray-500">0 cm</span>;
    }

    const isPositive = diff > 0;
    const colorClass = isPositive ? 'text-red-600' : 'text-green-600';
    const Icon = isPositive ? TrendingUp : TrendingDown;

    return (
      <span className={`${colorClass} font-semibold flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {diff > 0 ? '+' : ''}{diff.toFixed(1)} cm
      </span>
    );
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  const zonesWithData = Object.keys(sessions[0]?.zones || {}).filter((key) => {
    return sessions.some(s => s.zones[key as keyof BodyZone] && s.zones[key as keyof BodyZone] !== '');
  }) as Array<keyof BodyZone>;

  return (
    <div className="space-y-8 mt-8">
      <SectionTitlePink>Suivi des séances Mésojet Corps</SectionTitlePink>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Nombre de séances : {sessions.length}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-pink to-brand-blue rounded-full hover:shadow-md transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une séance
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Nouvelle séance</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={newSession.date}
                onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">N° Séance</label>
              <input
                type="number"
                value={newSession.sessionNumber}
                onChange={(e) => setNewSession({ ...newSession, sessionNumber: parseInt(e.target.value) || 1 })}
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Commentaires</label>
              <input
                type="text"
                value={newSession.comments}
                onChange={(e) => setNewSession({ ...newSession, comments: e.target.value })}
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
                placeholder="Commentaires sur la séance"
              />
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Zones traitées et mesures (cm)</h4>

            <div className="space-y-6">
              <div>
                <h5 className="text-sm font-semibold text-brand-pink mb-3">Bras</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {renderZoneInput('Zone 1 - Haut (épaule) Droit', 'brasHautDroit')}
                    {renderZoneInput('Zone 2 - Milieu Droit', 'brasMilieuDroit')}
                    {renderZoneInput('Zone 3 - Bas (coude) Droit', 'brasBasDroit')}
                  </div>
                  <div className="space-y-2">
                    {renderZoneInput('Zone 1 - Haut (épaule) Gauche', 'brasHautGauche')}
                    {renderZoneInput('Zone 2 - Milieu Gauche', 'brasMilieuGauche')}
                    {renderZoneInput('Zone 3 - Bas (coude) Gauche', 'brasBasGauche')}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-brand-pink mb-3">Tronc</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderZoneInput('Ventre', 'ventre')}
                  {renderZoneInput('Hanche', 'hanche')}
                  {renderZoneInput('Taille', 'taille')}
                  {renderZoneInput('Fesses', 'fesses')}
                  {renderZoneInput('Sous-fessier', 'sousFessier')}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-brand-pink mb-3">Cuisses</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {renderZoneInput('Zone 1 - Haut cuisse Droit', 'cuisseHautDroit')}
                    {renderZoneInput('Zone 2 - Milieu cuisse Droit', 'cuisseMilieuDroit')}
                    {renderZoneInput('Zone 3 - Bas cuisse (genoux) Droit', 'cuisseBasDroit')}
                  </div>
                  <div className="space-y-2">
                    {renderZoneInput('Zone 1 - Haut cuisse Gauche', 'cuisseHautGauche')}
                    {renderZoneInput('Zone 2 - Milieu cuisse Gauche', 'cuisseMilieuGauche')}
                    {renderZoneInput('Zone 3 - Bas cuisse (genoux) Gauche', 'cuisseBasGauche')}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-brand-pink mb-3">Mollets</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderZoneInput('Mollet Droit', 'molletDroit')}
                  {renderZoneInput('Mollet Gauche', 'molletGauche')}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleAddSession}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-pink to-brand-blue rounded-lg hover:shadow-md"
            >
              Enregistrer la séance
            </button>
          </div>
        </div>
      )}

      {sessions.length > 1 && zonesWithData.length > 0 && (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Évolution des mesures</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {zonesWithData.map((zoneKey) => {
              const chartData = getChartData(zoneKey);

              if (chartData.length < 2) return null;

              return (
                <div key={zoneKey} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">{zoneLabels[zoneKey]}</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="valeur"
                        stroke="#ec4899"
                        strokeWidth={2}
                        dot={{ fill: '#ec4899', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des séances</h3>

          {sessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune séance enregistrée</p>
          ) : (
            <>
              {sessions.length >= 2 && (() => {
                const { total, count } = calculateTotalDifference();
                if (count > 0) {
                  const isPositive = total > 0;
                  const Icon = isPositive ? TrendingUp : TrendingDown;
                  const colorClass = isPositive ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';

                  return (
                    <div className={`mb-4 p-4 rounded-lg border ${isPositive ? 'border-red-200' : 'border-green-200'} ${colorClass}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Évolution totale depuis le début</p>
                          <p className="text-xs text-gray-600 mt-1">Basé sur {count} zone{count > 1 ? 's' : ''} mesurée{count > 1 ? 's' : ''}</p>
                        </div>
                        <div className={`flex items-center gap-2 text-2xl font-bold ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
                          <Icon className="h-6 w-6" />
                          <span>{total > 0 ? '+' : ''}{total.toFixed(1)} cm</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="space-y-4">
                {[...sessions].reverse().slice(0, displayLimit).map((session) => {
                  const index = sessions.findIndex(s => s.id === session.id);
                  const differences = calculateDifferences(session, index);

                  const isEditing = editingSessionId === session.id;
                  const displaySession = isEditing ? editingSession! : session;

                  return (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                                  <input
                                    type="date"
                                    value={editingSession?.date}
                                    onChange={(e) => setEditingSession({ ...editingSession!, date: e.target.value })}
                                    className="w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">N° de séance</label>
                                  <input
                                    type="number"
                                    value={editingSession?.sessionNumber}
                                    onChange={(e) => setEditingSession({ ...editingSession!, sessionNumber: parseInt(e.target.value) })}
                                    className="w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Commentaires</label>
                                <textarea
                                  value={editingSession?.comments}
                                  onChange={(e) => setEditingSession({ ...editingSession!, comments: e.target.value })}
                                  rows={2}
                                  className="w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-4 mb-2">
                                <span className="text-sm font-semibold text-gray-900">
                                  Séance #{session.sessionNumber}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {format(new Date(session.date), 'dd/MM/yyyy')}
                                </span>
                              </div>
                              {session.comments && (
                                <p className="text-sm text-gray-600">{session.comments}</p>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={handleSaveEdit}
                                className="text-green-600 hover:text-green-700"
                                title="Enregistrer"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="text-gray-500 hover:text-gray-700"
                                title="Annuler"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleEditSession(session)}
                                className="text-blue-500 hover:text-blue-700"
                                title="Modifier"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => session.id && handleDeleteSession(session.id)}
                                className="text-red-500 hover:text-red-700"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {differences.length > 0 && (() => {
                        const categories = groupDifferencesByCategory(differences);
                        const isExpanded = expandedSessions.has(session.id || '');
                        const displayCategories = isExpanded ? categories : categories.slice(0, 2);
                        const totalZonesCount = differences.length;
                        const visibleZonesCount = displayCategories.reduce((sum, cat) => sum + cat.zones.length, 0);
                        const hasHiddenContent = categories.length > displayCategories.length;

                        return (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="space-y-4">
                              {displayCategories.map((category, catIndex) => (
                                <div key={catIndex}>
                                  <h4 className="text-xs font-bold text-gray-700 uppercase mb-2 px-2">{category.title}</h4>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full text-xs">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-2 py-2 text-left font-semibold text-gray-700">Zone</th>
                                          <th className="px-2 py-2 text-center font-semibold text-gray-700">Mesure actuelle</th>
                                          {index > 0 && (
                                            <>
                                              <th className="px-2 py-2 text-center font-semibold text-gray-700">Diff. vs début</th>
                                              <th className="px-2 py-2 text-center font-semibold text-gray-700">Diff. vs précédent</th>
                                            </>
                                          )}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {category.zones.map((diff) => (
                                          <tr key={diff.zone}>
                                            <td className="px-2 py-2 font-medium text-gray-900">{diff.label}</td>
                                            <td className="px-2 py-2 text-center">
                                              {isEditing ? (
                                                <input
                                                  type="text"
                                                  value={editingSession?.zones[diff.zone] || ''}
                                                  onChange={(e) => handleEditZoneChange(diff.zone, e.target.value)}
                                                  className="w-20 text-xs text-center rounded border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
                                                  placeholder="cm"
                                                />
                                              ) : (
                                                <span className="text-gray-700">{diff.current.toFixed(1)} cm</span>
                                              )}
                                            </td>
                                            {index > 0 && !isEditing && (
                                              <>
                                                <td className="px-2 py-2 text-center">
                                                  {renderDifferenceValue(diff.diffFromFirst)}
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                  {renderDifferenceValue(diff.diffFromPrevious)}
                                                </td>
                                              </>
                                            )}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {hasHiddenContent && (
                              <div className="mt-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => session.id && toggleSessionExpanded(session.id)}
                                  className="text-sm text-brand-pink hover:text-pink-700 font-medium"
                                >
                                  {isExpanded ? (
                                    'Voir moins de zones'
                                  ) : (
                                    `Voir plus de zones (${totalZonesCount - visibleZonesCount} autres)`
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>

              {sessions.length > displayLimit && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setDisplayLimit(prev => prev + 3)}
                    className="px-6 py-2 text-sm font-medium text-brand-pink border border-brand-pink rounded-lg hover:bg-pink-50 transition-colors"
                  >
                    Voir plus de séances ({sessions.length - displayLimit} restantes)
                  </button>
                </div>
              )}

              {displayLimit > 3 && sessions.length > 3 && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={() => setDisplayLimit(3)}
                    className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Voir moins
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MesojetCorpsForm;
