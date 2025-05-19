import React from 'react';
import { useFormData } from '../../hooks/useFormData';
import { getFormValue, isFieldChecked } from '../../services/formData';
import type { FullClientData } from '../../types/client';

interface IShapeFormProps {
  initialData?: FullClientData;
}

const IShapeForm: React.FC<IShapeFormProps> = ({ initialData }) => {
  const { formData, loading, error } = useFormData(
    initialData?.client.id,
    'ishape'
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {/* Bilan morphologique */}
      <div className="mt-8 space-y-6">
        <h3 className="text-lg font-semibold bg-primary-100 text-primary-800 p-2 rounded">Bilan morphologique</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Masse musculaire</label>
            <div className="mt-2 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="bilanishape.muscleMass"
                  value="inférieure"
                  defaultChecked={getFormValue(formData, 'bilanishape.muscleMass') === 'inférieure'}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2">inférieure</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="bilanishape.muscleMass"
                  value="normale"
                  defaultChecked={getFormValue(formData, 'bilanishape.muscleMass') === 'normale'}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2">normale</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="bilanishape.muscleMass"
                  value="supérieure"
                  defaultChecked={getFormValue(formData, 'bilanishape.muscleMass') === 'supérieure'}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2">supérieure</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Stade cellulite</label>
            <div className="mt-2 space-x-4">
              {[0, 1, 2, 3, 4].map((stage) => (
                <label key={stage} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="bilanishape.celluliteStage"
                    value={stage}
                    defaultChecked={Number(getFormValue(formData, 'bilanishape.celluliteStage')) === stage}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2">{stage}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Peau distendue</label>
            <div className="mt-2 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="bilanishape.stretchedSkin"
                  value="true"
                  defaultChecked={isFieldChecked(formData, 'bilanishape.stretchedSkin')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2">Oui</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="bilanishape.stretchedSkin"
                  value="false"
                  defaultChecked={!isFieldChecked(formData, 'bilanishape.stretchedSkin')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2">Non</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Objectifs */}
      <div className="mt-8 space-y-6">
        <h3 className="text-lg font-semibold bg-primary-100 text-primary-800 p-2 rounded">Objectifs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: 'tonify', label: 'Tonifier' },
            { id: 'firm', label: 'Raffermir' },
            { id: 'drainage', label: 'Drainage' },
            { id: 'backPain', label: 'Soulagement des maux de dos' },
            { id: 'metabolism', label: 'Augmentation du métabolisme de base' },
            { id: 'muscle', label: 'Muscler' },
            { id: 'cellulite', label: 'Anti cellulite' },
            { id: 'weightLoss', label: 'Perte de poids' }
          ].map((objective) => (
            <div key={objective.id} className="flex items-center">
              <input
                type="checkbox"
                id={objective.id}
                name={`objishape.${objective.id}`}
                defaultChecked={isFieldChecked(formData, `objishape.${objective.id}`)}
                value="true"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor={objective.id} className="ml-2 block text-sm text-gray-900">
                {objective.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default IShapeForm;