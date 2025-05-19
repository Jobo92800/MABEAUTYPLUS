import React from 'react';
import { useHasFormData } from '../../../../hooks/useHasFormData';
import { treatmentCategories } from '../constants';
import type { FullClientData } from '../../../../types/client';

interface TreatmentSelectionProps {
  initialData?: FullClientData;
}

const TreatmentSelection: React.FC<TreatmentSelectionProps> = ({ initialData }) => {
  const [selectedTreatment, setSelectedTreatment] = React.useState(initialData?.client.treatment || 'luxotherapy');

  return (
    <div className="mb-8">
      <label className="text-base font-semibold text-gray-900">Sélectionnez le soin</label>
      <div className="mt-6 space-y-8">
        {treatmentCategories.map((category) => (
          <div key={category.name} className="space-y-4">
            <h3 className="text-lg font-bold text-brand-blue">
              {category.name}
            </h3>
            <div className="flex flex-wrap gap-3">
              {category.treatments.map((treatment) => {
                const { hasData } = useHasFormData(initialData?.client.id, treatment.id as any);
                
                return (
                  <button
                    key={treatment.id}
                    type="button"
                    onClick={() => setSelectedTreatment(treatment.id)}
                    className={`
                      relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300
                      ${selectedTreatment === treatment.id
                        ? 'bg-brand-blue text-white shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 hover:bg-brand-blue/5 border border-brand-blue/20'
                      }
                      ${hasData ? 'ring-2 ring-green-500' : ''}
                    `}
                  >
                    {treatment.label}
                    {hasData && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TreatmentSelection;