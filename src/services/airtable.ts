import { format, parseISO } from 'date-fns';

// Configuration Airtable
const AIRTABLE_ACCESS_TOKEN = 'patl2Z5JpLllHOn7G.eb220d4d725d40eb8e7e748618208cc33c853025400bada00df48dbf37ff41f8';
const AIRTABLE_BASE_ID = 'appI97jEL2mSCg3Wc';
const AIRTABLE_TABLE_ID = 'Clients';

interface AirtableClientData {
  firstName: string;
  lastName: string;
  birthDate: string;
  age: number;
  address: string;
  postalCode: string;
  city: string;
  email: string;
  phone: string;
  referral: string;
  therapist: string;
  centerId: string;
}

export const addClientToAirtable = async (clientData: AirtableClientData): Promise<void> => {
  try {
    const centerNames: Record<string, string> = {
      'grau-du-roi': 'Le Grau-du-Roi',
      'le-cres': 'Le Crès',
      'serignant': 'Sérignan',
      'cabestany': 'Cabestany'
    };

    // Format date for Airtable (YYYY-MM-DD)
    const formattedBirthDate = clientData.birthDate ? 
      format(parseISO(clientData.birthDate), 'yyyy-MM-dd') : 
      undefined;

    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [{
          fields: {
            'Nom': clientData.lastName,
            'Prénom': clientData.firstName,
            'Né(e) le': formattedBirthDate,
            'Age': clientData.age,
            'Adresse': clientData.address,
            'Code postal': clientData.postalCode,
            'Ville': clientData.city,
            'Email': clientData.email,
            'Téléphone': clientData.phone,
            'Comment nous avez-vous connu ?': clientData.referral,
            'Thérapeute': clientData.therapist,
            'Centre': centerNames[clientData.centerId as keyof typeof centerNames] || clientData.centerId
          }
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Airtable API error: ${JSON.stringify(errorData)}`);
    }

  } catch (error) {
    console.error('Error adding client to Airtable:', error);
    throw error;
  }
};