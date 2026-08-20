import { format, parseISO } from 'date-fns';
import { supabase } from './supabase';

// Configuration Airtable
const AIRTABLE_ACCESS_TOKEN = 'patl2Z5JpLllHOn7G.eb220d4d725d40eb8e7e748618208cc33c853025400bada00df48dbf37ff41f8';
const AIRTABLE_BASE_ID = 'appI97jEL2mSCg3Wc';
const AIRTABLE_TABLE_ID = 'tblfqxwGePzeiWqqY';

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
  treatment?: string;
}

const TREATMENT_LABELS: Record<string, string> = {
  luxotherapy: 'Perte de poids',
  ishape: 'Perte de poids',
  cavitalyse: 'Perte de poids',
  adipology: 'Perte de poids',
  pressodynamie: 'Perte de poids',
  'mesojet-corps': 'Perte de poids',
  'radiofrequency-mesojet': 'Perte de poids',
  mesojet: 'Anti-Âge',
  'advance-lift': 'Anti-Âge',
  menopause: 'Ménopause',
  relaxation: 'Relax',
  psio: 'Psio',
};

export const addClientToAirtable = async (clientData: AirtableClientData): Promise<void> => {
  try {
    const centerNames: Record<string, string> = {
      'grau-du-roi': 'Le Grau-du-Roi',
      'le-cres': 'Le Crès',
      'serignant': 'Sérignan',
      'cabestany': 'Cabestany',
      'avignon': 'Avignon'
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

    if (clientData.treatment) {
      const treatmentLabel = TREATMENT_LABELS[clientData.treatment] || clientData.treatment;
      fields['Soins'] = treatmentLabel;
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

export const updateClientTherapistInAirtable = async (
  firstName: string,
  lastName: string,
  centerId: string,
  therapists: string[]
): Promise<void> => {
  try {
    const centerNames: Record<string, string> = {
      'grau-du-roi': 'Le Grau-du-Roi',
      'le-cres': 'Le Crès',
      'serignant': 'Sérignan',
      'cabestany': 'Cabestany',
      'avignon': 'Avignon'
    };

    const centerName = centerNames[centerId as keyof typeof centerNames] || centerId;
    const filterFormula = `AND({Prénom}='${firstName}', {Nom}='${lastName}', {Centre}='${centerName}')`;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?filterByFormula=${encodeURIComponent(filterFormula)}`;

    const getResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!getResponse.ok) {
      console.error('Erreur lors de la récupération du client dans Airtable');
      return;
    }

    const data = await getResponse.json();
    if (!data.records || data.records.length === 0) {
      console.warn('Client non trouvé dans Airtable');
      return;
    }

    const recordId = data.records[0].id;
    const therapistValue = therapists.length > 0 ? therapists.join(', ') : '';

    const updateResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Thérapeute': therapistValue
        }
      })
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`Airtable API error: ${JSON.stringify(errorData)}`);
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du thérapeute dans Airtable:', error);
    throw error;
  }
};

export const updateClientMontantCureInAirtable = async (
  firstName: string,
  lastName: string,
  centerId: string,
  montantCure: number
): Promise<void> => {
  await updateClientMontantCureByIndexInAirtable(firstName, lastName, centerId, 1, montantCure);
};

export const updateClientMontantCureByIndexInAirtable = async (
  firstName: string,
  lastName: string,
  centerId: string,
  cureIndex: number,
  montantCure: number
): Promise<void> => {
  try {
    const fieldName = cureIndex === 1 ? 'Montant Cure' : `Montant cure ${cureIndex}`;
    console.log(`[Airtable] Début mise à jour ${fieldName}:`, { firstName, lastName, centerId, montantCure });

    const centerNames: Record<string, string> = {
      'grau-du-roi': 'Le Grau-du-Roi',
      'le-cres': 'Le Crès',
      'serignant': 'Sérignan',
      'cabestany': 'Cabestany',
      'avignon': 'Avignon'
    };

    const centerName = centerNames[centerId as keyof typeof centerNames] || centerId;
    const filterFormula = `AND({Prénom}='${firstName}', {Nom}='${lastName}', {Centre}='${centerName}')`;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?filterByFormula=${encodeURIComponent(filterFormula)}`;

    const getResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!getResponse.ok) {
      const errorData = await getResponse.json();
      console.error(`[Airtable] Erreur GET:`, errorData);
      return;
    }

    const data = await getResponse.json();
    if (!data.records || data.records.length === 0) {
      console.warn('[Airtable] Client non trouvé');
      return;
    }

    const recordId = data.records[0].id;

    const updateResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: { [fieldName]: montantCure } })
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error(`[Airtable] Erreur PATCH ${fieldName}:`, JSON.stringify(errorData));
      throw new Error(`Airtable field "${fieldName}" update failed: ${JSON.stringify(errorData)}`);
    }

    console.log(`[Airtable] ✓ ${fieldName} mis à jour avec succès: ${montantCure}`);
  } catch (error) {
    console.error(`[Airtable] Erreur mise à jour Montant Cure ${cureIndex}:`, error);
    throw error;
  }
};

export const updateClientAcompteInAirtable = async (
  firstName: string,
  lastName: string,
  centerId: string,
  acompteAmount: number
): Promise<void> => {
  try {
    const centerNames: Record<string, string> = {
      'grau-du-roi': 'Le Grau-du-Roi',
      'le-cres': 'Le Crès',
      'serignan': 'Sérignan',
      'cabestany': 'Cabestany',
      'avignon': 'Avignon'
    };
    const centerName = centerNames[centerId] || centerId;
    const filterFormula = `AND({Prénom}='${firstName}', {Nom}='${lastName}', {Centre}='${centerName}')`;
    const searchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?filterByFormula=${encodeURIComponent(filterFormula)}`;
    const headers = {
      'Authorization': `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    };

    const getResponse = await fetch(searchUrl, { headers });
    if (!getResponse.ok) return;
    const data = await getResponse.json();
    if (!data.records || data.records.length === 0) return;

    const recordId = data.records[0].id;
    const updateResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${recordId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ fields: { 'Acompte': acompteAmount } })
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`Airtable API error: ${JSON.stringify(errorData)}`);
    }
  } catch (error) {
    console.error('[Airtable] Erreur mise à jour Acompte:', error);
    throw error;
  }
};

export const updateClientAvoirInAirtable = async (
  firstName: string,
  lastName: string,
  centerId: string,
  avoirAmount: string
): Promise<void> => {
  try {
    console.log('[Airtable] Début mise à jour Avoir:', { firstName, lastName, centerId, avoirAmount });

    const centerNames: Record<string, string> = {
      'grau-du-roi': 'Le Grau-du-Roi',
      'le-cres': 'Le Crès',
      'serignant': 'Sérignan',
      'cabestany': 'Cabestany',
      'avignon': 'Avignon'
    };

    const centerName = centerNames[centerId as keyof typeof centerNames] || centerId;
    const filterFormula = `AND({Prénom}='${firstName}', {Nom}='${lastName}', {Centre}='${centerName}')`;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?filterByFormula=${encodeURIComponent(filterFormula)}`;

    console.log('[Airtable] Recherche client avec formule:', filterFormula);

    const getResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!getResponse.ok) {
      const errorData = await getResponse.json();
      console.error('[Airtable] Erreur GET:', errorData);
      return;
    }

    const data = await getResponse.json();
    console.log('[Airtable] Résultat recherche:', { recordsFound: data.records?.length || 0 });

    if (!data.records || data.records.length === 0) {
      console.warn('[Airtable] Client non trouvé');
      return;
    }

    const recordId = data.records[0].id;
    console.log('[Airtable] Record trouvé, ID:', recordId);

    const avoirValue = avoirAmount ? parseFloat(avoirAmount) : 0;

    const updatePayload = {
      fields: {
        'Avoir': avoirValue
      }
    };
    console.log('[Airtable] Payload de mise à jour:', updatePayload);

    const updateResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('[Airtable] Erreur PATCH:', errorData);
      throw new Error(`Airtable API error: ${JSON.stringify(errorData)}`);
    }

    const updateResult = await updateResponse.json();
    console.log('[Airtable] ✓ Mise à jour Avoir réussie:', updateResult);
  } catch (error) {
    console.error('[Airtable] Erreur lors de la mise à jour de l\'Avoir:', error);
    throw error;
  }
};

const CARE_SERVICE_TO_SOIN: Record<string, string> = {
  'luxo-pdp':     'Perte de poids',
  'ishape':       'Perte de poids',
  'cavitalyse':   'Perte de poids',
  'adipologie':   'Perte de poids',
  'presso':       'Perte de poids',
  'meso-corps':   'Perte de poids',
  'meso-visage':  'Anti-Âge',
  'advance-lift': 'Anti-Âge',
  'luxo-meno':    'Ménopause',
  'luxo-relax':   'Relax',
  'psio':         'Psio',
};

// Priority order: when multiple soins are checked, pick the first match in this list
const SOIN_PRIORITY = ['Anti-Âge', 'Ménopause', 'Relax', 'Psio', 'Perte de poids'];

export function resolveSoinFromCareServices(careServiceIds: string[]): string | null {
  const labels = careServiceIds
    .map(id => CARE_SERVICE_TO_SOIN[id])
    .filter(Boolean);
  if (labels.length === 0) return null;
  for (const priority of SOIN_PRIORITY) {
    if (labels.includes(priority)) return priority;
  }
  return labels[0];
}

export const updateClientSoinsInAirtable = async (
  firstName: string,
  lastName: string,
  centerId: string,
  careServiceIds: string[]
): Promise<void> => {
  try {
    const soin = resolveSoinFromCareServices(careServiceIds);
    if (!soin) return;

    const centerNames: Record<string, string> = {
      'grau-du-roi': 'Le Grau-du-Roi',
      'le-cres': 'Le Crès',
      'serignant': 'Sérignan',
      'cabestany': 'Cabestany',
      'avignon': 'Avignon'
    };

    const centerName = centerNames[centerId] || centerId;
    const filterFormula = `AND({Prénom}='${firstName}', {Nom}='${lastName}', {Centre}='${centerName}')`;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?filterByFormula=${encodeURIComponent(filterFormula)}`;

    const getResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!getResponse.ok) return;

    const data = await getResponse.json();
    if (!data.records || data.records.length === 0) return;

    const recordId = data.records[0].id;

    await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: { 'Soins': soin } })
    });
  } catch (error) {
    console.error('[Airtable] Erreur mise à jour Soins:', error);
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
      'cabestany': 'Cabestany',
      'avignon': 'Avignon'
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

export const uploadContractToAirtable = async (
  firstName: string,
  lastName: string,
  centerId: string,
  clientId: string,
  pdfBase64: string
): Promise<void> => {
  try {
    // Convert base64 to Blob and upload to Supabase Storage
    const byteChars = atob(pdfBase64);
    const byteNums = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNums[i] = byteChars.charCodeAt(i);
    }
    const pdfBlob = new Blob([new Uint8Array(byteNums)], { type: 'application/pdf' });

    const filename = `${clientId}/${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(filename, pdfBlob, { contentType: 'application/pdf', upsert: true });

    if (uploadError) {
      console.error('[Airtable] Erreur upload Supabase Storage:', uploadError);
      return;
    }

    const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(filename);
    const publicUrl = urlData.publicUrl;

    // Find the Airtable record
    const centerNames: Record<string, string> = {
      'grau-du-roi': 'Le Grau-du-Roi',
      'le-cres': 'Le Crès',
      'serignant': 'Sérignan',
      'cabestany': 'Cabestany',
      'avignon': 'Avignon'
    };
    const centerName = centerNames[centerId] || centerId;
    const filterFormula = `AND({Prénom}='${firstName}', {Nom}='${lastName}', {Centre}='${centerName}')`;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?filterByFormula=${encodeURIComponent(filterFormula)}`;

    const getResponse = await fetch(url, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }
    });
    if (!getResponse.ok) return;

    const data = await getResponse.json();
    if (!data.records || data.records.length === 0) {
      console.warn('[Airtable] Client non trouvé pour upload contrat');
      return;
    }

    const recordId = data.records[0].id;

    // Airtable attachment fields require an array of { url } objects
    const updateResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${recordId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${AIRTABLE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          'Contrat': [{ url: publicUrl, filename: `Contrat_${lastName}_${firstName}.pdf` }]
        }
      })
    });

    if (!updateResponse.ok) {
      const err = await updateResponse.json();
      console.error('[Airtable] Erreur upload contrat:', err);
      return;
    }

    console.log('[Airtable] ✓ Contrat uploadé avec succès');
  } catch (error) {
    console.error('[Airtable] Erreur uploadContractToAirtable:', error);
  }
};

export const uploadConsentsToAirtable = async (
  firstName: string,
  lastName: string,
  centerId: string,
  clientId: string,
  activeServiceIds: string[],
  signatureDataUrl: string,
  date: string,
  photoChecked: boolean[] = [],
): Promise<void> => {
  try {
    const { generateSignedConsents } = await import('./consentPdfService');
    const consents = generateSignedConsents(activeServiceIds, firstName, lastName, signatureDataUrl, date, photoChecked);
    if (consents.length === 0) return;

    // Find Airtable record
    const centerNames: Record<string, string> = {
      'grau-du-roi': 'Le Grau-du-Roi',
      'le-cres': 'Le Crès',
      'serignant': 'Sérignan',
      'cabestany': 'Cabestany',
      'avignon': 'Avignon'
    };
    const centerName = centerNames[centerId] || centerId;
    const filterFormula = `AND({Prénom}='${firstName}', {Nom}='${lastName}', {Centre}='${centerName}')`;
    const searchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?filterByFormula=${encodeURIComponent(filterFormula)}`;
    const headers = { 'Authorization': `Bearer ${AIRTABLE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' };

    const getResponse = await fetch(searchUrl, { headers });
    if (!getResponse.ok) return;
    const data = await getResponse.json();
    if (!data.records || data.records.length === 0) {
      console.warn('[Airtable] Client non trouvé pour upload consentements');
      return;
    }
    const recordId = data.records[0].id;

    // Upload each generated consent PDF to Supabase Storage and collect public URLs
    const attachments: { url: string; filename: string }[] = [];
    for (const consent of consents) {
      const byteChars = atob(consent.pdfBase64);
      const byteNums = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
      const pdfBlob = new Blob([new Uint8Array(byteNums)], { type: 'application/pdf' });

      const storagePath = `${clientId}/consents/${consent.filename}`;
      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(storagePath, pdfBlob, { contentType: 'application/pdf', upsert: true });

      if (uploadError) {
        console.error(`[Airtable] Erreur upload consentement ${consent.filename}:`, uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(storagePath);
      attachments.push({ url: urlData.publicUrl, filename: consent.filename });
    }

    if (attachments.length === 0) return;

    const updateResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${recordId}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ fields: { 'Consentements': attachments } })
      }
    );

    if (!updateResponse.ok) {
      const err = await updateResponse.json();
      console.error('[Airtable] Erreur upload consentements:', err);
      return;
    }

    console.log(`[Airtable] ✓ ${attachments.length} consentement(s) signé(s) uploadé(s) avec succès`);
  } catch (error) {
    console.error('[Airtable] Erreur uploadConsentsToAirtable:', error);
  }
};