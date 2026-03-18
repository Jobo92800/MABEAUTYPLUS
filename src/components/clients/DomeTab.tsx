import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { doc, getDoc, setDoc, collection, addDoc, query, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { format } from 'date-fns';
import SectionTitlePink from '../SectionTitlePink';
import type { FullClientData } from '../../types/client';
import { getTotalTreatmentSessions, updateTotalTreatmentSessions } from '../../services/database/operations/totalSessions';

interface DomeMeasurements {
  brasGauche: string;
  brasDroit: string;
  jambeGauche: string;
  jambeDroite: string;
  torse: string;
}

interface DomeSession {
  id?: string;
  date: string;
  sessionNumber: number;
  observation: string;
  weight: string;
  measurements: DomeMeasurements;
}

interface DomeTabProps {
  initialData?: FullClientData;
}

const DomeTab: React.FC<DomeTabProps> = ({ initialData }) => {
  const [sessions, setSessions] = useState<DomeSession[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(3);
  const [totalSessions, setTotalSessions] = useState(0);
  const [isEditingTotal, setIsEditingTotal] = useState(false);

  const [newSession, setNewSession] = useState<DomeSession>({
    date: format(new Date(), 'yyyy-MM-dd'),
    sessionNumber: 1,
    observation: '',
    weight: '',
    measurements: {
      brasGauche: '',
      brasDroit: '',
      jambeGauche: '',
      jambeDroite: '',
      torse: '',
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
        const sessionsRef = collection(db, 'domeSessions');
        const q = query(
          sessionsRef,
          orderBy('sessionNumber', 'asc')
        );
        const querySnapshot = await getDocs(q);

        const loadedSessions: DomeSession[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.clientId === initialData.client.id) {
            loadedSessions.push({
              id: doc.id,
              ...data
            } as DomeSession);
          }
        });

        setSessions(loadedSessions);

        if (loadedSessions.length > 0) {
          setNewSession(prev => ({
            ...prev,
            sessionNumber: loadedSessions[loadedSessions.length - 1].sessionNumber + 1
          }));
        }

        const total = await getTotalTreatmentSessions(initialData.client.id, 'dome');
        setTotalSessions(total);
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
      const sessionsRef = collection(db, 'domeSessions');
      const docRef = await addDoc(sessionsRef, {
        ...newSession,
        clientId: initialData.client.id,
        createdAt: new Date().toISOString()
      });

      const newSessionWithId = { ...newSession, id: docRef.id };
      setSessions([...sessions, newSessionWithId]);

      if (totalSessions > 0) {
        const newTotal = totalSessions - 1;
        await updateTotalTreatmentSessions(initialData.client.id, 'dome', newTotal);
        setTotalSessions(newTotal);
      }

      setNewSession({
        date: format(new Date(), 'yyyy-MM-dd'),
        sessionNumber: newSession.sessionNumber + 1,
        observation: '',
        weight: '',
        measurements: {
          brasGauche: '',
          brasDroit: '',
          jambeGauche: '',
          jambeDroite: '',
          torse: '',
        }
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!sessionId || !initialData?.client.id) return;

    try {
      await deleteDoc(doc(db, 'domeSessions', sessionId));
      setSessions(sessions.filter(s => s.id !== sessionId));

      const newTotal = totalSessions + 1;
      await updateTotalTreatmentSessions(initialData.client.id, 'dome', newTotal);
      setTotalSessions(newTotal);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleUpdateTotalSessions = async (newTotal: number) => {
    if (!initialData?.client.id) return;

    try {
      await updateTotalTreatmentSessions(initialData.client.id, 'dome', newTotal);
      setTotalSessions(newTotal);
      setIsEditingTotal(false);
    } catch (error) {
      console.error('Error updating total sessions:', error);
    }
  };

  const calculateDifferences = (currentSession: DomeSession, currentIndex: number) => {
    if (currentIndex === 0) return null;

    const firstSession = sessions[0];
    const previousSession = sessions[currentIndex - 1];

    const measurements = [
      { key: 'brasGauche', label: 'Bras gauche' },
      { key: 'brasDroit', label: 'Bras droit' },
      { key: 'jambeGauche', label: 'Jambe gauche' },
      { key: 'jambeDroite', label: 'Jambe droite' },
      { key: 'torse', label: 'Torse' },
    ];

    return measurements.map(({ key, label }) => {
      const current = parseFloat(currentSession.measurements[key as keyof DomeMeasurements]) || 0;
      const first = parseFloat(firstSession.measurements[key as keyof DomeMeasurements]) || 0;
      const previous = parseFloat(previousSession.measurements[key as keyof DomeMeasurements]) || 0;

      return {
        label,
        current,
        diffFromFirst: current - first,
        diffFromPrevious: current - previous,
      };
    });
  };

  const renderDifferenceValue = (diff: number) => {
    if (diff === 0) {
      return <span className="text-gray-500">0 cm</span>;
    }

    const isPositive = diff > 0;
    const colorClass = isPositive ? 'text-red-600' : 'text-green-600';
    const Icon = isPositive ? TrendingUp : TrendingDown;

    return (
      <span className={`${colorClass} font-semibold flex items-center gap-1 justify-center`}>
        <Icon className="h-3 w-3" />
        {diff > 0 ? '+' : ''}{diff.toFixed(1)} cm
      </span>
    );
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-8 mt-8">
      <SectionTitlePink>Suivi des séances Dôme</SectionTitlePink>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Nombre de séances : {sessions.length}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Nombre de séances total :
              </label>
              {isEditingTotal ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={totalSessions}
                    onChange={(e) => setTotalSessions(parseInt(e.target.value) || 0)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink text-sm"
                    min="0"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateTotalSessions(totalSessions)}
                    className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingTotal(false);
                      getTotalTreatmentSessions(initialData?.client.id || '', 'dome').then(setTotalSessions);
                    }}
                    className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingTotal(true)}
                  className="text-lg font-semibold text-brand-pink hover:text-pink-700"
                >
                  {totalSessions}
                </button>
              )}
            </div>
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
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">N° de séance</label>
              <input
                type="number"
                value={newSession.sessionNumber}
                onChange={(e) => setNewSession({ ...newSession, sessionNumber: parseInt(e.target.value) })}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Poids (kg)</label>
              <input
                type="text"
                value={newSession.weight}
                onChange={(e) => setNewSession({ ...newSession, weight: e.target.value })}
                placeholder="Ex: 65.5"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Observation</label>
            <textarea
              value={newSession.observation}
              onChange={(e) => setNewSession({ ...newSession, observation: e.target.value })}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
              placeholder="Observations sur la séance..."
            />
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Mesures (cm)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bras gauche</label>
                <input
                  type="text"
                  value={newSession.measurements.brasGauche}
                  onChange={(e) => setNewSession({
                    ...newSession,
                    measurements: { ...newSession.measurements, brasGauche: e.target.value }
                  })}
                  placeholder="cm"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bras droit</label>
                <input
                  type="text"
                  value={newSession.measurements.brasDroit}
                  onChange={(e) => setNewSession({
                    ...newSession,
                    measurements: { ...newSession.measurements, brasDroit: e.target.value }
                  })}
                  placeholder="cm"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jambe gauche</label>
                <input
                  type="text"
                  value={newSession.measurements.jambeGauche}
                  onChange={(e) => setNewSession({
                    ...newSession,
                    measurements: { ...newSession.measurements, jambeGauche: e.target.value }
                  })}
                  placeholder="cm"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jambe droite</label>
                <input
                  type="text"
                  value={newSession.measurements.jambeDroite}
                  onChange={(e) => setNewSession({
                    ...newSession,
                    measurements: { ...newSession.measurements, jambeDroite: e.target.value }
                  })}
                  placeholder="cm"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Torse</label>
                <input
                  type="text"
                  value={newSession.measurements.torse}
                  onChange={(e) => setNewSession({
                    ...newSession,
                    measurements: { ...newSession.measurements, torse: e.target.value }
                  })}
                  placeholder="cm"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleAddSession}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-pink to-brand-blue rounded-full hover:shadow-md transition-all"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
            >
              Annuler
            </button>
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
              <div className="space-y-4">
                {[...sessions].reverse().slice(0, displayLimit).map((session) => {
                  const index = sessions.findIndex(s => s.id === session.id);
                  const differences = calculateDifferences(session, index);

                  return (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-sm font-semibold text-gray-900">
                              Séance #{session.sessionNumber}
                            </span>
                            <span className="text-sm text-gray-600">
                              {format(new Date(session.date), 'dd/MM/yyyy')}
                            </span>
                            {session.weight && (
                              <span className="text-sm text-gray-600 font-medium">
                                Poids: {session.weight} kg
                              </span>
                            )}
                          </div>
                          {session.observation && (
                            <p className="text-sm text-gray-600 italic">{session.observation}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => session.id && handleDeleteSession(session.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-2 py-2 text-left font-semibold text-gray-700">Zone</th>
                                <th className="px-2 py-2 text-center font-semibold text-gray-700">Mesure actuelle</th>
                                {index > 0 && differences && (
                                  <>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700">Diff. vs début</th>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700">Diff. vs précédent</th>
                                  </>
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {differences ? (
                                differences.map((diff) => (
                                  <tr key={diff.label}>
                                    <td className="px-2 py-2 font-medium text-gray-900">{diff.label}</td>
                                    <td className="px-2 py-2 text-center text-gray-700">{diff.current.toFixed(1)} cm</td>
                                    <td className="px-2 py-2 text-center">
                                      {renderDifferenceValue(diff.diffFromFirst)}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                      {renderDifferenceValue(diff.diffFromPrevious)}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <>
                                  {session.measurements.brasGauche && (
                                    <tr>
                                      <td className="px-2 py-2 font-medium text-gray-900">Bras gauche</td>
                                      <td className="px-2 py-2 text-center text-gray-700">{session.measurements.brasGauche} cm</td>
                                    </tr>
                                  )}
                                  {session.measurements.brasDroit && (
                                    <tr>
                                      <td className="px-2 py-2 font-medium text-gray-900">Bras droit</td>
                                      <td className="px-2 py-2 text-center text-gray-700">{session.measurements.brasDroit} cm</td>
                                    </tr>
                                  )}
                                  {session.measurements.jambeGauche && (
                                    <tr>
                                      <td className="px-2 py-2 font-medium text-gray-900">Jambe gauche</td>
                                      <td className="px-2 py-2 text-center text-gray-700">{session.measurements.jambeGauche} cm</td>
                                    </tr>
                                  )}
                                  {session.measurements.jambeDroite && (
                                    <tr>
                                      <td className="px-2 py-2 font-medium text-gray-900">Jambe droite</td>
                                      <td className="px-2 py-2 text-center text-gray-700">{session.measurements.jambeDroite} cm</td>
                                    </tr>
                                  )}
                                  {session.measurements.torse && (
                                    <tr>
                                      <td className="px-2 py-2 font-medium text-gray-900">Torse</td>
                                      <td className="px-2 py-2 text-center text-gray-700">{session.measurements.torse} cm</td>
                                    </tr>
                                  )}
                                </>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {sessions.length > displayLimit && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setDisplayLimit(prev => prev + 3)}
                    className="text-sm text-brand-pink hover:text-pink-700 font-medium"
                  >
                    Voir plus de séances ({sessions.length - displayLimit} restantes)
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

export default DomeTab;
