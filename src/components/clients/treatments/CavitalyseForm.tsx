import React from 'react';
import { useFormData } from '../../../hooks/useFormData';
import { getFormValue, isFieldChecked } from '../../../services/formData';
import SectionTitle from '../../SectionTitle';
import type { FullClientData } from '../../../types/client';

interface CavitalyseFormProps {
  initialData?: FullClientData;
}

const CavitalyseForm: React.FC<CavitalyseFormProps> = ({ initialData }) => {
  const { formData, loading, error } = useFormData(
    initialData?.client.id,
    'cavitalyse'
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {/* Bilan de peau et zone(s) à traiter */}
      <div className="mt-8 space-y-6">
        <SectionTitle>Bilan de peau et zone(s) à traiter</SectionTitle>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Zone</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cellulite</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {[1, 2, 3].map((index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <input
                      type="text"
                      name={`cavitalyseSkin.zone${index}.name`}
                      defaultValue={getFormValue(formData, `cavitalyseSkin.zone${index}.name`)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex space-x-4">
                      {[
                        { id: 'fibreuse', label: 'fibreuse' },
                        { id: 'adipeuse', label: 'adipeuse' },
                        { id: 'aqueuse', label: 'aqueuse' }
                      ].map((type) => (
                        <label key={type.id} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name={`cavitalyseSkin.zone${index}.cellulite.${type.id}`}
                            defaultChecked={isFieldChecked(formData, `cavitalyseSkin.zone${index}.cellulite.${type.id}`)}
                            value="true"
                            className="text-brand-blue focus:ring-brand-pink h-4 w-4 rounded border-gray-300"
                          />
                          <span className="ml-2 text-sm">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex space-x-4">
                      {[1, 2, 3, 4].map((stage) => (
                        <label key={stage} className="inline-flex items-center">
                          <input
                            type="radio"
                            name={`cavitalyseSkin.zone${index}.stage`}
                            value={stage}
                            defaultChecked={Number(getFormValue(formData, `cavitalyseSkin.zone${index}.stage`)) === stage}
                            className="text-brand-blue focus:ring-brand-pink h-4 w-4 border-gray-300"
                          />
                          <span className="ml-2 text-sm">{stage}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hygiène de vie et santé */}
      <div className="mt-8 space-y-6">
        <SectionTitle>Hygiène de vie et santé</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { id: 'menopause', label: 'Ménopause' },
            { id: 'hypothyroidism', label: 'Hypothyroïdie' },
            { id: 'smokingStopped', label: 'Arrêt du tabac' },
            { id: 'alcohol', label: 'Alcool' },
            { id: 'stress', label: 'Stress' },
            { id: 'fattyLiver', label: 'Foie gras' },
            { id: 'poorSleep', label: 'Sommeil médiocre' },
            { id: 'slowMetabolism', label: 'Métabolisme lent' },
            { id: 'hormonalContraception', label: 'Contraception hormonale' },
            { id: 'richDiet', label: 'Alimentation riche (sucre, gras...)' },
            { id: 'sedentary', label: 'Sédentarité/peu de sport' },
            { id: 'digestiveProblems', label: 'Constipation/Problèmes digestifs' },
            { id: 'bloodTriglycerides', label: 'Triglycérides sanguins' },
            { id: 'geneticOverweight', label: 'Surpoids génétique' }
          ].map((item) => (
            <div key={item.id} className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 min-w-[200px]">{item.label}</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`cavitalyseLifestyle.${item.id}`}
                    value="true"
                    defaultChecked={isFieldChecked(formData, `cavitalyseLifestyle.${item.id}`)}
                    className="text-brand-blue focus:ring-brand-pink"
                  />
                  <span className="ml-2">Oui</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`cavitalyseLifestyle.${item.id}`}
                    value="false"
                    defaultChecked={!isFieldChecked(formData, `cavitalyseLifestyle.${item.id}`)}
                    className="text-brand-blue focus:ring-brand-pink"
                  />
                  <span className="ml-2">Non</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cure et techniques utilisées */}
      <div className="mt-8 space-y-6">
        <SectionTitle>Cure et techniques utilisées</SectionTitle>
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
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
                    className="text-brand-blue focus:ring-brand-pink border-gray-300 rounded"
                  />
                  <span className="ml-2">{technique.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CavitalyseForm;