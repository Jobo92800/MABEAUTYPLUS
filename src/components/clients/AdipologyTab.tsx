import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, X } from 'lucide-react';
import { getSessions, addSession } from '../../services/database';
import type { Session } from '../../types/session';

interface AdipologyTabProps {
  clientId: string;
  centerId: string;
}

const AdipologyTab: React.FC<AdipologyTabProps> = ({ clientId, centerId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSession, setNewSession] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    comment: '',
    mode: {
      staticMode: { duration: 0 },
      dynamicMode: { duration: 0 }
    },
    measurements: {
      height: { high: '', middle: '', low: '' },
      floorToZone: { high: '', middle: '', low: '' },
      circumference: { high: '', middle: '', low: '' },
      fatFold: '',
      photoTaken: false
    }
  });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSessions(clientId, centerId, 'adipology');
        setSessions(data);
      } catch (err: any) {
        console.error('Error fetching adipology sessions:', err);
        setError('Erreur lors du chargement des séances');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [clientId, centerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSession({
        clientId,
        centerId,
        type: 'adipology',
        date: newSession.date,
        comment: newSession.comment,
        mode: newSession.mode,
        measurements: newSession.measurements,
        number: sessions.length + 1
      });

      // Refresh sessions list
      const updatedSessions = await getSessions(clientId, centerId, 'adipology');
      setSessions(updatedSessions);
      
      // Reset form
      setShowAddForm(false);
      setNewSession({
        date: format(new Date(), 'yyyy-MM-dd'),
        comment: '',
        mode: {
          staticMode: { duration: 0 },
          dynamicMode: { duration: 0 }
        },
        measurements: {
          height: { high: '', middle: '', low: '' },
          floorToZone: { high: '', middle: '', low: '' },
          circumference: { high: '', middle: '', low: '' },
          fatFold: '',
          photoTaken: false
        }
      });
    } catch (error) {
      console.error('Error adding adipology session:', error);
      alert('Erreur lors de l\'ajout de la séance');
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
                Suivi des séances & prises de mesures
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
                    <label htmlFor="staticDuration" className="block text-sm font-medium text-gray-700">
                      Durée mode statique (min)
                    </label>
                    <input
                      type="number"
                      name="staticDuration"
                      id="staticDuration"
                      value={newSession.mode.staticMode.duration || ''}
                      onChange={(e) => setNewSession({
                        ...newSession,
                        mode: {
                          ...newSession.mode,
                          staticMode: { duration: parseInt(e.target.value) }
                        }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="dynamicDuration" className="block text-sm font-medium text-gray-700">
                      Durée mode dynamique (min)
                    </label>
                    <input
                      type="number"
                      name="dynamicDuration"
                      id="dynamicDuration"
                      value={newSession.mode.dynamicMode.duration || ''}
                      onChange={(e) => setNewSession({
                        ...newSession,
                        mode: {
                          ...newSession.mode,
                          dynamicMode: { duration: parseInt(e.target.value) }
                        }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                    />
                  </div>
                </div>

                {/* Comment Field */}
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                    Commentaire
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows={3}
                    value={newSession.comment}
                    onChange={(e) => setNewSession({ ...newSession, comment: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                    placeholder="Ajouter un commentaire..."
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Mesures</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {['high', 'middle', 'low'].map((position) => (
                      <div key={position} className="space-y-4">
                        <h5 className="text-sm font-medium text-gray-700 capitalize">
                          {position === 'high' ? 'Haut' : position === 'middle' ? 'Milieu' : 'Bas'}
                        </h5>
                        <div>
                          <label className="block text-xs text-gray-500">Du sol à la zone (cm)</label>
                          <input
                            type="text"
                            value={newSession.measurements.floorToZone[position as keyof typeof newSession.measurements.floorToZone]}
                            onChange={(e) => setNewSession({
                              ...newSession,
                              measurements: {
                                ...newSession.measurements,
                                floorToZone: {
                                  ...newSession.measurements.floorToZone,
                                  [position]: e.target.value
                                }
                              }
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Circonférence (cm)</label>
                          <input
                            type="text"
                            value={newSession.measurements.circumference[position as keyof typeof newSession.measurements.circumference]}
                            onChange={(e) => setNewSession({
                              ...newSession,
                              measurements: {
                                ...newSession.measurements,
                                circumference: {
                                  ...newSession.measurements.circumference,
                                  [position]: e.target.value
                                }
                              }
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pli graisseux (cm)</label>
                      <input
                        type="text"
                        value={newSession.measurements.fatFold}
                        onChange={(e) => setNewSession({
                          ...newSession,
                          measurements: {
                            ...newSession.measurements,
                            fatFold: e.target.value
                          }
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSession.measurements.photoTaken}
                        onChange={(e) => setNewSession({
                          ...newSession,
                          measurements: {
                            ...newSession.measurements,
                            photoTaken: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-brand-blue focus:ring-brand-pink border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Photo prise
                      </label>
                    </div>
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

          <div className="mt-6 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">N°</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mode statique</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mode dynamique</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Commentaire</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sessions.map((session) => (
                      <tr key={session.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{session.number}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {format(new Date(session.date), 'dd MMMM yyyy', { locale: fr })}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {session.mode.staticMode.duration} min
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {session.mode.dynamicMode.duration} min
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {session.comment || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {sessions.map((session) => (
            <div key={session.id} className="mt-8">
              <h3 className="text-lg font-medium text-white bg-brand-blue p-3 rounded-lg shadow-sm">
                Séance {session.number} - {format(new Date(session.date), 'dd MMMM yyyy', { locale: fr })}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Hauteur de la zone</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Du sol à la zone</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Circonférence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {['high', 'middle', 'low'].map((position) => (
                      <tr key={position}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                          {position === 'high' ? 'Haut' : position === 'middle' ? 'Milieu' : 'Bas'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {session.measurements.floorToZone[position as keyof typeof session.measurements.floorToZone]} cm
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {session.measurements.circumference[position as keyof typeof session.measurements.circumference]} cm
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex justify-between text-sm">
                  <div>Pli graisseux : {session.measurements.fatFold} cm</div>
                  <div>
                    Photo {session.number === 1 ? '"avant"' : '"après"'} : {session.measurements.photoTaken ? '✓' : '✗'}
                  </div>
                  {session.comment && (
                    <div className="text-gray-600">
                      Commentaire : {session.comment}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdipologyTab;