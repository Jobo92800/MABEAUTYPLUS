import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { getSessions, addSession, updateSession, deleteSession } from '../../services/database';
import { getTotalTreatmentSessions, updateTotalTreatmentSessions } from '../../services/database/operations/totalSessions';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { Session } from '../../types/session';
import { toast } from 'react-hot-toast';

interface PressodynamieTabProps {
  clientId: string;
  centerId: string;
}

const PressodynamieTab: React.FC<PressodynamieTabProps> = ({ clientId, centerId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [newSession, setNewSession] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    mode: {
      minutes: '',
      c: '',
      d: '',
      w: ''
    },
    comment: ''
  });

  // Fonction pour récupérer le nombre de séances depuis le formulaire Pressodynamie
  const getSessionCountFromForm = async () => {
    try {
      const docRef = doc(db, 'curepresso', clientId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return parseInt(data.sessionCount) || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching session count from form:', error);
      return 0;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [sessionsData, storedTotalSessions, formSessionCount] = await Promise.all([
        getSessions(clientId, centerId, 'pressodynamie'),
        getTotalTreatmentSessions(clientId, 'pressodynamie'),
        getSessionCountFromForm()
      ]);
      
      setSessions(sessionsData);
      
      // Si aucune valeur n'est stockée, utiliser la valeur du formulaire
      if (storedTotalSessions === 0 && formSessionCount > 0) {
        setTotalSessions(formSessionCount);
        // Sauvegarder cette valeur pour la prochaine fois
        await updateTotalTreatmentSessions(clientId, 'pressodynamie', formSessionCount);
      } else {
        setTotalSessions(storedTotalSessions);
      }
    } catch (err: any) {
      console.error('Error fetching pressodynamie data:', err);
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
      await updateTotalTreatmentSessions(clientId, 'pressodynamie', value);
      setTotalSessions(value);
      toast.success('Nombre total de séances mis à jour');
    } catch (error) {
      console.error('Error updating total sessions:', error);
      toast.error('Erreur lors de la mise à jour du nombre total de séances');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSession) {
        await updateSession({
          ...editingSession,
          date: newSession.date,
          mode: newSession.mode,
          comment: newSession.comment
        });
        toast.success('Séance mise à jour avec succès');
      } else {
        await addSession({
          clientId,
          centerId,
          type: 'pressodynamie',
          date: newSession.date,
          mode: newSession.mode,
          comment: newSession.comment,
          number: sessions.length + 1
        });

        // Décrémenter le nombre total de séances
        const newTotalSessions = Math.max(0, totalSessions - 1);
        await updateTotalTreatmentSessions(clientId, 'pressodynamie', newTotalSessions);
        setTotalSessions(newTotalSessions);
        
        toast.success('Séance ajoutée avec succès');
      }

      await fetchData();
      setShowAddForm(false);
      setEditingSession(null);
      setNewSession({
        date: format(new Date(), 'yyyy-MM-dd'),
        mode: {
          minutes: '',
          c: '',
          d: '',
          w: ''
        },
        comment: ''
      });
    } catch (error) {
      console.error('Error saving pressodynamie session:', error);
      toast.error('Erreur lors de l\'enregistrement de la séance');
    }
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setNewSession({
      date: session.date,
      mode: session.mode || {
        minutes: '',
        c: '',
        d: '',
        w: ''
      },
      comment: session.comment || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (sessionId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      return;
    }

    try {
      await deleteSession(sessionId);
      toast.success('Séance supprimée avec succès');
      await fetchData();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Erreur lors de la suppression de la séance');
    }
  };

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
      {/* Total Sessions Counter */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Séances Pressodynamie
          </h3>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={totalSessions}
              onChange={(e) => handleTotalSessionsChange(parseInt(e.target.value) || 0)}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-20 rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
              min="0"
            />
            <span className="text-sm text-gray-500">séances</span>
          </div>
        </div>
        {totalSessions > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Séances restantes : <span className="font-medium text-brand-blue">{Math.max(0, totalSessions - sessions.length)}</span>
          </div>
        )}
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-base font-semibold leading-6 text-gray-900">
                Suivi des séances
              </h2>
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
                <h3 className="text-sm font-medium text-gray-900">
                  {editingSession ? 'Modifier la séance' : 'Nouvelle séance'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingSession(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    <label htmlFor="minutes" className="block text-sm font-medium text-gray-700">
                      Minutes
                    </label>
                    <input
                      type="text"
                      name="minutes"
                      id="minutes"
                      value={newSession.mode.minutes}
                      onChange={(e) => setNewSession({
                        ...newSession,
                        mode: { ...newSession.mode, minutes: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="c" className="block text-sm font-medium text-gray-700">
                      C
                    </label>
                    <input
                      type="text"
                      name="c"
                      id="c"
                      value={newSession.mode.c}
                      onChange={(e) => setNewSession({
                        ...newSession,
                        mode: { ...newSession.mode, c: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="d" className="block text-sm font-medium text-gray-700">
                      D
                    </label>
                    <input
                      type="text"
                      name="d"
                      id="d"
                      value={newSession.mode.d}
                      onChange={(e) => setNewSession({
                        ...newSession,
                        mode: { ...newSession.mode, d: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="w" className="block text-sm font-medium text-gray-700">
                      W
                    </label>
                    <input
                      type="text"
                      name="w"
                      id="w"
                      value={newSession.mode.w}
                      onChange={(e) => setNewSession({
                        ...newSession,
                        mode: { ...newSession.mode, w: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                    />
                  </div>
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

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {editingSession ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Séance</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mode/intensité</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Commentaire</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((session, index, sortedArray) => (
                      <tr key={session.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{sortedArray.length - index}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {format(new Date(session.date), 'dd/MM/yyyy', { locale: fr })}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          Min: {session.mode?.minutes} - C: {session.mode?.c} - D: {session.mode?.d} - W: {session.mode?.w}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">{session.comment}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(session)}
                              className="text-brand-blue hover:text-brand-blue/80"
                            >
                              <Pencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => session.id && handleDelete(session.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
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
  );
};

export default PressodynamieTab;