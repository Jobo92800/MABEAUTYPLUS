import { format, parseISO } from 'date-fns';

// Configuration Airtable
const AIRTABLE_ACCESS_TOKEN = 'patl2Z5JpLllHOn7G.eb220d4d725d40eb8e7e748618208cc33c853025400bada00df48dbf37ff41f8';
const AIRTABLE_BASE_ID = 'appI97jEL2mSCg3Wc';
const AIRTABLE_TABLE_ID = 'Clients';

interface AirtablePaymentData {
  ruleName?: string;
  totalAmount?: string;
  careServices?: Array<{
    id: string;
    name: string;
    sessions: string;
  }>;
}

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
  totalAmount?: string;
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

    const fields: Record<string, any> = {
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
    };

    if (clientData.totalAmount) {
      fields['Montant Cure'] = parseFloat(clientData.totalAmount);
    }

    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [{
          fields
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

export const getClientPaymentDataFromAirtable = async (
  firstName: string,
  lastName: string,
  centerId: string
): Promise<AirtablePaymentData | null> => {
  try {
    const centerNames: Record<string, string> = {
      'grau-du-roi': 'Le Grau-du-Roi',
      'le-cres': 'Le Crès',
      'serignant': 'Sérignan',
      'cabestany': 'Cabestany'
    };

    const centerName = centerNames[centerId as keyof typeof centerNames] || centerId;

    const filterFormula = `AND({Prénom}='${firstName}', {Nom}='${lastName}', {Centre}='${centerName}')`;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?filterByFormula=${encodeURIComponent(filterFormula)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable API error:', errorData);
      return null;
    }

    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      return null;
    }

    const record = data.records[0];
    const fields = record.fields;

    return {
      ruleName: fields['Nom du règlement'] || fields['Nom de règlement'] || '',
      totalAmount: fields['Tarif total cure 1'] || '',
      careServices: []
    };

  } catch (error) {
    console.error('Error fetching client payment data from Airtable:', error);
    return null;
  }
};