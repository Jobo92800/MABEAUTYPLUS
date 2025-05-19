import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMeasurements, addMeasurement, updateTotalSessions, getTotalSessions } from '../../services/database';
import type { Measurement } from '../../types/measurements';
import SessionRow from '../sessions/SessionRow';

interface SessionsTabProps {
  clientId: string;
  centerId: string;
}

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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [measurementsData, totalSessionsData] = await Promise.all([
        getMeasurements(clientId, centerId),
        getTotalSessions(clientId)
      ]);
      setMeasurements(measurementsData);
      setTotalSessions(totalSessionsData || 0);
    } catch (error) {
      console.error('Error fetching measurements:', error);
      setError('Error loading measurements');
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
        photoTaken
      });
      
      // Decrement total sessions count
      const newTotalSessions = Math.max(0, totalSessions - 1);
      await updateTotalSessions(clientId, newTotalSessions);
      setTotalSessions(newTotalSessions);
      
      setShowAddForm(false);
      setNewDate(format(new Date(), 'yyyy-MM-dd'));
      setNewWeight('');
      setNewComment('');
      setPhotoTaken(false);
      await fetchData();
    } catch (error) {
      console.error('Error adding measurement:', error);
      alert('Une erreur est survenue lors de l\'ajout de la mesure.');
    }
  };

  const handleTotalSessionsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    try {
      await updateTotalSessions(clientId, value);
      setTotalSessions(value);
    } catch (error) {
      console.error('Error updating total sessions:', error);
      alert('Une erreur est survenue lors de la mise à jour du nombre total de séances.');
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {measurements.length >= 2 && (
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Perte de poids totale depuis le début de la cure
              </h3>
              <div className={`text-2xl font-bold ${
                measurements[0].weight - measurements[measurements.length - 1].weight > 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {(measurements[0].weight - measurements[measurements.length - 1].weight).toFixed(1)} kg
              </div>
            </div>
          </div>
        )}

        {/* Total Sessions Input */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Séances perte de poids
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={totalSessions}
                onChange={handleTotalSessionsChange}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
                min="0"
              />
              <span className="text-sm text-gray-500">séances</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-base font-semibold leading-6 text-gray-900">
                Suivi des séances
              </h2>
              <p className="mt-2 text-sm text-gray-700">
                Liste des mesures prises lors des séances
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
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
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
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
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
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="photoTaken"
                    checked={photoTaken}
                    onChange={(e) => setPhotoTaken(e.target.checked)}
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
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Poids (kg)</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Variation</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Commentaire</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Photo</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[...measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((measurement, index, arr) => (
                        <tr key={measurement.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                            {arr.length - index}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {format(new Date(measurement.date), 'dd MMMM yyyy', { locale: fr })}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {measurement.weight.toFixed(1)}
                          </td>
                          <td className={`whitespace-nowrap px-3 py-4 text-sm ${
                            index === arr.length - 1 ? 'text-gray-500' :
                            measurement.weight - arr[index + 1].weight > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {index === arr.length - 1 ? '=' : 
                              (measurement.weight - arr[index + 1].weight > 0 ? '+' : '') +
                              (measurement.weight - arr[index + 1].weight).toFixed(1)
                            }
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {measurement.comment || '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {measurement.photoTaken ? '✓' : '✗'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                            <SessionRow
                              session={measurement}
                              onUpdate={fetchData}
                              previousWeight={index < arr.length - 1 ? arr[index + 1].weight : undefined}
                            />
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

      {/* Weight Evolution Chart */}
      {measurements.length > 0 && (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4">
          <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
            Évolution du poids
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...measurements]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(m => ({
                  date: format(new Date(m.date), 'dd/MM'),
                  weight: m.weight
                }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#35aedc"
                  strokeWidth={2}
                  dot={{ fill: '#35aedc' }}
                  name="Poids (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsTab;