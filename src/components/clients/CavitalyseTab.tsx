import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getSessions, addSession, deleteSession, updateSession } from '../../services/database';
import type { Session } from '../../types/session';
import { toast } from 'react-hot-toast';

interface CavitalyseTabProps {
  clientId: string;
  centerId: string;
}

const CavitalyseTab: React.FC<CavitalyseTabProps> = ({ clientId, centerId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [newSession, setNewSession] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    intensity: '',
    comment: '',
    measurements: {
      zones: [
        { name: '', floorToZone: '', measure: '', cumulativeLoss: '' },
        { name: '', floorToZone: '', measure: '', cumulativeLoss: '' },
        { name: '', floorToZone: '', measure: '', cumulativeLoss: '' }
      ],
      photoTaken: false
    }
  });

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSessions(clientId, centerId, 'cavitalyse');
      setSessions(data);
    } catch (err: any) {
      console.error('Error fetching cavitalyse sessions:', err);
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
          ...newSession
        });
        toast.success('Séance mise à jour avec succès');
      } else {
        await addSession({
          clientId,
          centerId,
          type: 'cavitalyse',
          date: newSession.date,
          intensity: newSession.intensity,
          comment: newSession.comment,
          measurements: newSession.measurements,
          number: sessions.length + 1
        });
        toast.success('Séance ajoutée avec succès');
      }

      // Refresh sessions
      await fetchSessions();
      
      // Reset form
      setShowAddForm(false);
      setEditingSession(null);
      setNewSession({
        date: format(new Date(), 'yyyy-MM-dd'),
        intensity: '',
        comment: '',
        measurements: {
          zones: [
            { name: '', floorToZone: '', measure: '', cumulativeLoss: '' },
            { name: '', floorToZone: '', measure: '', cumulativeLoss: '' },
            { name: '', floorToZone: '', measure: '', cumulativeLoss: '' }
          ],
          photoTaken: false
        }
      });
    } catch (error) {
      console.error('Error saving cavitalyse session:', error);
      toast.error('Erreur lors de l\'enregistrement de la séance');
    }
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setNewSession({
      date: session.date,
      intensity: session.intensity || '',
      comment: session.comment || '',
      measurements: session.measurements || {
        zones: [
          { name: '', floorToZone: '', measure: '', cumulativeLoss: '' },
          { name: '', floorToZone: '', measure: '', cumulativeLoss: '' },
          { name: '', floorToZone: '', measure: '', cumulativeLoss: '' }
        ],
        photoTaken: false
      }
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
                      className="mt -1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="intensity" className="block text-sm font-medium text-gray-700">
                      Intensité
                    </label>
                    <input
                      type="text"
                      name="intensity"
                      id="intensity"
                      value={newSession.intensity}
                      onChange={(e) => setNewSession({ ...newSession, intensity: e.target.value })}
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {newSession.measurements.zones.map((zone, index) => (
                    <div key={index} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Zone {index + 1}</label>
                        <input
                          type="text"
                          value={zone.name}
                          onChange={(e) => {
                            const newZones = [...newSession.measurements.zones];
                            newZones[index] = { ...zone, name: e.target.value };
                            setNewSession({
                              ...newSession,
                              measurements: { ...newSession.measurements, zones: newZones }
                            });
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                          placeholder="Nom de la zone"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Du sol à la zone (cm)</label>
                        <input
                          type="text"
                          value={zone.floorToZone}
                          onChange={(e) => {
                            const newZones = [...newSession.measurements.zones];
                            newZones[index] = { ...zone, floorToZone: e.target.value };
                            setNewSession({
                              ...newSession,
                              measurements: { ...newSession.measurements, zones: newZones }
                            });
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Mesure (cm)</label>
                        <input
                          type="text"
                          value={zone.measure}
                          onChange={(e) => {
                            const newZones = [...newSession.measurements.zones];
                            newZones[index] = { ...zone, measure: e.target.value };
                            setNewSession({
                              ...newSession,
                              measurements: { ...newSession.measurements, zones: newZones }
                            });
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="photoTaken"
                    checked={newSession.measurements.photoTaken}
                    onChange={(e) => setNewSession({
                      ...newSession,
                      measurements: { ...newSession.measurements, photoTaken: e.target.checked }
                    })}
                    className="h-4 w-4 text-brand-blue focus:ring-brand-pink border-gray-300 rounded"
                  />
                  <label htmlFor="photoTaken" className="ml-2 block text-sm text-gray-900">
                    Photo prise
                  </label>
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
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">N°</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Intensité</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Commentaire</th>
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
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{session.intensity}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{session.comment}</td>
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

          {/* Tableau des mesures */}
          {sessions.map((session) => (
            <div key={session.id} className="mt-8">
              <h3 className="text-lg font-medium text-white bg-brand-blue p-3 rounded-lg shadow-sm">
                Séance n° {session.number} - {format(new Date(session.date), 'dd MMMM yyyy', { locale: fr })}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Zone</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Du sol à la zone</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mesures</th>
                      {session.number > 1 && (
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Perte cumulée</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {session.measurements?.zones.map((zone, index) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{zone.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {zone.floorToZone} cm
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {zone.measure} cm
                        </td>
                        {session.number > 1 && (
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {zone.cumulativeLoss} cm
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex justify-end text-sm">
                  <div>
                    Photo {session.number === 1 ? '"avant"' : '"après"'} : {session.measurements?.photoTaken ? '✓' : '✗'}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Graphique d'évolution */}
          {sessions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-white bg-brand-blue p-3 rounded-lg shadow-sm">
                Évolution des mesures
              </h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...sessions].reverse().map(s => ({
                    date: format(new Date(s.date), 'dd/MM'),
                    zone1: parseFloat(s.measurements?.zones[0]?.measure) || null,
                    zone2: parseFloat(s.measurements?.zones[1]?.measure) || null,
                    zone3: parseFloat(s.measurements?.zones[2]?.measure) || null
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="zone1" name="Zone 1" stroke="#35aedc" />
                    <Line type="monotone" dataKey="zone2" name="Zone 2" stroke="#f42abe" />
                    <Line type="monotone" dataKey="zone3" name="Zone 3" stroke="#10B981" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CavitalyseTab;