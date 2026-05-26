import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Sparkles } from 'lucide-react';
import ClientForm from '../../components/clients/ClientForm';
import CureFormModal from '../../components/clients/CureFormModal';
import { saveClient, saveCureData } from '../../services/database';
import { updateClientSoinsInAirtable } from '../../services/airtable';
import type { ClientCureData } from '../../types/client';

// Maps the treatment ID (from the "Sélection du soin" section) to its care service ID
// so we can resolve the Airtable "Soins" label even without a CureFormModal payload.
const TREATMENT_TO_CARE_SERVICE: Record<string, string> = {
  luxotherapy:            'luxo-pdp',
  relaxation:             'luxo-relax',
  menopause:              'luxo-meno',
  ishape:                 'ishape',
  cavitalyse:             'cavitalyse',
  adipology:              'adipologie',
  pressodynamie:          'presso',
  'mesojet-corps':        'meso-corps',
  mesojet:                'meso-visage',
  'radiofrequency-mesojet': 'meso-corps',
  'advance-lift':         'advance-lift',
  psio:                   'psio',
};

interface CurePayload extends ClientCureData {
  firstName?: string;
  lastName?: string;
}

const NewClientPage = () => {
  const navigate = useNavigate();
  const { centerId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCureForm, setShowCureForm] = useState(false);
  const pendingCureRef = useRef<CurePayload | null>(null);

  const handleCureData = (payload: CurePayload) => {
    pendingCureRef.current = payload;
    // Préremplir les champs firstName / lastName du formulaire principal
    if (payload.firstName) {
      const firstNameInput = document.getElementById('firstName') as HTMLInputElement | null;
      if (firstNameInput) firstNameInput.value = payload.firstName;
    }
    if (payload.lastName) {
      const lastNameInput = document.getElementById('lastName') as HTMLInputElement | null;
      if (lastNameInput) lastNameInput.value = payload.lastName;
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (!centerId) {
      toast.error('Centre non spécifié');
      return;
    }
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const clientId = await saveClient(formData, centerId);

      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const treatment = formData.get('treatment') as string;

      // Sauvegarder la cure en attente si elle existe
      if (pendingCureRef.current) {
        try {
          await saveCureData(clientId, pendingCureRef.current);
        } catch {
          toast.error('Client créé mais erreur lors de la sauvegarde de la cure');
        }
      }

      // Synchroniser le champ "Soins" dans Airtable.
      // Priorité : careServiceIds du CureFormModal, sinon traitement sélectionné manuellement.
      const careServiceIds: string[] = pendingCureRef.current?.careServiceIds?.length
        ? pendingCureRef.current.careServiceIds
        : treatment && TREATMENT_TO_CARE_SERVICE[treatment]
          ? [TREATMENT_TO_CARE_SERVICE[treatment]]
          : [];

      if (careServiceIds.length > 0 && firstName && lastName) {
        updateClientSoinsInAirtable(firstName, lastName, centerId, careServiceIds).catch(() => {});
      }

      toast.success('Client ajouté avec succès');
      navigate(`/centers/${centerId}/clients/${clientId}/edit`);
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de la sauvegarde du client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Nouveau Client</h1>
        <button
          onClick={() => setShowCureForm(true)}
          className="flex items-center rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200 bg-brand-pink"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Formulaire Cure
        </button>
      </div>
      <ClientForm onSubmit={handleSubmit} centerId={centerId} />
      {showCureForm && (
        <CureFormModal
          onClose={() => setShowCureForm(false)}
          onCureData={handleCureData}
        />
      )}
    </div>
  );
};

export default NewClientPage;