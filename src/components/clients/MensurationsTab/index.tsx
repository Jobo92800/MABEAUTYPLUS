import React from 'react';
import { Plus } from 'lucide-react';
import { useMensurations } from './hooks/useMensurations';
import MeasurementSummary from './components/MeasurementSummary';
import MeasurementForm from './components/MeasurementForm';
import MeasurementTable from './components/MeasurementTable';
import MeasurementCharts from './components/MeasurementCharts';

interface MensurationsTabProps {
  clientId: string;
  centerId: string;
}

const MensurationsTab: React.FC<MensurationsTabProps> = ({ clientId, centerId }) => {
  const {
    showAddForm,
    setShowAddForm,
    mensurations,
    loading,
    error,
    handleSubmit,
    fetchMensurations,
    totalLost,
    totalSessions,
    setTotalSessions
  } = useMensurations(clientId, centerId);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {totalLost && <MeasurementSummary totalLost={totalLost} />}
        
        {/* Total Sessions Card */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Séances mensurations
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={totalSessions || ''}
                onChange={(e) => setTotalSessions(parseInt(e.target.value) || 0)}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
                min="0"
              />
              <span className="text-sm text-gray-500">séances</span>
            </div>
          </div>
        </div>
      </div>

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
            <MeasurementForm
              onSubmit={handleSubmit}
              onClose={() => setShowAddForm(false)}
            />
          )}

          <MeasurementTable
            mensurations={mensurations}
            onUpdate={fetchMensurations}
          />
        </div>
      </div>

      {mensurations.length > 0 && (
        <MeasurementCharts mensurations={mensurations} />
      )}
    </div>
  );
};

export default MensurationsTab;