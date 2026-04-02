import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { getSessions, addSession, updateSession, deleteSession } from '../../services/database';
import { getTotalTreatmentSessions, updateTotalTreatmentSessions } from '../../services/database/operations/totalSessions';
import type { Session } from '../../types/session';

const MenopauseTab: React.FC<{ clientId: string; centerId: string }> = ({ clientId, centerId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [newSession, setNewSession] = useState({
    number: sessions.length + 1,
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'treatment' as const,
    comment: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sessionsData, totalSessionsData] = await Promise.all([
        getSessions(clientId, centerId, 'menopause'),
        getTotalTreatmentSessions(clientId, 'menopause')
      ]);
      setSessions(sessionsData);
      setTotalSessions(totalSessionsData || 0);
    } catch (err: any) {
      console.error('Error fetching menopause sessions:', err);
      setError('Erreur lors du chargement des séances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId, centerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSession({
        clientId,
        centerId,
        type: 'menopause',
        date: newSession.date,
        comment: newSession.comment,
        number: sessions.length + 1,
        sessionType: newSession.type
      });

      const newTotalSessions = Math.max(0, totalSessions - 1);
      await updateTotalTreatmentSessions(clientId, 'menopause', newTotalSessions);
      setTotalSessions(newTotalSessions);

      setShowAddForm(false);
      setNewSession({
        number: sessions.length + 2,
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'treatment',
        comment: ''
      });
      await fetchData();
    } catch (error) {
      console.error('Error adding menopause session:', error);
      alert('Erreur lors de l\'ajout de la séance');
    }
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    try {
      await updateSession(editingSession);
      setEditingSession(null);
      await fetchData();
    } catch (error) {
      console.error('Error updating session:', error);
      alert('Erreur lors de la modification de la séance');
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) return;

    try {
      await deleteSession(sessionId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Erreur lors de la suppression de la séance');
    }
  };

  const handleTotalSessionsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    try {
      await updateTotalTreatmentSessions(clientId, 'menopause', value);
      setTotalSessions(value);
    } catch (error) {
      console.error('Error updating total sessions:', error);
      alert('Une erreur est survenue lors de la mise à jour du nombre total de séances.');
    }
  };

  const treatmentSessions = sessions.filter(s => s.sessionType === 'treatment');
  const stabilizationSessions = sessions.filter(s => s.sessionType === 'stabilization');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-brand-blue hover:text-brand-pink transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Séances Ménopause
          </h3>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={totalSessions}
              onChange={handleTotalSessionsChange}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-20 rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
              min="0"
            />
            <span className="text-sm text-gray-500">séances</span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-base font-semibold leading-6 text-gray-900">
                Suivi des séances
              </h2>
              <p className="mt-2 text-sm text-gray-700">
                Suivi des séances de traitement ménopause
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="flex items-center rounded-full bg-brand-blue px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une séance
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-900">Nouvelle séance</h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      id="date"
                      value={newSession.date}
                      onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Type de séance
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={newSession.type}
                      onChange={(e) => setNewSession({ ...newSession, type: e.target.value as 'treatment' | 'stabilization' })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                    >
                      <option value="treatment">Cure de traitement</option>
                      <option value="stabilization">Phase de stabilisation</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                      Commentaire
                    </label>
                    <input
                      type="text"
                      name="comment"
                      id="comment"
                      value={newSession.comment}
                      onChange={(e) => setNewSession({ ...newSession, comment: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
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

          {/* Tableau Cure de traitement */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white bg-brand-blue p-3 rounded-lg shadow-sm">
              CURE DE TRAITEMENT
            </h3>
            <div className="mt-4 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">N°</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Commentaire</th>
                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {treatmentSessions.map((session, index) => (
                        <tr key={session.id}>
                          {editingSession?.id === session.id ? (
                            <>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{index + 1}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <input
                                  type="date"
                                  value={editingSession.date}
                                  onChange={(e) => setEditingSession({ ...editingSession, date: e.target.value })}
                                  className="rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
                                />
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500">
                                <input
                                  type="text"
                                  value={editingSession.comment || ''}
                                  onChange={(e) => setEditingSession({ ...editingSession, comment: e.target.value })}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
                                />
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-right space-x-2">
                                <button
                                  onClick={handleUpdate}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Sauver
                                </button>
                                <button
                                  onClick={() => setEditingSession(null)}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  Annuler
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{index + 1}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {format(new Date(session.date), 'dd MMMM yyyy', { locale: fr })}
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500">{session.comment || '-'}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-right space-x-2">
                                <button
                                  onClick={() => handleEdit(session)}
                                  className="text-brand-blue hover:text-brand-pink"
                                >
                                  <Pencil className="h-4 w-4 inline" />
                                </button>
                                <button
                                  onClick={() => handleDelete(session.id!)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4 inline" />
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau Phase de stabilisation */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white bg-brand-blue p-3 rounded-lg shadow-sm">
              PHASE DE STABILISATION
            </h3>
            <div className="mt-4 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">N°</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Commentaire</th>
                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stabilizationSessions.map((session, index) => (
                        <tr key={session.id}>
                          {editingSession?.id === session.id ? (
                            <>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{index + 1}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <input
                                  type="date"
                                  value={editingSession.date}
                                  onChange={(e) => setEditingSession({ ...editingSession, date: e.target.value })}
                                  className="rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
                                />
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500">
                                <input
                                  type="text"
                                  value={editingSession.comment || ''}
                                  onChange={(e) => setEditingSession({ ...editingSession, comment: e.target.value })}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
                                />
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-right space-x-2">
                                <button
                                  onClick={handleUpdate}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Sauver
                                </button>
                                <button
                                  onClick={() => setEditingSession(null)}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  Annuler
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{index + 1}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {format(new Date(session.date), 'dd MMMM yyyy', { locale: fr })}
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-500">{session.comment || '-'}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-right space-x-2">
                                <button
                                  onClick={() => handleEdit(session)}
                                  className="text-brand-blue hover:text-brand-pink"
                                >
                                  <Pencil className="h-4 w-4 inline" />
                                </button>
                                <button
                                  onClick={() => handleDelete(session.id!)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4 inline" />
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenopauseTab;