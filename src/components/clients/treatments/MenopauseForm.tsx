import React from 'react';
import { useFormData } from '../../../hooks/useFormData';
import { getFormValue, isFieldChecked } from '../../../services/formData';
import SectionTitle from '../../SectionTitle';
import type { FullClientData } from '../../../types/client';

interface MenopauseFormProps {
  initialData?: FullClientData;
}

const MenopauseForm: React.FC<MenopauseFormProps> = ({ initialData }) => {
  const { formData, loading, error } = useFormData(
    initialData?.client.id,
    'menopause'
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {/* Bilan santé ménopause */}
      <div className="mt-8 space-y-6">
        <SectionTitle>Bilan santé</SectionTitle>
        <div className="space-y-4">
          <div>
            <label htmlFor="hormonalStatus" className="block text-sm font-medium text-gray-700">
              Où en êtes-vous sur le plan hormonal (pré-ménopause, ménopause) ?
            </label>
            <input
              type="text"
              name="menopauseHealth.hormonalStatus"
              id="hormonalStatus"
              defaultValue={getFormValue(formData, 'menopauseHealth.hormonalStatus')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>

          <div>
            <label htmlFor="lastPeriodDate" className="block text-sm font-medium text-gray-700">
              De quand remontent les dernières règles ?
            </label>
            <input
              type="text"
              name="menopauseHealth.lastPeriodDate"
              id="lastPeriodDate"
              defaultValue={getFormValue(formData, 'menopauseHealth.lastPeriodDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>

          <div>
            <label htmlFor="symptomsDuration" className="block text-sm font-medium text-gray-700">
              Depuis combien de temps souffrez-vous de cet état ?
            </label>
            <input
              type="text"
              name="menopauseHealth.symptomsDuration"
              id="symptomsDuration"
              defaultValue={getFormValue(formData, 'menopauseHealth.symptomsDuration')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quels sont les symptômes :</label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { id: 'sleepDisorders', label: 'Troubles du sommeil' },
                { id: 'concentrationDisorders', label: 'Troubles de la concentration' },
                { id: 'foodCompulsions', label: 'Compulsions alimentaires' },
                { id: 'hotFlashes', label: 'Palpitations, bouffées de chaleur' },
                { id: 'skinProblems', label: 'Problèmes cutanés' },
                { id: 'moodDisorders', label: 'Irritabilité, troubles de l\'humeur' }
              ].map((symptom) => (
                <div key={symptom.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`symptoms.${symptom.id}`}
                    name={`menopauseHealth.symptoms.${symptom.id}`}
                    defaultChecked={isFieldChecked(formData, `menopauseHealth.symptoms.${symptom.id}`)}
                    value="true"
                    className="h-4 w-4 text-brand-blue focus:ring-brand-pink border-gray-300 rounded"
                  />
                  <label htmlFor={`symptoms.${symptom.id}`} className="ml-2 block text-sm text-gray-900">
                    {symptom.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="otherSymptoms" className="block text-sm font-medium text-gray-700">Autre</label>
            <input
              type="text"
              name="menopauseHealth.otherSymptoms"
              id="otherSymptoms"
              defaultValue={getFormValue(formData, 'menopauseHealth.otherSymptoms')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>
        </div>
      </div>

      {/* Bilan alimentaire & hygiène de vie */}
      <div className="mt-8 space-y-6">
        <SectionTitle>Bilan alimentaire & hygiène de vie</SectionTitle>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { id: 'coffee', label: 'Café', amountId: 'coffeeAmount' },
              { id: 'tea', label: 'Thé', amountId: 'teaAmount' },
              { id: 'alcohol', label: 'Alcool', amountId: 'alcoholAmount' },
              { id: 'tobacco', label: 'Tabac', amountId: 'tobaccoAmount' }
            ].map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={item.id}
                    name={`menopauseLifestyle.${item.id}`}
                    defaultChecked={isFieldChecked(formData, `menopauseLifestyle.${item.id}`)}
                    value="true"
                    className="h-4 w-4 text-brand-blue focus:ring-brand-pink border-gray-300 rounded"
                  />
                  <label htmlFor={item.id} className="ml-2 text-sm text-gray-900">
                    {item.label}
                  </label>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    name={`menopauseLifestyle.${item.amountId}`}
                    placeholder="Combien"
                    defaultValue={getFormValue(formData, `menopauseLifestyle.${item.amountId}`)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="physicalActivity" className="block text-sm font-medium text-gray-700">Activité physique</label>
            <input
              type="text"
              name="menopauseLifestyle.physicalActivity"
              id="physicalActivity"
              defaultValue={getFormValue(formData, 'menopauseLifestyle.physicalActivity')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>

          <div>
            <label htmlFor="unbalancedDiet" className="block text-sm font-medium text-gray-700">
              Alimentation déséquilibrée (gras, sucre...)
            </label>
            <input
              type="text"
              name="menopauseLifestyle.unbalancedDiet"
              id="unbalancedDiet"
              defaultValue={getFormValue(formData, 'menopauseLifestyle.unbalancedDiet')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Traitement :</label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { id: 'antidepressant', label: 'Antidépresseur' },
                { id: 'anxiolytic', label: 'Anxiolytique' },
                { id: 'sleepingPills', label: 'Somnifère' }
              ].map((treatment) => (
                <div key={treatment.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={treatment.id}
                    name={`menopauseLifestyle.treatment.${treatment.id}`}
                    defaultChecked={isFieldChecked(formData, `menopauseLifestyle.treatment.${treatment.id}`)}
                    value="true"
                    className="h-4 w-4 text-brand-blue focus:ring-brand-pink border-gray-300 rounded"
                  />
                  <label htmlFor={treatment.id} className="ml-2 block text-sm text-gray-900">
                    {treatment.label}
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <input
                type="text"
                name="menopauseLifestyle.treatment.other"
                placeholder="Autre"
                defaultValue={getFormValue(formData, 'menopauseLifestyle.treatment.other')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenopauseForm;