import React from 'react';
import { useFormData } from '../../../hooks/useFormData';
import { getFormValue, isFieldChecked } from '../../../services/formData';
import SectionTitle from '../../SectionTitle';
import type { FullClientData } from '../../../types/client';

interface AdipologyFormProps {
  initialData?: FullClientData;
}

const AdipologyForm: React.FC<AdipologyFormProps> = ({ initialData }) => {
  const { formData, loading, error } = useFormData(
    initialData?.client.id,
    'adipology'
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {/* Bilan de peau et zone à traiter */}
      <div className="mt-8 space-y-6">
        <SectionTitle>Bilan de peau et zone à traiter</SectionTitle>
        <div className="space-y-4">
          <div>
            <label htmlFor="treatmentArea" className="block text-sm font-medium text-gray-700">Zone à traiter</label>
            <input
              type="text"
              name="bilanAdipo.treatmentArea"
              id="treatmentArea"
              defaultValue={getFormValue(formData, 'bilanAdipo.treatmentArea')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type de cellulite</label>
            <div className="mt-2 space-x-4">
              {['adipeuse', 'fibreuse', 'aqueuse'].map((type) => (
                <label key={type} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="bilanAdipo.celluliteType"
                    value={type}
                    defaultChecked={getFormValue(formData, 'bilanAdipo.celluliteType') === type}
                    className="text-brand-blue focus:ring-brand-pink"
                  />
                  <span className="ml-2 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Stade de cellulite</label>
            <div className="mt-2 space-x-4">
              {[0, 1, 2, 3].map((stage) => (
                <label key={stage} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="bilanAdipo.celluliteStage"
                    value={stage}
                    defaultChecked={Number(getFormValue(formData, 'bilanAdipo.celluliteStage')) === stage}
                    className="text-brand-blue focus:ring-brand-pink"
                  />
                  <span className="ml-2">{stage}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { id: 'painfulCellulite', label: 'Cellulite douloureuse' },
              { id: 'skinRelaxation', label: 'Relâchement cutané' },
              { id: 'circulationProblems', label: 'Problèmes circulatoires' },
              { id: 'heavyLegs', label: 'Jambes lourdes' }
            ].map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 min-w-[200px]">{item.label}</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`bilanAdipo.${item.id}`}
                      value="true"
                      defaultChecked={isFieldChecked(formData, `bilanAdipo.${item.id}`)}
                      className="text-brand-blue focus:ring-brand-pink"
                    />
                    <span className="ml-2">Oui</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`bilanAdipo.${item.id}`}
                      value="false"
                      defaultChecked={!isFieldChecked(formData, `bilanAdipo.${item.id}`)}
                      className="text-brand-blue focus:ring-brand-pink"
                    />
                    <span className="ml-2">Non</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
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
                    name={`hygieneAdipo.${item.id}`}
                    value="true"
                    defaultChecked={isFieldChecked(formData, `hygieneAdipo.${item.id}`)}
                    className="text-brand-blue focus:ring-brand-pink"
                  />
                  <span className="ml-2">Oui</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`hygieneAdipo.${item.id}`}
                    value="false"
                    defaultChecked={!isFieldChecked(formData, `hygieneAdipo.${item.id}`)}
                    className="text-brand-blue focus:ring-brand-pink"
                  />
                  <span className="ml-2">Non</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="healthParticularities" className="block text-sm font-medium text-gray-700">Particularité(s) de santé</label>
            <input
              type="text"
              name="hygieneAdipo.healthParticularities"
              id="healthParticularities"
              defaultValue={getFormValue(formData, 'hygieneAdipo.healthParticularities')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>
          <div>
            <label htmlFor="medications" className="block text-sm font-medium text-gray-700">Médicament(s)</label>
            <input
              type="text"
              name="hygieneAdipo.medications"
              id="medications"
              defaultValue={getFormValue(formData, 'hygieneAdipo.medications')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>
          <div>
            <label htmlFor="physicalActivity" className="block text-sm font-medium text-gray-700">Activité physique</label>
            <input
              type="text"
              name="hygieneAdipo.physicalActivity"
              id="physicalActivity"
              defaultValue={getFormValue(formData, 'hygieneAdipo.physicalActivity')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>
        </div>
      </div>

      {/* Cure */}
      <div className="mt-8 space-y-6">
        <SectionTitle>Cure</SectionTitle>
        <div>
          <label htmlFor="sessionCount" className="block text-sm font-medium text-gray-700">
            Nombre de séances conseillées
          </label>
          <input
            type="number"
            name="cureAdipo.sessionCount"
            id="sessionCount"
            defaultValue={getFormValue(formData, 'cureAdipo.sessionCount')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
          />
        </div>
      </div>
    </>
  );
};

export default AdipologyForm;