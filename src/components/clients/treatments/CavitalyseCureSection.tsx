import React from 'react';
import { getFormValue, isFieldChecked } from '../../../services/formData';

interface CavitalyseCureSectionProps {
  formData: Record<string, any>;
}

const CavitalyseCureSection: React.FC<CavitalyseCureSectionProps> = ({ formData }) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="treatmentZones" className="block text-sm font-medium text-gray-700">
          Zone(s) de traitement
        </label>
        <input
          type="text"
          name="cavitalyseTreatment.zones"
          id="treatmentZones"
          defaultValue={getFormValue(formData, 'cavitalyseTreatment.zones')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      
      <div>
        <label htmlFor="sessionCount" className="block text-sm font-medium text-gray-700">
          Nombre de séances conseillées
        </label>
        <input
          type="number"
          name="cavitalyseTreatment.sessionCount"
          id="sessionCount"
          defaultValue={getFormValue(formData, 'cavitalyseTreatment.sessionCount')}
          onWheel={(e) => e.currentTarget.blur()}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Technique(s) utilisée(s)
        </label>
        <div className="flex space-x-6">
          {[
            { id: 'cavitation', label: 'Cavitation' },
            { id: 'plates', label: 'Plaques' },
            { id: 'radiofrequency', label: 'Radiofréquence' }
          ].map((technique) => (
            <label key={technique.id} className="inline-flex items-center">
              <input
                type="checkbox"
                name={`cavitalyseTreatment.techniques.${technique.id}`}
                defaultChecked={isFieldChecked(formData, `cavitalyseTreatment.techniques.${technique.id}`)}
                value="true"
                className="text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2">{technique.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CavitalyseCureSection;