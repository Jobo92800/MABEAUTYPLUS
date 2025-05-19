import { useState, useCallback } from 'react';
import type { FullClientData } from '../../../../types/client';
import { treatmentForms } from '../constants';

export const useTreatmentForm = (initialData?: FullClientData) => {
  const [selectedTreatment, setSelectedTreatment] = useState(
    initialData?.client.treatment || 'luxotherapy'
  );

  const TreatmentForm = useCallback(() => {
    const Component = treatmentForms[selectedTreatment];
    return Component ? <Component initialData={initialData} /> : null;
  }, [selectedTreatment, initialData]);

  return {
    selectedTreatment,
    setSelectedTreatment,
    TreatmentForm
  };
};