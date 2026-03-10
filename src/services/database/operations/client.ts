import { collection, addDoc, getDocs, getDoc, doc, query, where, orderBy, limit, startAfter, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { TREATMENT_COLLECTIONS } from '../../collections';
import { saveFormData } from '../../formUtils';
import { addClientToAirtable } from '../../airtable';
import type { Client, Treatment } from '../../../types/client';
import { deleteClientRelatedData } from './clientRelated';

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
      await addClientToAirtable({ ...clientData, centerId, totalAmount });
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