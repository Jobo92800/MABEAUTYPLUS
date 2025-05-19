import React, { useState, useEffect } from 'react';
import { useFormData } from '../../../hooks/useFormData';
import { getFormValue, isFieldChecked } from '../../../services/formData';
import { getTotalTreatmentSessions, updateTotalTreatmentSessions } from '../../../services/database/operations/totalSessions';
import SectionTitle from '../../SectionTitle';
import type { FullClientData } from '../../../types/client';

interface IShapeFormProps {
  initialData?: FullClientData;
}

const IShapeForm: React.FC<IShapeFormProps> = ({ initialData }) => {
  const { formData, loading, error } = useFormData(
    initialData?.client.id,
    'ishape'
  );
  const [totalSessions, setTotalSessions] = useState<number>(0);

  useEffect(() => {
    const fetchTotalSessions = async () => {
      if (!initialData?.client.id) return;
      try {
        const total = await getTotalTreatmentSessions(initialData.client.id, 'ishape');
        setTotalSessions(total);
      } catch (error) {
        console.error('Error fetching total sessions:', error);
      }
    };
    fetchTotalSessions();
  }, [initialData?.client.id]);

  const handleTotalSessionsChange = async (value: number) => {
    if (!initialData?.client.id) return;
    try {
      await updateTotalTreatmentSessions(initialData.client.id, 'ishape', value);
      setTotalSessions(value);
    } catch (error) {
      console.error('Error updating total sessions:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {/* Total Sessions Counter */}
      <div className="mt-8 space-y-6">
        <SectionTitle>Séances I-Shape</SectionTitle>
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Nombre total de séances
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={totalSessions}
                onChange={(e) => handleTotalSessionsChange(parseInt(e.target.value) || 0)}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
                min="0"
              />
              <span className="text-sm text-gray-500">séances</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bilan morphologique */}
      <div className="mt-8 space-y-6">
        <SectionTitle>Bilan morphologique</SectionTitle>
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
                  className="text-brand-blue focus:ring-brand-pink"
                />
                <span className="ml-2">inférieure</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="bilanishape.muscleMass"
                  value="normale"
                  defaultChecked={getFormValue(formData, 'bilanishape.muscleMass') === 'normale'}
                  className="text-brand-blue focus:ring-brand-pink"
                />
                <span className="ml-2">normale</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="bilanishape.muscleMass"
                  value="supérieure"
                  defaultChecked={getFormValue(formData, 'bilanishape.muscleMass') === 'supérieure'}
                  className="text-brand-blue focus:ring-brand-pink"
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
                    className="text-brand-blue focus:ring-brand-pink"
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
                  className="text-brand-blue focus:ring-brand-pink"
                />
                <span className="ml-2">Oui</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="bilanishape.stretchedSkin"
                  value="false"
                  defaultChecked={!isFieldChecked(formData, 'bilanishape.stretchedSkin')}
                  className="text-brand-blue focus:ring-brand-pink"
                />
                <span className="ml-2">Non</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Objectifs */}
      <div className="mt-8 space-y-6">
        <SectionTitle>Objectifs</SectionTitle>
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
                className="h-4 w-4 text-brand-blue focus:ring-brand-pink border-gray-300 rounded"
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