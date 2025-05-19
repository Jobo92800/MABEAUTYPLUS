import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ClientForm from '../../components/clients/ClientForm';
import { saveClient } from '../../services/database';

const NewClientPage = () => {
  const navigate = useNavigate();
  const { centerId } = useParams();

  const handleSubmit = async (formData: FormData) => {
    if (!centerId) {
      toast.error('Centre non spécifié');
      return;
    }

    try {
      const clientId = await saveClient(formData, centerId);
      toast.success('Client ajouté avec succès');
      navigate(`/centers/${centerId}/clients/${clientId}/edit`);
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de la sauvegarde du client');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Nouveau Client</h1>
      </div>
      <ClientForm onSubmit={handleSubmit} />
    </div>
  );
};

export default NewClientPage;