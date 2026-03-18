import React from 'react';
import type { FullClientData } from '../../../types/client';

interface PsioFormProps {
  initialData?: FullClientData;
}

const PsioForm: React.FC<PsioFormProps> = ({ initialData }) => {
  const treatmentData = initialData?.psio;

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <h3 className="text-lg font-semibold leading-6 text-brand-blue mb-6">
            Informations sur le traitement PSIO
          </h3>

          <div className="space-y-6">
            <div>
              <label htmlFor="psio_sessions" className="block text-sm font-medium leading-6 text-gray-900">
                Nombre de séances
              </label>
              <input
                type="number"
                name="psio_sessions"
                id="psio_sessions"
                defaultValue={treatmentData?.sessions || ''}
                onWheel={(e) => e.currentTarget.blur()}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="psio_notes" className="block text-sm font-medium leading-6 text-gray-900">
                Notes
              </label>
              <textarea
                name="psio_notes"
                id="psio_notes"
                rows={4}
                defaultValue={treatmentData?.notes || ''}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsioForm;
