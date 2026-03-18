import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getSessions, addSession, deleteSession, updateSession, getTotalTreatmentSessions, updateTotalTreatmentSessions } from '../../services/database';
import type { Session } from '../../types/session';
import { toast } from 'react-hot-toast';

interface IShapeTabProps {
  clientId: string;
  centerId: string;
}

const IShapeTab: React.FC<IShapeTabProps> = ({ clientId, centerId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [newSession, setNewSession] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    comment: '',
    photoTaken: false,
    weight: '',
    measurements: {
      arms: { right: '', left: '' },
      navel: '',
      hips: '',
      buttocks: '',
      thighs: { right: '', left: '' },
      calves: { right: '', left: '' }
    }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sessionsData, totalSessionsData] = await Promise.all([
        getSessions(clientId, centerId, 'ishape'),
        getTotalTreatmentSessions(clientId, 'ishape')
      ]);
      
      // Sort sessions by date (oldest first) and assign sequential numbers
      const sortedSessions = [...sessionsData].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Assign sequential numbers based on chronological order
      const sessionsWithCorrectNumbers = sortedSessions.map((session, index) => ({
        ...session,
        number: index + 1
      }));
      
      setSessions(sessionsWithCorrectNumbers);
      setTotalSessions(totalSessionsData);
    } catch (err) {
      console.error('Error fetching data:', err);
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
          ...newSession
        });
        toast.success('Séance mise à jour avec succès');
      } else {
        // Don't assign a number here - it will be calculated based on chronological order
        await addSession({
          clientId,
          centerId,
          type: 'ishape',
          date: newSession.date,
          comment: newSession.comment,
          photoTaken: newSession.photoTaken,
          weight: newSession.weight && !isNaN(parseFloat(newSession.weight)) ? parseFloat(newSession.weight) : null,
          measurements: newSession.measurements,
          number: 0 // Temporary number, will be recalculated
        });

        // Decrease total sessions count by 1
        const newTotalSessions = Math.max(0, totalSessions - 1);
        await updateTotalTreatmentSessions(clientId, 'ishape', newTotalSessions);
        setTotalSessions(newTotalSessions);
        
        toast.success('Séance ajoutée avec succès');
      }

      await fetchData(); // This will recalculate all numbers
      setShowAddForm(false);
      setEditingSession(null);
      setNewSession({
        date: format(new Date(), 'yyyy-MM-dd'),
        comment: '',
        photoTaken: false,
        weight: '',
        measurements: {
          arms: { right: '', left: '' },
          navel: '',
          hips: '',
          buttocks: '',
          thighs: { right: '', left: '' },
          calves: { right: '', left: '' }
        }
      });
    } catch (error) {
      console.error('Error saving ishape session:', error);
      toast.error('Erreur lors de l\'enregistrement de la séance');
    }
  };

  const handleEdit = async (session: Session) => {
    setEditingSession(session);
    setNewSession({
      date: session.date,
      comment: session.comment || '',
      photoTaken: session.photoTaken || false,
      weight: session.weight?.toString() || '',
      measurements: session.measurements || {
        arms: { right: '', left: '' },
        navel: '',
        hips: '',
        buttocks: '',
        thighs: { right: '', left: '' },
        calves: { right: '', left: '' }
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
      await fetchData(); // This will recalculate all numbers
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Erreur lors de la suppression de la séance');
    }
  };

  const calculateTotalLost = () => {
    if (sessions.length < 2) return null;

    // Use sessions already sorted by date (oldest first)
    const firstSession = sessions[0];
    const lastSession = sessions[sessions.length - 1];

    const calculateDiff = (first: string | undefined, last: string | undefined) => {
      if (!first || !last) return 0;
      const firstVal = parseFloat(first);
      const lastVal = parseFloat(last);
      if (isNaN(firstVal) || isNaN(lastVal)) return 0;
      return firstVal - lastVal;
    };

    return {
      armsRight: calculateDiff(firstSession.measurements?.arms?.right, lastSession.measurements?.arms?.right),
      armsLeft: calculateDiff(firstSession.measurements?.arms?.left, lastSession.measurements?.arms?.left),
      navel: calculateDiff(firstSession.measurements?.navel, lastSession.measurements?.navel),
      hips: calculateDiff(firstSession.measurements?.hips, lastSession.measurements?.hips),
      buttocks: calculateDiff(firstSession.measurements?.buttocks, lastSession.measurements?.buttocks),
      thighsRight: calculateDiff(firstSession.measurements?.thighs?.right, lastSession.measurements?.thighs?.right),
      thighsLeft: calculateDiff(firstSession.measurements?.thighs?.left, lastSession.measurements?.thighs?.left),
      calvesRight: calculateDiff(firstSession.measurements?.calves?.right, lastSession.measurements?.calves?.right),
      calvesLeft: calculateDiff(firstSession.measurements?.calves?.left, lastSession.measurements?.calves?.left)
    };
  };

  const totalLost = calculateTotalLost();

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

  // For display, show sessions in reverse chronological order (newest first)
  const displaySessions = [...sessions].reverse();

  return (
    <div className="space-y-6">
      {/* Total Sessions Counter */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Séances I-Shape
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
      </div>

      {totalLost && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Haut du corps</h3>
            <div className="space-y-2">
              {[
                { label: 'Tour de nombril', value: totalLost.navel },
                { label: 'Tour de hanches', value: totalLost.hips },
                { label: 'Tour de fesses', value: totalLost.buttocks }
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`font-medium ${item.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.value > 0 ? '-' : '+'}{Math.abs(item.value).toFixed(1)} cm
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bras</h3>
            <div className="space-y-2">
              {[
                { label: 'Bras droit', value: totalLost.armsRight },
                { label: 'Bras gauche', value: totalLost.armsLeft }
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`font-medium ${item.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.value > 0 ? '-' : '+'}{Math.abs(item.value).toFixed(1)} cm
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Jambes</h3>
            <div className="space-y-2">
              {[
                { label: 'Cuisse droite', value: totalLost.thighsRight },
                { label: 'Cuisse gauche', value: totalLost.thighsLeft },
                { label: 'Mollet droit', value: totalLost.calvesRight },
                { label: 'Mollet gauche', value: totalLost.calvesLeft }
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`font-medium ${item.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.value > 0 ? '-' : '+'}{Math.abs(item.value).toFixed(1)} cm
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                      Poids (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      id="weight"
                      value={newSession.weight}
                      onChange={(e) => setNewSession({ ...newSession, weight: e.target.value })}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                      placeholder="Ex: 65.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bras</label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500">Droit</label>
                        <input
                          type="text"
                          value={newSession.measurements.arms.right}
                          onChange={(e) => setNewSession({
                            ...newSession,
                            measurements: {
                              ...newSession.measurements,
                              arms: { ...newSession.measurements.arms, right: e.target.value }
                            }
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Gauche</label>
                        <input
                          type="text"
                          value={newSession.measurements.arms.left}
                          onChange={(e) => setNewSession({
                            ...newSession,
                            measurements: {
                              ...newSession.measurements,
                              arms: { ...newSession.measurements.arms, left: e.target.value }
                            }
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombril</label>
                    <input
                      type="text"
                      value={newSession.measurements.navel}
                      onChange={(e) => setNewSession({
                        ...newSession,
                        measurements: { ...newSession.measurements, navel: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hanches</label>
                    <input
                      type="text"
                      value={newSession.measurements.hips}
                      onChange={(e) => setNewSession({
                        ...newSession,
                        measurements: { ...newSession.measurements, hips: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fesses</label>
                    <input
                      type="text"
                      value={newSession.measurements.buttocks}
                      onChange={(e) => setNewSession({
                        ...newSession,
                        measurements: { ...newSession.measurements, buttocks: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cuisses</label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500">Droite</label>
                        <input
                          type="text"
                          value={newSession.measurements.thighs.right}
                          onChange={(e) => setNewSession({
                            ...newSession,
                            measurements: {
                              ...newSession.measurements,
                              thighs: { ...newSession.measurements.thighs, right: e.target.value }
                            }
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Gauche</label>
                        <input
                          type="text"
                          value={newSession.measurements.thighs.left}
                          onChange={(e) => setNewSession({
                            ...newSession,
                            measurements: {
                              ...newSession.measurements,
                              thighs: { ...newSession.measurements.thighs, left: e.target.value }
                            }
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mollets</label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500">Droit</label>
                        <input
                          type="text"
                          value={newSession.measurements.calves.right}
                          onChange={(e) => setNewSession({
                            ...newSession,
                            measurements: {
                              ...newSession.measurements,
                              calves: { ...newSession.measurements.calves, right: e.target.value }
                            }
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Gauche</label>
                        <input
                          type="text"
                          value={newSession.measurements.calves.left}
                          onChange={(e) => setNewSession({
                            ...newSession,
                            measurements: {
                              ...newSession.measurements,
                              calves: { ...newSession.measurements.calves, left: e.target.value }
                            }
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="photoTaken"
                    checked={newSession.photoTaken}
                    onChange={(e) => setNewSession({ ...newSession, photoTaken: e.target.checked })}
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
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Poids (kg)</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Commentaire</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Photo</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displaySessions.map((session) => (
                      <tr key={session.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{session.number}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {format(new Date(session.date), 'dd MMMM yyyy', { locale: fr })}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {session.weight ? `${session.weight} kg` : '-'}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">{session.comment}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {session.photoTaken ? '✓' : '✗'}
                        </td>
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

          {sessions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="text-lg font-medium text-white bg-brand-blue p-3 rounded-lg shadow-sm mb-4">
                  Évolution Bras et Mollets
                </h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sessions.map(s => ({
                      date: format(new Date(s.date), 'dd/MM'),
                      brasDroit: parseFloat(s.measurements?.arms.right) || null,
                      brasGauche: parseFloat(s.measurements?.arms.left) || null,
                      molletDroit: parseFloat(s.measurements?.calves.right) || null,
                      molletGauche: parseFloat(s.measurements?.calves.left) || null
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="brasDroit" name="Bras droit" stroke="#35aedc" connectNulls />
                      <Line type="monotone" dataKey="brasGauche" name="Bras gauche" stroke="#f42abe" connectNulls />
                      <Line type="monotone" dataKey="molletDroit" name="Mollet droit" stroke="#10B981" connectNulls />
                      <Line type="monotone" dataKey="molletGauche" name="Mollet gauche" stroke="#F59E0B" connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="text-lg font-medium text-white bg-brand-blue p-3 rounded-lg shadow-sm mb-4">
                  Évolution Tronc
                </h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sessions.map(s => ({
                      date: format(new Date(s.date), 'dd/MM'),
                      nombril: parseFloat(s.measurements?.navel) || null,
                      hanches: parseFloat(s.measurements?.hips) || null,
                      fesses: parseFloat(s.measurements?.buttocks) || null
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="nombril" name="Nombril" stroke="#35aedc" connectNulls />
                      <Line type="monotone" dataKey="hanches" name="Hanches" stroke="#f42abe" connectNulls />
                      <Line type="monotone" dataKey="fesses" name="Fesses" stroke="#10B981" connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="text-lg font-medium text-white bg-brand-blue p-3 rounded-lg shadow-sm mb-4">
                  Évolution du Poids
                </h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sessions.filter(s => s.weight).map(s => ({
                      date: format(new Date(s.date), 'dd/MM'),
                      poids: s.weight
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="poids" 
                        name="Poids (kg)" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IShapeTab;