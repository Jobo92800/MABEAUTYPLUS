import React from 'react';
import { useFormData } from '../../../hooks/useFormData';
import { getFormValue, isFieldChecked } from '../../../services/formData';
import SectionTitle from '../../SectionTitle';
import type { FullClientData } from '../../../types/client';

interface RadiofrequencyMesojetFormProps {
  initialData?: FullClientData;
}

const RadiofrequencyMesojetForm: React.FC<RadiofrequencyMesojetFormProps> = ({ initialData }) => {
  const { formData, loading, error } = useFormData(
    initialData?.client.id,
    'radiofrequency-mesojet'
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
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Relâchement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {[1, 2, 3].map((index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <input
                      type="text"
                      name={`RFmesojetBilan.zone${index}.name`}
                      defaultValue={getFormValue(formData, `RFmesojetBilan.zone${index}.name`)}
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
                            name={`RFmesojetBilan.zone${index}.cellulite.${type.id}`}
                            defaultChecked={isFieldChecked(formData, `RFmesojetBilan.zone${index}.cellulite.${type.id}`)}
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
                            name={`RFmesojetBilan.zone${index}.stage`}
                            value={stage}
                            defaultChecked={Number(getFormValue(formData, `RFmesojetBilan.zone${index}.stage`)) === stage}
                            className="text-brand-blue focus:ring-brand-pink h-4 w-4 border-gray-300"
                          />
                          <span className="ml-2 text-sm">{stage}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name={`RFmesojetBilan.zone${index}.relaxation`}
                          value="true"
                          defaultChecked={isFieldChecked(formData, `RFmesojetBilan.zone${index}.relaxation`)}
                          className="text-brand-blue focus:ring-brand-pink h-4 w-4 border-gray-300"
                        />
                        <span className="ml-2 text-sm">Oui</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name={`RFmesojetBilan.zone${index}.relaxation`}
                          value="false"
                          defaultChecked={!isFieldChecked(formData, `RFmesojetBilan.zone${index}.relaxation`)}
                          className="text-brand-blue focus:ring-brand-pink h-4 w-4 border-gray-300"
                        />
                        <span className="ml-2 text-sm">Non</span>
                      </label>
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
            { id: 'tobacco', label: 'Tabac' },
            { id: 'alcohol', label: 'Alcool' },
            { id: 'stress', label: 'Stress' },
            { id: 'poorSleep', label: 'Sommeil médiocre' },
            { id: 'dehydration', label: 'Manque d\'hydratation' },
            { id: 'richDiet', label: 'Alimentation riche (sucre, gras...)' },
            { id: 'sedentary', label: 'Sédentarité/peu de sport' }
          ].map((item) => (
            <div key={item.id} className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 min-w-[200px]">{item.label}</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`RFmesojetHygiene.${item.id}`}
                    value="true"
                    defaultChecked={isFieldChecked(formData, `RFmesojetHygiene.${item.id}`)}
                    className="text-brand-blue focus:ring-brand-pink"
                  />
                  <span className="ml-2">Oui</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`RFmesojetHygiene.${item.id}`}
                    value="false"
                    defaultChecked={!isFieldChecked(formData, `RFmesojetHygiene.${item.id}`)}
                    className="text-brand-blue focus:ring-brand-pink"
                  />
                  <span className="ml-2">Non</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RadiofrequencyMesojetForm;