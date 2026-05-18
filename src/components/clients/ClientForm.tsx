import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useFormData } from '../../hooks/useFormData';
import { useHasFormData } from '../../hooks/useHasFormData';
import PaymentForm from '../PaymentForm';
import ReferralSection from '../ReferralSection';
import SectionTitle from '../SectionTitle';
import SectionTitleRed from '../SectionTitleRed';
import CollapsibleSection from '../CollapsibleSection';
import LuxotherapyForm from './treatments/LuxotherapyForm';
import IShapeForm from './treatments/IShapeForm';
import AdipologyForm from './treatments/AdipologyForm';
import MenopauseForm from './treatments/MenopauseForm';
import MesojetForm from './treatments/MesojetForm';
import MesojetCorpsForm from './treatments/MesojetCorpsForm';
import CavitalyseForm from './treatments/CavitalyseForm';
import RadiofrequencyMesojetForm from './treatments/RadiofrequencyMesojetForm';
import AdvanceLiftForm from './treatments/AdvanceLiftForm';
import PressodynamieForm from './treatments/PressodynamieForm';
import RelaxationForm from './treatments/RelaxationForm';
import PsioForm from './treatments/PsioForm';
import { lookupCity, isValidPostalCode } from '../../services/postalCodes';
import type { FullClientData } from '../../types/client';

interface ClientFormProps {
  onSubmit: (data: FormData) => void;
  initialData?: FullClientData;
  centerId?: string;
}

const treatmentCategories = [
  {
    name: 'Luxothérapie',
    treatments: [
      { id: 'luxotherapy', label: 'Perte de Poids' },
      { id: 'relaxation', label: 'Relaxation' },
      { id: 'menopause', label: 'Ménopause' },
    ]
  },
  {
    name: 'Soins Minceur',
    treatments: [
      { id: 'cavitalyse', label: 'Cavita-Lyse' },
      { id: 'radiofrequency-mesojet', label: 'RF Mésojet' },
      { id: 'adipology', label: 'Adipologie' },
      { id: 'ishape', label: 'I-Shape' },
      { id: 'pressodynamie', label: 'Pressodynamie' },
      { id: 'mesojet-corps', label: 'Mésojet Corps' },
    ]
  },
  {
    name: 'Anti-Âge',
    treatments: [
      { id: 'advance-lift', label: 'Advance Lift' },
      { id: 'mesojet', label: 'Mésojet Visage' },
    ]
  },
  {
    name: 'Bien-être',
    treatments: [
      { id: 'psio', label: 'PSIO' },
    ]
  }
];

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, initialData, centerId }) => {
  const navigate = useNavigate();
  const [selectedTreatment, setSelectedTreatment] = useState(initialData?.client.treatment || 'luxotherapy');
  const [city, setCity] = useState(initialData?.client.city || '');

  const currentCenterId = centerId || initialData?.client.centerId;

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const postalCode = e.target.value;
    if (isValidPostalCode(postalCode)) {
      const cities = lookupCity(postalCode);
      if (cities.length === 1) {
        setCity(cities[0]);
        const cityInput = document.getElementById('city') as HTMLInputElement;
        if (cityInput) {
          cityInput.value = cities[0];
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('treatment', selectedTreatment);
    onSubmit(formData);
  };

  const renderTreatmentForm = () => {
    switch (selectedTreatment) {
      case 'luxotherapy':
        return <LuxotherapyForm initialData={initialData} />;
      case 'ishape':
        return <IShapeForm initialData={initialData} />;
      case 'adipology':
        return <AdipologyForm initialData={initialData} />;
      case 'menopause':
        return <MenopauseForm initialData={initialData} />;
      case 'mesojet':
        return <MesojetForm initialData={initialData} />;
      case 'mesojet-corps':
        return <MesojetCorpsForm initialData={initialData} />;
      case 'cavitalyse':
        return <CavitalyseForm initialData={initialData} />;
      case 'radiofrequency-mesojet':
        return <RadiofrequencyMesojetForm initialData={initialData} />;
      case 'advance-lift':
        return <AdvanceLiftForm initialData={initialData} />;
      case 'pressodynamie':
        return <PressodynamieForm initialData={initialData} />;
      case 'relaxation':
        return <RelaxationForm initialData={initialData} />;
      case 'psio':
        return <PsioForm initialData={initialData} />;
      default:
        return <LuxotherapyForm initialData={initialData} />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          {/* Règlement */}
          <CollapsibleSection
            title="Règlement"
            headerClassName="bg-red-500"
            defaultOpen={true}
            className="mb-8"
          >
            <PaymentForm
              formData={initialData}
              prefix="payment"
              clientId={initialData?.client.id}
              centerId={currentCenterId}
              clientFirstName={initialData?.client.firstName}
              clientLastName={initialData?.client.lastName}
            />
          </CollapsibleSection>

          {/* Parrain / Filleuil */}
          <CollapsibleSection
            title="Parrain / Filleuil"
            headerStyle={{ background: 'linear-gradient(to right, #1d6ae5, #e91e8c)' }}
            className="mb-8"
          >
            <ReferralSection clientId={initialData?.client.id} hideHeader />
          </CollapsibleSection>

          {/* Treatment Selection */}
          <CollapsibleSection
            title="Sélection du soin"
            headerClassName="bg-brand-blue"
            className="mb-8"
          >
            <div className="space-y-8 pb-2">
              {treatmentCategories.map((category) => (
                <div key={category.name} className="space-y-4">
                  <h3 className="text-lg font-bold text-brand-blue">
                    {category.name}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {category.treatments.map((treatment) => {
                      const { hasData } = useHasFormData(initialData?.client.id, treatment.id as any);

                      return (
                        <button
                          key={treatment.id}
                          type="button"
                          onClick={() => setSelectedTreatment(treatment.id)}
                          className={`
                            relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300
                            ${selectedTreatment === treatment.id
                              ? 'bg-brand-blue text-white shadow-lg transform scale-105'
                              : 'bg-white text-gray-700 hover:bg-brand-blue/5 border border-brand-blue/20'
                            }
                            ${hasData ? 'ring-2 ring-green-500' : ''}
                          `}
                        >
                          {treatment.label}
                          {hasData && (
                            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Coordonnées */}
          <CollapsibleSection
            title="Coordonnées"
            headerClassName="bg-brand-blue"
            defaultOpen={true}
            className="mb-8"
          >
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  defaultValue={initialData?.client.firstName}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                />
              </div>
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Né(e) le</label>
                <input
                  type="date"
                  name="birthDate"
                  id="birthDate"
                  defaultValue={initialData?.client.birthDate}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                />
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  name="age"
                  id="age"
                  defaultValue={initialData?.client.age}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse</label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  defaultValue={initialData?.client.address}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Code postal</label>
                <input
                  type="text"
                  name="postalCode"
                  id="postalCode"
                  defaultValue={initialData?.client.postalCode}
                  onChange={handlePostalCodeChange}
                  maxLength={5}
                  pattern="[0-9]{5}"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ville</label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  defaultValue={initialData?.client.email}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  defaultValue={initialData?.client.phone}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                />
              </div>
              <div>
                <label htmlFor="referral" className="block text-sm font-medium text-gray-700">Comment nous avez-vous connu ?</label>
                <input
                  type="text"
                  name="referral"
                  id="referral"
                  defaultValue={initialData?.client.referral}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                />
              </div>
              <div>
                <label htmlFor="therapist" className="block text-sm font-medium text-gray-700">Thérapeute</label>
                <input
                  type="text"
                  name="therapist"
                  id="therapist"
                  defaultValue={initialData?.client.therapist}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                />
              </div>
            </div>
          </div>
          </CollapsibleSection>

          {/* Treatment Specific Form */}
          <CollapsibleSection
            title="Fiche soin"
            headerClassName="bg-brand-blue"
            defaultOpen={true}
            className="mb-8"
          >
            {renderTreatmentForm()}
          </CollapsibleSection>
        </div>

        {/* Form Actions */}
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
            className="rounded-full px-6 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200 bg-brand-blue"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </form>
  );
};

export default ClientForm;