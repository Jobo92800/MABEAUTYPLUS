import React from 'react';
import { useFormData } from '../../../hooks/useFormData';
import { getFormValue, isFieldChecked } from '../../../services/formData';
import SectionTitlePink from '../../SectionTitlePink';
import type { FullClientData } from '../../../types/client';

interface MesojetFormProps {
  initialData?: FullClientData;
}

const MesojetForm: React.FC<MesojetFormProps> = ({ initialData }) => {
  const { formData, loading, error } = useFormData(
    initialData?.client.id,
    'mesojet'
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="mt-8 space-y-6">
        <SectionTitlePink>Bilan Mésojet</SectionTitlePink>
        <div className="space-y-6">
          {/* Type de peau */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quel est votre type de peau ?
            </label>
            <div className="flex flex-wrap gap-4">
              {[
                { id: 'dry', label: 'Sèche' },
                { id: 'normal', label: 'Normale' },
                { id: 'oily', label: 'Grasse' },
                { id: 'mixed', label: 'Mixte' },
                { id: 'other', label: 'Autre' }
              ].map((type) => (
                <div key={type.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`skinType.${type.id}`}
                    name={`bilanmeso.skinType.${type.id}`}
                    defaultChecked={isFieldChecked(formData, `bilanmeso.skinType.${type.id}`)}
                    className="h-4 w-4 text-brand-pink focus:ring-brand-pink border-gray-300 rounded"
                  />
                  <label htmlFor={`skinType.${type.id}`} className="ml-2 text-sm text-gray-900">
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Sensibilité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sensibilité de votre peau ?
            </label>
            <div className="flex gap-2">
              {[...Array(11)].map((_, i) => (
                <label key={i} className="flex items-center">
                  <input
                    type="radio"
                    name="bilanmeso.skinSensitivity"
                    value={i}
                    defaultChecked={parseInt(getFormValue(formData, 'bilanmeso.skinSensitivity')) === i}
                    className="text-brand-pink focus:ring-brand-pink"
                  />
                  <span className="ml-1 text-sm">{i}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Problématiques */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Problématiques que vous rencontrez avec votre peau :
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'wrinkles', label: 'Rides' },
                { id: 'acne', label: 'Acné' },
                { id: 'redness', label: 'Rougeurs' },
                { id: 'dehydration', label: 'Manque d\'hydratation' },
                { id: 'skinRelaxation', label: 'Relâchement cutané' }
              ].map((problem) => (
                <div key={problem.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`problems.${problem.id}`}
                    name={`bilanmeso.problems.${problem.id}`}
                    defaultChecked={isFieldChecked(formData, `bilanmeso.problems.${problem.id}`)}
                    className="h-4 w-4 text-brand-pink focus:ring-brand-pink border-gray-300 rounded"
                  />
                  <label htmlFor={`problems.${problem.id}`} className="ml-2 text-sm text-gray-900">
                    {problem.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Souhaits */}
          <div>
            <label htmlFor="wishes" className="block text-sm font-medium text-gray-700">
              Vos souhaits :
            </label>
            <input
              type="text"
              id="wishes"
              name="bilanmeso.wishes"
              defaultValue={getFormValue(formData, 'bilanmeso.wishes')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>

          {/* Exposition soleil */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exposition au soleil ?
            </label>
            <div className="flex gap-2">
              {[...Array(11)].map((_, i) => (
                <label key={i} className="flex items-center">
                  <input
                    type="radio"
                    name="bilanmeso.sunExposure"
                    value={i}
                    defaultChecked={parseInt(getFormValue(formData, 'bilanmeso.sunExposure')) === i}
                    className="text-brand-pink focus:ring-brand-pink"
                  />
                  <span className="ml-1 text-sm">{i}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Routine maquillage */}
          <div>
            <label htmlFor="makeupRoutine" className="block text-sm font-medium text-gray-700">
              Décrivez votre routine maquillage habituelle :
            </label>
            <textarea
              id="makeupRoutine"
              name="bilanmeso.makeupRoutine"
              rows={3}
              defaultValue={getFormValue(formData, 'bilanmeso.makeupRoutine')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>

          {/* Rituel beauté */}
          <div>
            <label htmlFor="beautyRitual" className="block text-sm font-medium text-gray-700">
              Quel est votre rituel beauté quotidien ? :
            </label>
            <textarea
              id="beautyRitual"
              name="bilanmeso.beautyRitual"
              rows={3}
              defaultValue={getFormValue(formData, 'bilanmeso.beautyRitual')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>

          {/* Niveau de pollution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveau de pollution de votre environnement :
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'cooking', label: 'Cuisine' },
                { id: 'smoking', label: 'Tabac' },
                { id: 'alcohol', label: 'Alcool' },
                { id: 'pollution', label: 'Boulot' }
              ].map((item) => (
                <div key={item.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`pollution.${item.id}`}
                    name={`bilanmeso.pollution.${item.id}`}
                    defaultChecked={isFieldChecked(formData, `bilanmeso.pollution.${item.id}`)}
                    className="h-4 w-4 text-brand-pink focus:ring-brand-pink border-gray-300 rounded"
                  />
                  <label htmlFor={`pollution.${item.id}`} className="ml-2 text-sm text-gray-900">
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Moyenne heure de sommeil */}
          <div>
            <label htmlFor="sleepHours" className="block text-sm font-medium text-gray-700">
              Moyenne heure de sommeil :
            </label>
            <input
              type="text"
              id="sleepHours"
              name="bilanmeso.sleepHours"
              defaultValue={getFormValue(formData, 'bilanmeso.sleepHours')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>

          {/* Autres remarques */}
          <div>
            <label htmlFor="otherRemarks" className="block text-sm font-medium text-gray-700">
              Autres remarques :
            </label>
            <input
              type="text"
              id="otherRemarks"
              name="bilanmeso.otherRemarks"
              defaultValue={getFormValue(formData, 'bilanmeso.otherRemarks')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MesojetForm;