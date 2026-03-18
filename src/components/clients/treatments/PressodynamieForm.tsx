import React from 'react';
import { useFormData } from '../../../hooks/useFormData';
import { getFormValue, isFieldChecked } from '../../../services/formData';
import SectionTitle from '../../SectionTitle';
import type { FullClientData } from '../../../types/client';

interface PressodynamieFormProps {
  initialData?: FullClientData;
}

const PressodynamieForm: React.FC<PressodynamieFormProps> = ({ initialData }) => {
  const { formData, loading, error } = useFormData(
    initialData?.client.id,
    'pressodynamie'
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {/* Problématiques */}
      <div className="mt-8 space-y-6">
        <SectionTitle>Problématiques</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { id: 'heavyLegs', label: 'Jambes lourdes' },
            { id: 'edema', label: 'Œdèmes' },
            { id: 'poorUrinaryElimination', label: 'Mauvaise élimination urinaire' },
            { id: 'waterRetention', label: 'Rétention d\'eau' },
            { id: 'constipation', label: 'Constipation' },
            { id: 'poorBloodCirculation', label: 'Mauvaise circulation sanguine' },
            { id: 'slowMetabolism', label: 'Métabolisme lent' }
          ].map((problem) => (
            <div key={problem.id} className="flex items-center">
              <input
                type="checkbox"
                id={problem.id}
                name={`prbpresso.${problem.id}`}
                defaultChecked={isFieldChecked(formData, `prbpresso.${problem.id}`)}
                value="true"
                className="h-4 w-4 text-brand-blue focus:ring-brand-pink border-gray-300 rounded"
              />
              <label htmlFor={problem.id} className="ml-2 block text-sm text-gray-900">
                {problem.label}
              </label>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              id="cellulite"
              name="prbpresso.cellulite"
              defaultChecked={isFieldChecked(formData, 'prbpresso.cellulite')}
              value="true"
              className="h-4 w-4 text-brand-blue focus:ring-brand-pink border-gray-300 rounded"
            />
            <label htmlFor="cellulite" className="text-sm font-medium text-gray-700">Cellulite</label>
            <div className="flex space-x-4">
              <label className="text-sm text-gray-700">Stade :</label>
              {[1, 2, 3].map((stage) => (
                <label key={stage} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="prbpresso.celluliteStage"
                    value={stage}
                    defaultChecked={Number(getFormValue(formData, 'prbpresso.celluliteStage')) === stage}
                    className="text-brand-blue focus:ring-brand-pink"
                  />
                  <span className="ml-2">{stage}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cure */}
      <div className="mt-8 space-y-6">
        <SectionTitle>Cure</SectionTitle>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Technique(s) :</label>
            <div className="flex space-x-6">
              {[
                { id: 'bootsOnly', label: 'bottes seules' },
                { id: 'bootsAndBelt', label: 'bottes + ceinture' }
              ].map((technique) => (
                <label key={technique.id} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name={`curepresso.technique.${technique.id}`}
                    defaultChecked={isFieldChecked(formData, `curepresso.technique.${technique.id}`)}
                    value="true"
                    className="text-brand-blue focus:ring-brand-pink border-gray-300 rounded"
                  />
                  <span className="ml-2">{technique.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="sessionCount" className="block text-sm font-medium text-gray-700">
              Nombre de séances
            </label>
            <input
              type="number"
              name="curepresso.sessionCount"
              id="sessionCount"
              defaultValue={getFormValue(formData, 'curepresso.sessionCount')}
              onWheel={(e) => e.currentTarget.blur()}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PressodynamieForm;