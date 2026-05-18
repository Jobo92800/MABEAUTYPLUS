import { collection, addDoc, getDocs, getDoc, setDoc, doc, query, where, orderBy, limit, startAfter, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { TREATMENT_COLLECTIONS, PAYMENT_COLLECTION } from '../../collections';
import { saveFormData } from '../../formUtils';
import { addClientToAirtable, updateClientMontantCureInAirtable } from '../../airtable';
import type { Client, ClientCureData, Treatment } from '../../../types/client';
import { deleteClientRelatedData } from './clientRelated';

export const saveCureData = async (clientId: string, cureData: ClientCureData): Promise<void> => {
  // 1. Sauvegarder sur le document client
  const clientRef = doc(db, 'clients', clientId);
  await updateDoc(clientRef, {
    cureData,
    updatedAt: new Date().toISOString(),
  });

  // 2. Mettre à jour le premier règlement dans la collection payments
  const paymentRef = doc(db, PAYMENT_COLLECTION, clientId);
  const snap = await getDoc(paymentRef);

  const CARE_SERVICES_LIST = [
    { id: 'luxo-pdp', name: 'Luxo - PDP' },
    { id: 'luxo-relax', name: 'Luxo - Relax' },
    { id: 'luxo-meno', name: 'Luxo - Méno' },
    { id: 'ishape', name: 'I-Shape' },
    { id: 'cavitalyse', name: 'Cavitalyse' },
    { id: 'adipologie', name: 'Adipologie' },
    { id: 'presso', name: 'Presso' },
    { id: 'meso-corps', name: 'Méso Corps' },
    { id: 'meso-visage', name: 'Méso Visage' },
    { id: 'advance-lift', name: 'Advance Lift' },
    { id: 'psio', name: 'Psio' },
    { id: 'guide', name: 'Guide' },
    { id: 'tenue', name: 'Tenue' },
  ];

  const careServiceIds = cureData.careServiceIds || [];
  const treatments = cureData.treatments || [];
  const careServices = careServiceIds
    .map(id => CARE_SERVICES_LIST.find(s => s.id === id))
    .filter(Boolean)
    .map(s => {
      const treatment = treatments.find(t => t.careServiceId === s!.id);
      const sessionCount = treatment?.sessions ?? '';
      return { id: s!.id, name: s!.name, sessions: sessionCount !== '' ? String(sessionCount) : '' };
    });

  const newInstallments = cureData.installments.map((inst) => ({
    amount: inst.amount.toString(),
    date: '',
    purpose: '',
    method: '',
    isPaid: false,
    isGiven: false,
  }));

  let categories: any[] = [];
  if (snap.exists()) {
    const data = snap.data();
    categories = Array.isArray(data.categories) ? [...data.categories] : [];
  }

  if (categories.length === 0) {
    categories = [{
      id: '1',
      name: '',
      ruleName: '',
      careServices: [],
      totalAmount: '',
      deposit: { amount: '', date: '', method: '', isPaid: false, isGiven: false },
      installments: [{ amount: '', date: '', purpose: '', method: '', isPaid: false, isGiven: false }],
      avoir: { amount: '', comment: '' },
    }];
  }

  // Mettre à jour le premier règlement
  categories[0] = {
    ...categories[0],
    careServices,
    totalAmount: cureData.totalPrice.toString(),
    installments: newInstallments,
  };

  await setDoc(paymentRef, {
    categories,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  // 3. Synchroniser le montant avec Airtable
  const clientSnap = await getDoc(clientRef);
  if (clientSnap.exists()) {
    const clientData = clientSnap.data() as Client;
    const { firstName, lastName, centerId } = clientData;
    if (firstName && lastName && centerId && cureData.totalPrice > 0) {
      try {
        await updateClientMontantCureInAirtable(firstName, lastName, centerId, cureData.totalPrice);
      } catch {
        // Non bloquant : la sauvegarde Firestore a réussi
      }
    }
  }
};

export const getClients = async (centerId: string, pageSize = 50, lastDoc?: any): Promise<Client[]> => {
  try {
    const q = query(
      collection(db, 'clients'),
      where('centerId', '==', centerId),
      orderBy('lastName')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    throw new Error('Impossible de récupérer les clients');
  }
};

export const getClientData = async (clientId: string): Promise<Client | null> => {
  try {
    const clientDoc = await getDoc(doc(db, 'clients', clientId));
    if (!clientDoc.exists()) return null;
    return { id: clientDoc.id, ...clientDoc.data() } as Client;
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    throw new Error('Impossible de récupérer les données du client');
  }
};

export const checkClientExists = async (firstName: string, lastName: string, centerId: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'clients'),
      where('firstName', '==', firstName),
      where('lastName', '==', lastName),
      where('centerId', '==', centerId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking client existence:', error);
    throw new Error('Impossible de vérifier si le client existe déjà');
  }
};

export const saveClient = async (formData: FormData, centerId: string): Promise<string> => {
  try {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    // Check if client already exists
    const exists = await checkClientExists(firstName, lastName, centerId);
    if (exists) {
      throw new Error('Un client avec ce nom et prénom existe déjà');
    }

    const clientData = {
      firstName,
      lastName,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      birthDate: formData.get('birthDate') as string,
      age: parseInt(formData.get('age') as string) || 0,
      address: formData.get('address') as string,
      postalCode: formData.get('postalCode') as string,
      city: formData.get('city') as string,
      referral: formData.get('referral') as string,
      therapist: formData.get('therapist') as string,
      centerId,
      treatment: formData.get('treatment') as Treatment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const clientRef = await addDoc(collection(db, 'clients'), clientData);
    const treatment = formData.get('treatment') as keyof typeof TREATMENT_COLLECTIONS;
    const collections = TREATMENT_COLLECTIONS[treatment] || [];
    await saveFormData(clientRef.id, formData, collections);

    try {
      let totalAmount = '';
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('totalAmount-')) {
          totalAmount = value as string;
          break;
        }
      }

      let therapistsFromPayment: string[] = [];
      try {
        const paymentDoc = await getDoc(doc(db, PAYMENT_COLLECTION, clientRef.id));
        if (paymentDoc.exists()) {
          const paymentData = paymentDoc.data();
          therapistsFromPayment = paymentData.therapists || [];
        }
      } catch (paymentError) {
        console.warn('Impossible de récupérer les thérapeutes depuis les paiements:', paymentError);
      }

      const therapistForAirtable = therapistsFromPayment.length > 0
        ? therapistsFromPayment.join(', ')
        : clientData.therapist;

      await addClientToAirtable({
        ...clientData,
        centerId,
        totalAmount,
        therapist: therapistForAirtable
      });
    } catch (airtableError) {
      console.warn('Échec de la synchronisation avec Airtable:', airtableError);
    }

    return clientRef.id;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du client:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Impossible de sauvegarder les données du client');
  }
};

export const updateClient = async (clientId: string, formData: FormData, centerId: string): Promise<void> => {
  try {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    // Get current client data
    const currentClient = await getClientData(clientId);
    if (!currentClient) {
      throw new Error('Client non trouvé');
    }

    // Only check for duplicates if name has changed
    if (currentClient.firstName !== firstName || currentClient.lastName !== lastName) {
      const exists = await checkClientExists(firstName, lastName, centerId);
      if (exists) {
        throw new Error('Un client avec ce nom et prénom existe déjà');
      }
    }

    const clientRef = doc(db, 'clients', clientId);
    const clientData = {
      firstName,
      lastName,
      email: formData.get('email'),
      phone: formData.get('phone'),
      birthDate: formData.get('birthDate'),
      age: parseInt(formData.get('age') as string) || 0,
      address: formData.get('address'),
      postalCode: formData.get('postalCode'),
      city: formData.get('city'),
      referral: formData.get('referral'),
      therapist: formData.get('therapist'),
      centerId,
      treatment: formData.get('treatment'),
      updatedAt: new Date().toISOString()
    };

    await updateDoc(clientRef, clientData);
    const treatment = formData.get('treatment') as keyof typeof TREATMENT_COLLECTIONS;
    const collections = TREATMENT_COLLECTIONS[treatment] || [];
    await saveFormData(clientId, formData, collections);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Impossible de mettre à jour les données du client');
  }
};

export const deleteClient = async (clientId: string, treatment: Treatment): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'clients', clientId));
    await deleteClientRelatedData(clientId, treatment);
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    throw new Error('Impossible de supprimer le client');
  }
};