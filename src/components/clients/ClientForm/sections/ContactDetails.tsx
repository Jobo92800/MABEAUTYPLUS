import React from 'react';
import { useCity } from '../hooks/useCity';
import SectionTitle from '../../../SectionTitle';
import type { FullClientData } from '../../../../types/client';

interface ContactDetailsProps {
  initialData?: FullClientData;
}

const ContactDetails: React.FC<ContactDetailsProps> = ({ initialData }) => {
  const { city, handlePostalCodeChange, handleCityChange } = useCity(initialData?.client.city);

  return (
    <div className="space-y-6">
      <SectionTitle>Coordonnées</SectionTitle>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Remove therapist field from here */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Nom</label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            defaultValue={initialData?.client.lastName}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
          />
        </div>
        {/* Rest of the contact details fields remain the same */}
        {/* ... */}
      </div>
    </div>
  );
};

export default ContactDetails;