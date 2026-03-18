import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, X } from 'lucide-react';
import { getMeasurements, addMeasurement } from '../../services/database';

interface MeasurementsTabProps {
  clientId: number;
}

const MeasurementsTab: React.FC<MeasurementsTabProps> = ({ clientId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newWeight, setNewWeight] = useState('');

  const measurements = useLiveQuery(
    () => getMeasurements(clientId),
    [clientId],
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newWeight) return;

    try {
      await addMeasurement(clientId, {
        date: newDate,
        weight: parseFloat(newWeight),
      });
      setShowAddForm(false);
      setNewDate(format(new Date(), 'yyyy-MM-dd'));
      setNewWeight('');
    } catch (error) {
      console.error('Error adding measurement:', error);
      alert('Une erreur est survenue lors de l\'ajout de la mesure.');
    }
  };

  const chartData = measurements?.map(m => ({
    date: format(new Date(m.date), 'dd/MM/yyyy'),
    weight: m.weight,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Tableau des mesures */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-base font-semibold leading-6 text-gray-900">
                Suivi des mesures
              </h2>
              <p className="mt-2 text-sm text-gray-700">
                Liste des mesures prises lors des séances
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="flex items-center rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une mesure
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-900">Nouvelle mesure</h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
                    onWheel={(e) => e.currentTarget.blur()}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Poids (kg)
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Variation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {measurements.map((measurement, index) => {
                      const previousWeight = index > 0 ? measurements[index - 1].weight : measurement.weight;
                      const variation = measurement.weight - previousWeight;
                      const variationText = variation === 0 ? '=' : (variation > 0 ? `+${variation.toFixed(1)}` : variation.toFixed(1));
                      const variationClass = variation === 0 ? 'text-gray-500' : (variation > 0 ? 'text-red-600' : 'text-green-600');

                      return (
                        <tr key={measurement.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                            {format(new Date(measurement.date), 'dd MMMM yyyy', { locale: fr })}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {measurement.weight.toFixed(1)}
                          </td>
                          <td className={`whitespace-nowrap px-3 py-4 text-sm ${variationClass}`}>
                            {variationText}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4">
        <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
          Évolution du poids
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#EC4899"
                strokeWidth={2}
                dot={{ fill: '#EC4899' }}
                name="Poids (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MeasurementsTab; 