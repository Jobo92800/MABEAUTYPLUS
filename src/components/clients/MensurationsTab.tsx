import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getMensurations, addMensuration } from '../../services/database';
import type { Mensuration } from '../../types/measurements';
import MensurationRow from '../sessions/MensurationRow';

interface MensurationsTabProps {
  clientId: string;
  centerId: string;
}

const MensurationsTab: React.FC<MensurationsTabProps> = ({ clientId, centerId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [mensurations, setMensurations] = useState<Mensuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMensuration, setNewMensuration] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    bustLine: '',
    underBust: '',
    waist: '',
    belly: '',
    hips: '',
    rightArm: '',
    leftArm: '',
    rightThigh: '',
    leftThigh: '',
    rightCalf: '',
    leftCalf: ''
  });

  const fetchMensurations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMensurations(clientId, centerId);
      setMensurations(data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (error) {
      console.error('Error fetching mensurations:', error);
      setError('Error loading mensurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMensurations();
  }, [clientId, centerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMensuration(clientId, centerId, newMensuration);
      setShowAddForm(false);
      setNewMensuration({
        date: format(new Date(), 'yyyy-MM-dd'),
        bustLine: '',
        underBust: '',
        waist: '',
        belly: '',
        hips: '',
        rightArm: '',
        leftArm: '',
        rightThigh: '',
        leftThigh: '',
        rightCalf: '',
        leftCalf: ''
      });
      await fetchMensurations();
    } catch (error) {
      console.error('Error adding mensuration:', error);
      alert('Error adding mensuration');
    }
  };

  // Calculate total centimeters lost for each measurement
  const calculateTotalLost = () => {
    if (mensurations.length < 2) return null;
    
    const firstMeasurement = mensurations[0];
    const lastMeasurement = mensurations[mensurations.length - 1];

    const calculateDiff = (first: string, last: string) => {
      const firstVal = parseFloat(first) || 0;
      const lastVal = parseFloat(last) || 0;
      return firstVal - lastVal;
    };

    return {
      bustLine: calculateDiff(firstMeasurement.bustLine, lastMeasurement.bustLine),
      underBust: calculateDiff(firstMeasurement.underBust, lastMeasurement.underBust),
      waist: calculateDiff(firstMeasurement.waist, lastMeasurement.waist),
      belly: calculateDiff(firstMeasurement.belly, lastMeasurement.belly),
      hips: calculateDiff(firstMeasurement.hips, lastMeasurement.hips),
      rightArm: calculateDiff(firstMeasurement.rightArm, lastMeasurement.rightArm),
      leftArm: calculateDiff(firstMeasurement.leftArm, lastMeasurement.leftArm),
      rightThigh: calculateDiff(firstMeasurement.rightThigh, lastMeasurement.rightThigh),
      leftThigh: calculateDiff(firstMeasurement.leftThigh, lastMeasurement.leftThigh),
      rightCalf: calculateDiff(firstMeasurement.rightCalf, lastMeasurement.rightCalf),
      leftCalf: calculateDiff(firstMeasurement.leftCalf, lastMeasurement.leftCalf)
    };
  };

  const totalLost = calculateTotalLost();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Total Lost Display */}
      {totalLost && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Upper Body */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Haut du corps</h3>
            <div className="space-y-2">
              {[
                { label: 'Tour de poitrine', value: totalLost.bustLine },
                { label: 'Dessous poitrine', value: totalLost.underBust },
                { label: 'Tour de taille', value: totalLost.waist },
                { label: 'Tour de ventre', value: totalLost.belly },
                { label: 'Tour de hanches', value: totalLost.hips }
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

          {/* Arms */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bras</h3>
            <div className="space-y-2">
              {[
                { label: 'Bras droit', value: totalLost.rightArm },
                { label: 'Bras gauche', value: totalLost.leftArm }
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

          {/* Legs */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Jambes</h3>
            <div className="space-y-2">
              {[
                { label: 'Cuisse droite', value: totalLost.rightThigh },
                { label: 'Cuisse gauche', value: totalLost.leftThigh },
                { label: 'Mollet droit', value: totalLost.rightCalf },
                { label: 'Mollet gauche', value: totalLost.leftCalf }
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

      {/* Mensurations Table */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-base font-semibold leading-6 text-gray-900">
                Mensurations
              </h2>
              <p className="mt-2 text-sm text-gray-700">
                Suivi des mensurations du client
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="flex items-center rounded-full bg-brand-blue px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter des mensurations
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-900">Nouvelles mensurations</h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    required
                    value={newMensuration.date}
                    onChange={(e) => setNewMensuration({ ...newMensuration, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { id: 'bustLine', label: 'Tour de poitrine' },
                    { id: 'underBust', label: 'Dessous poitrine' },
                    { id: 'waist', label: 'Tour de taille' },
                    { id: 'belly', label: 'Tour de ventre' },
                    { id: 'hips', label: 'Tour de hanches' },
                    { id: 'rightArm', label: 'Tour de bras D' },
                    { id: 'leftArm', label: 'Tour de bras G' },
                    { id: 'rightThigh', label: 'Tour de cuisses D' },
                    { id: 'leftThigh', label: 'Tour de cuisses G' },
                    { id: 'rightCalf', label: 'Tour de mollets D' },
                    { id: 'leftCalf', label: 'Tour de mollets G' }
                  ].map((field) => (
                    <div key={field.id}>
                      <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        name={field.id}
                        id={field.id}
                        value={newMensuration[field.id as keyof typeof newMensuration]}
                        onChange={(e) => setNewMensuration({
                          ...newMensuration,
                          [field.id]: e.target.value
                        })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
                      />
                    </div>
                  ))}
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
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tour de poitrine</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Dessous poitrine</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tour de taille</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tour de ventre</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tour de hanches</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tour de bras D/G</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tour de cuisses D/G</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tour de mollets D/G</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[...mensurations].reverse().map((mensuration) => (
                      <MensurationRow
                        key={mensuration.id}
                        mensuration={mensuration}
                        onUpdate={fetchMensurations}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evolution Charts */}
      {mensurations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4">
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
              Évolution Poitrine et Taille
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mensurations.map(m => ({
                  date: format(new Date(m.date), 'dd/MM'),
                  poitrine: parseFloat(m.bustLine) || null,
                  taille: parseFloat(m.waist) || null,
                  ventre: parseFloat(m.belly) || null
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="poitrine" name="Tour de poitrine" stroke="#35aedc" />
                  <Line type="monotone" dataKey="taille" name="Tour de taille" stroke="#f42abe" />
                  <Line type="monotone" dataKey="ventre" name="Tour de ventre" stroke="#10B981" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4">
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
              Évolution Hanches et Cuisses
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mensurations.map(m => ({
                  date: format(new Date(m.date), 'dd/MM'),
                  hanches: parseFloat(m.hips) || null,
                  cuisseDroite: parseFloat(m.rightThigh) || null,
                  cuisseGauche: parseFloat(m.leftThigh) || null
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="hanches" name="Tour de hanches" stroke="#35aedc" />
                  <Line type="monotone" dataKey="cuisseDroite" name="Cuisse droite" stroke="#f42abe" />
                  <Line type="monotone" dataKey="cuisseGauche" name="Cuisse gauche" stroke="#10B981" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MensurationsTab;