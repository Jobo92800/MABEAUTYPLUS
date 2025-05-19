import React from 'react';
import { useFormData } from '../../../hooks/useFormData';
import { getFormValue, isFieldChecked } from '../../../services/formData';
import SectionTitlePink from '../../SectionTitlePink';
import type { FullClientData } from '../../../types/client';

interface AdvanceLiftFormProps {
  initialData?: FullClientData;
}

const AdvanceLiftForm: React.FC<AdvanceLiftFormProps> = ({ initialData }) => {
  const { formData, loading, error } = useFormData(
    initialData?.client.id,
    'advance-lift'
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {/* Bilan cutané */}
      <div className="mt-8 space-y-6">
        <SectionTitlePink>Bilan cutané - Advance Lift</SectionTitlePink>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de peau :</label>
            <div className="flex flex-wrap gap-4">
              {[
                { id: 'normal', label: 'normale' },
                { id: 'oily', label: 'grasse' },
                { id: 'sensitive', label: 'sensible' },
                { id: 'dry', label: 'sèche' },
                { id: 'dehydrated', label: 'déshydratée' },
                { id: 'mature', label: 'mature' }
              ].map((type) => (
                <div key={type.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`skinType.${type.id}`}
                    name={`bilanAdvancelift.skinType.${type.id}`}
                    defaultChecked={isFieldChecked(formData, `bilanAdvancelift.skinType.${type.id}`)}
                    value="true"
                    className="h-4 w-4 text-brand-pink focus:ring-brand-pink border-gray-300 rounded"
                  />
                  <label htmlFor={`skinType.${type.id}`} className="ml-2 block text-sm text-gray-900 capitalize">
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quels sont les améliorations à apporter sur votre visage :
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { id: 'wrinkles', label: 'rides / ridules' },
                { id: 'complexion', label: 'éclat du teint' },
                { id: 'firmness', label: 'fermeté' },
                { id: 'darkCircles', label: 'poches / cernes' },
                { id: 'decongestion', label: 'décongestion' },
                { id: 'dehydration', label: 'déshydratation' },
                { id: 'sensitivity', label: 'sensibilité' },
                { id: 'shine', label: 'brillance' },
                { id: 'scars', label: 'cicatrices' },
                { id: 'acne', label: 'acné' },
                { id: 'spots', label: 'tâches' }
              ].map((improvement) => (
                <div key={improvement.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`improvements.${improvement.id}`}
                    name={`bilanAdvancelift.improvements.${improvement.id}`}
                    defaultChecked={isFieldChecked(formData, `bilanAdvancelift.improvements.${improvement.id}`)}
                    value="true"
                    className="h-4 w-4 text-brand-pink focus:ring-brand-pink border-gray-300 rounded"
                  />
                  <label htmlFor={`improvements.${improvement.id}`} className="ml-2 block text-sm text-gray-900">
                    {improvement.label}
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Autre :</label>
              <input
                type="text"
                name="bilanAdvancelift.improvements.other"
                defaultValue={getFormValue(formData, 'bilanAdvancelift.improvements.other')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cure et soin conseillé */}
      <div className="mt-8 space-y-6">
        <SectionTitlePink>Cure et soin conseillé - Advance Lift</SectionTitlePink>
        <div className="space-y-4">
          <div>
            <label htmlFor="recommendedTreatment" className="block text-sm font-medium text-gray-700">Soin conseillé :</label>
            <input
              type="text"
              name="cureadvancelift.recommendedTreatment"
              id="recommendedTreatment"
              defaultValue={getFormValue(formData, 'cureadvancelift.recommendedTreatment')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>
          <div>
            <label htmlFor="sessionCount" className="block text-sm font-medium text-gray-700">Nombre de séances :</label>
            <input
              type="text"
              name="cureadvancelift.sessionCount"
              id="sessionCount"
              defaultValue={getFormValue(formData, 'cureadvancelift.sessionCount')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Commentaire :</label>
            <input
              type="text"
              name="cureadvancelift.comment"
              id="comment"
              defaultValue={getFormValue(formData, 'cureadvancelift.comment')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdvanceLiftForm;