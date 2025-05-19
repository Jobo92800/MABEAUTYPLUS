import React from 'react';
import { useFormData } from '../../../hooks/useFormData';
import { getFormValue, isFieldChecked } from '../../../services/formData';
import SectionTitle from '../../SectionTitle';
import type { FullClientData } from '../../../types/client';

interface RelaxationFormProps {
  initialData?: FullClientData;
}

const RelaxationForm: React.FC<RelaxationFormProps> = ({ initialData }) => {
  const { formData, loading, error } = useFormData(
    initialData?.client.id,
    'relaxation'
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {/* Bilan santé relaxation */}
      <div className="mt-8 space-y-6">
        <SectionTitle>Bilan santé</SectionTitle>
        <div className="space-y-4">
          <div>
            <label htmlFor="stressReason" className="block text-sm font-medium text-gray-700">
              Pourquoi êtes-vous anxieux(se), nerveux(se), stressé(e) ?
            </label>
            <input
              type="text"
              name="relaxationHealth.stressReason"
              id="stressReason"
              defaultValue={getFormValue(formData, 'relaxationHealth.stressReason')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>

          <div>
            <label htmlFor="symptomsDuration" className="block text-sm font-medium text-gray-700">
              Depuis combien de temps souffrez-vous de cet état ?
            </label>
            <input
              type="text"
              name="relaxationHealth.symptomsDuration"
              id="symptomsDuration"
              defaultValue={getFormValue(formData, 'relaxationHealth.symptomsDuration')}
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
                    id={symptom.id}
                    name={`relaxationHealth.symptoms.${symptom.id}`}
                    defaultChecked={isFieldChecked(formData, `relaxationHealth.symptoms.${symptom.id}`)}
                    value="true"
                    className="h-4 w-4 text-brand-blue focus:ring-brand-pink border-gray-300 rounded"
                  />
                  <label htmlFor={symptom.id} className="ml-2 block text-sm text-gray-900">
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
              name="relaxationHealth.otherSymptoms"
              id="otherSymptoms"
              defaultValue={getFormValue(formData, 'relaxationHealth.otherSymptoms')}
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
                    name={`relaxationLifestyle.${item.id}`}
                    defaultChecked={isFieldChecked(formData, `relaxationLifestyle.${item.id}`)}
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
                    name={`relaxationLifestyle.${item.amountId}`}
                    placeholder="Combien"
                    defaultValue={getFormValue(formData, `relaxationLifestyle.${item.amountId}`)}
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
              name="relaxationLifestyle.physicalActivity"
              id="physicalActivity"
              defaultValue={getFormValue(formData, 'relaxationLifestyle.physicalActivity')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>

          <div>
            <label htmlFor="unbalancedDiet" className="block text-sm font-medium text-gray-700">
              Alimentation déséquilibrée (gras, sucre...)
            </label>
            <input
              type="text"
              name="relaxationLifestyle.unbalancedDiet"
              id="unbalancedDiet"
              defaultValue={getFormValue(formData, 'relaxationLifestyle.unbalancedDiet')}
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
                    name={`relaxationLifestyle.treatment.${treatment.id}`}
                    defaultChecked={isFieldChecked(formData, `relaxationLifestyle.treatment.${treatment.id}`)}
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
                name="relaxationLifestyle.treatment.other"
                placeholder="Autre"
                defaultValue={getFormValue(formData, 'relaxationLifestyle.treatment.other')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RelaxationForm;