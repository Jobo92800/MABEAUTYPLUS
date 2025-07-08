import React, { useState, useEffect } from 'react';
import { useFormData } from '../../../hooks/useFormData';
import { getFormValue, isFieldChecked } from '../../../services/formData';
import { getTotalTreatmentSessions, updateTotalTreatmentSessions } from '../../../services/database/operations/totalSessions';
import SectionTitle from '../../SectionTitle';
import type { FullClientData } from '../../../types/client';

interface LuxotherapyFormProps {
  initialData?: FullClientData;
}

const LuxotherapyForm: React.FC<LuxotherapyFormProps> = ({ initialData }) => {
  const { formData, loading, error } = useFormData(
    initialData?.client.id,
    'luxotherapy'
  );
  const [totalSessions, setTotalSessions] = useState<number>(0);

  const [weightGoal, setWeightGoal] = useState<number>(0);

  // Charger le nombre total de séances au démarrage
  useEffect(() => {
    const fetchTotalSessions = async () => {
      if (!initialData?.client.id) return;
      try {
        const total = await getTotalTreatmentSessions(initialData.client.id, 'luxotherapy');
        setTotalSessions(total);
      } catch (error) {
        console.error('Error fetching total sessions:', error);
      }
    };
    fetchTotalSessions();
  }, [initialData?.client.id]);

  // Synchroniser avec la valeur du formulaire si elle existe
  useEffect(() => {
    const sessionCountFromForm = parseInt(getFormValue(formData, 'objectives.sessionCount')) || 0;
    if (sessionCountFromForm > 0 && sessionCountFromForm !== totalSessions) {
      setTotalSessions(sessionCountFromForm);
    }
  }, [formData]);

  useEffect(() => {
    const currentWeight = parseFloat(getFormValue(formData, 'objectives.currentWeight')) || 0;
    const targetWeight = parseFloat(getFormValue(formData, 'objectives.targetWeight')) || 0;
    setWeightGoal(Number((currentWeight - targetWeight).toFixed(2)));
  }, [formData]);

  const handleSessionCountChange = async (value: number) => {
    if (!initialData?.client.id) return;
    try {
      await updateTotalTreatmentSessions(initialData.client.id, 'luxotherapy', value);
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
      {/* Bilan santé */}
      <div className="mt-8 space-y-6">
        <SectionTitle>Bilan santé</SectionTitle>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            {[
              { id: 'hypertension', label: 'Hypertension' },
              { id: 'diabetes', label: 'Diabète' },
              { id: 'kidneyDisease', label: 'Maladie rénale' },
              { id: 'epilepsy', label: 'Troubles épileptiques' },
              { id: 'pregnant', label: 'Enceinte' },
              { id: 'stress', label: 'Stress / anxiété' },
              { id: 'waterRetention', label: 'Rétention d\'eau' }
            ].map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 min-w-[150px]">{item.label}</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`bilanluxo.${item.id}`}
                      value="true"
                      defaultChecked={isFieldChecked(formData, `bilanluxo.${item.id}`)}
                      className="text-brand-blue focus:ring-brand-pink"
                    />
                    <span className="ml-2">Oui</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`bilanluxo.${item.id}`}
                      value="false"
                      defaultChecked={!isFieldChecked(formData, `bilanluxo.${item.id}`)}
                      className="text-brand-blue focus:ring-brand-pink"
                    />
                    <span className="ml-2">Non</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {[
              { id: 'thyroid', label: 'Problème de thyroïde' },
              { id: 'hormones', label: 'Hormones / ménopause' },
              { id: 'intestinal', label: 'Troubles intestinaux / transit' },
              { id: 'specificDisease', label: 'Maladie particulière' },
              { id: 'foodIntolerance', label: 'Intolérance alimentaire' },
              { id: 'bariatricSurgery', label: 'Chirurgie bariatrique récente' },
              { id: 'medications', label: 'Médicament(s)' }
            ].map((item) => (
              <div key={item.id}>
                <label htmlFor={item.id} className="block text-sm font-medium text-gray-700">{item.label}</label>
                <input
                  type="text"
                  name={`bilanluxo.${item.id}`}
                  id={item.id}
                  defaultValue={getFormValue(formData, `bilanluxo.${item.id}`)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bilan alimentaire & hygiène de vie */}
      <div className="mt-8 space-y-6">
        <SectionTitle>Bilan alimentaire & hygiène de vie</SectionTitle>
        <div className="space-y-4">
          {[
            { id: 'weightLossAttempt', label: 'Avez-vous déjà essayé de perdre du poids', commentId: 'weightLossAttemptComment', commentLabel: 'Comment' },
            { id: 'excessiveAppetite', label: 'Appétit excessif pendant les repas', commentId: 'excessiveAppetiteComment', commentLabel: 'Quel repas' },
            { id: 'snacking', label: 'Avez-vous des fringales', commentId: 'snackingComment', commentLabel: 'Quand' },
            { id: 'foodCompulsions', label: 'Avez-vous des compulsions alimentaires', commentId: 'foodCompulsionsComment', commentLabel: 'Quand' },
            { id: 'foodAttractions', label: 'Êtes-vous attiré(e) par certains aliments', commentId: 'foodAttractionsComment', commentLabel: 'Lesquels' }
          ].map((item) => (
            <div key={item.id} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">{item.label}</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`bilanluxoalim.${item.id}`}
                    value="true"
                    defaultChecked={isFieldChecked(formData, `bilanluxoalim.${item.id}`)}
                    className="text-brand-blue focus:ring-brand-pink"
                  />
                  <span className="ml-2">Oui</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`bilanluxoalim.${item.id}`}
                    value="false"
                    defaultChecked={!isFieldChecked(formData, `bilanluxoalim.${item.id}`)}
                    className="text-brand-blue focus:ring-brand-pink"
                  />
                  <span className="ml-2">Non</span>
                </label>
              </div>
              <input
                type="text"
                name={`bilanluxoalim.${item.commentId}`}
                placeholder={item.commentLabel}
                defaultValue={getFormValue(formData, `bilanluxoalim.${item.commentId}`)}
                className="rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
              />
            </div>
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Alcool</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="bilanluxoalim.alcohol"
                    value="true"
                    defaultChecked={isFieldChecked(formData, 'bilanluxoalim.alcohol')}
                    className="text-brand-blue focus:ring-brand-pink"
                  />
                  <span className="ml-2">Oui</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="bilanluxoalim.alcohol"
                    value="false"
                    defaultChecked={!isFieldChecked(formData, 'bilanluxoalim.alcohol')}
                    className="text-brand-blue focus:ring-brand-pink"
                  />
                  <span className="ml-2">Non</span>
                </label>
              </div>
              <input
                type="text"
                name="bilanluxoalim.alcoholQuantity"
                placeholder="Combien"
                defaultValue={getFormValue(formData, 'bilanluxoalim.alcoholQuantity')}
                className="ml-4 w-32 rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Tabac</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="bilanluxoalim.tobacco"
                    value="true"
                    defaultChecked={isFieldChecked(formData, 'bilanluxoalim.tobacco')}
                    className="text-brand-blue focus:ring-brand-pink"
                  />
                  <span className="ml-2">Oui</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="bilanluxoalim.tobacco"
                    value="false"
                    defaultChecked={!isFieldChecked(formData, 'bilanluxoalim.tobacco')}
                    className="text-brand-blue focus:ring-brand-pink"
                  />
                  <span className="ml-2">Non</span>
                </label>
              </div>
              <input
                type="text"
                name="bilanluxoalim.tobaccoQuantity"
                placeholder="Combien"
                defaultValue={getFormValue(formData, 'bilanluxoalim.tobaccoQuantity')}
                className="ml-4 w-32 rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
              />
            </div>
          </div>

          <div>
            <label htmlFor="physicalActivities" className="block text-sm font-medium text-gray-700">Activité(s) physique(s)</label>
            <input
              type="text"
              name="bilanluxoalim.physicalActivities"
              id="physicalActivities"
              defaultValue={getFormValue(formData, 'bilanluxoalim.physicalActivities')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>
        </div>
      </div>

      {/* Objectifs */}
      <div className="mt-8 space-y-6">
        <SectionTitle>Objectifs</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
            <label htmlFor="currentWeight" className="block text-sm font-medium text-gray-700">Poids actuel (kg)</label>
            <input
              type="number"
              step="0.1"
              name="objectives.currentWeight"
              id="currentWeight"
              defaultValue={getFormValue(formData, 'objectives.currentWeight')}
              onChange={(e) => {
                const currentWeight = parseFloat(e.target.value) || 0;
                const targetWeight = parseFloat(getFormValue(formData, 'objectives.targetWeight')) || 0;
                setWeightGoal(Number((currentWeight - targetWeight).toFixed(2)));
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>
          <div>
            <label htmlFor="targetWeight" className="block text-sm font-medium text-gray-700">Poids souhaité (kg)</label>
            <input
              type="number"
              step="0.1"
              name="objectives.targetWeight"
              id="targetWeight"
              defaultValue={getFormValue(formData, 'objectives.targetWeight')}
              onChange={(e) => {
                const targetWeight = parseFloat(e.target.value) || 0;
                const currentWeight = parseFloat(getFormValue(formData, 'objectives.currentWeight')) || 0;
                setWeightGoal(Number((currentWeight - targetWeight).toFixed(2)));
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>
          <div>
            <label htmlFor="weightGoal" className="block text-sm font-medium text-gray-700">Objectif (kg)</label>
            <input
              type="number"
              id="weightGoal"
              value={weightGoal}
              readOnly
              className="mt-1 block w-full rounded-md bg-gray-50 border-gray-300 shadow-sm text-gray-500"
            />
          </div>
          <div>
            <label htmlFor="sessionCount" className="block text-sm font-medium text-gray-700">Nb de séances</label>
            <input
              type="number"
              name="objectives.sessionCount"
              id="sessionCount"
              value={totalSessions}
              onChange={(e) => handleSessionCountChange(parseInt(e.target.value) || 0)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default LuxotherapyForm;