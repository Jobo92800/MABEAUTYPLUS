import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PaymentSection from './sections/PaymentSection';
import TreatmentSelection from './sections/TreatmentSelection';
import ContactDetails from './sections/ContactDetails';
import { useTreatmentForm } from './hooks/useTreatmentForm';
import type { FullClientData } from '../../../types/client';

interface ClientFormProps {
  onSubmit: (data: FormData) => void;
  initialData?: FullClientData;
  isSubmitting?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
  const navigate = useNavigate();
  const { selectedTreatment, TreatmentForm } = useTreatmentForm(initialData);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('treatment', selectedTreatment);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <PaymentSection initialData={initialData} />
          <TreatmentSelection initialData={initialData} />
          <ContactDetails initialData={initialData} />
          <TreatmentForm />
        </div>

        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-semibold leading-6 text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              rounded-full px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200
              ${isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-brand-blue hover:shadow-md'
              }
            `}
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ClientForm;