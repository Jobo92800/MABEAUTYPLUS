import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { getSessions, addSession, updateSession, deleteSession } from '../../services/database';
import type { Session } from '../../types/session';
import { toast } from 'react-hot-toast';

interface AdvanceLiftTabProps {
  clientId: string;
  centerId: string;
}

const AdvanceLiftTab: React.FC<AdvanceLiftTabProps> = ({ clientId, centerId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [newSession, setNewSession] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    comment: '',
    photoTaken: false
  });

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSessions(clientId, centerId, 'advance-lift');
      setSessions(data);
    } catch (err: any) {
      console.error('Error fetching advance-lift sessions:', err);
      setError('Erreur lors du chargement des séances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [clientId, centerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSession) {
        await updateSession({
          ...editingSession,
          date: newSession.date,
          comment: newSession.comment,
          photoTaken: newSession.photoTaken
        });
        toast.success('Séance mise à jour avec succès');
      } else {
        await addSession({
          clientId,
          centerId,
          type: 'advance-lift',
          date: newSession.date,
          comment: newSession.comment,
          photoTaken: newSession.photoTaken,
          number: sessions.length + 1
        });
        toast.success('Séance ajoutée avec succès');
      }

      // Rafraîchir la liste des séances
      await fetchSessions();
      
      // Réinitialiser le formulaire
      setShowAddForm(false);
      setEditingSession(null);
      setNewSession({
        date: format(new Date(), 'yyyy-MM-dd'),
        comment: '',
        photoTaken: false
      });
    } catch (error) {
      console.error('Error saving advance-lift session:', error);
      toast.error('Erreur lors de l\'enregistrement de la séance');
    }
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setNewSession({
      date: session.date,
      comment: session.comment || '',
      photoTaken: session.photoTaken || false
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
      await fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Erreur lors de la suppression de la séance');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-pink"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-brand-pink hover:text-brand-blue transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                className="flex items-center rounded-full bg-brand-pink px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200"
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

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="photoTaken"
                    checked={newSession.photoTaken}
                    onChange={(e) => setNewSession({ ...newSession, photoTaken: e.target.checked })}
                    className="h-4 w-4 text-brand-pink focus:ring-brand-blue border-gray-300 rounded"
                  />
                  <label htmlFor="photoTaken" className="ml-2 block text-sm text-gray-900">
                    Photo prise
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full bg-brand-pink px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200"
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
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">N°</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Commentaire</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Photo</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[...sessions].reverse().map((session) => (
                      <tr key={session.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{session.number}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {format(new Date(session.date), 'dd MMMM yyyy', { locale: fr })}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">{session.comment}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {session.photoTaken ? '✓' : '✗'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(session)}
                              className="text-brand-pink hover:text-brand-pink/80"
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

export default AdvanceLiftTab;