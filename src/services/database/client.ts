import { collection, addDoc, getDocs, getDoc, doc, query, where, orderBy, limit, startAfter, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { TREATMENT_COLLECTIONS } from '../collections';
import { saveFormData } from '../formUtils';
import { addClientToAirtable } from '../airtable';
import type { Client, Treatment } from '../../types/client';

// Export all client-related functions
export const getClients = async (centerId: string, pageSize = 50, lastDoc?: any): Promise<Client[]> => {
  try {
    let q = query(
      collection(db, 'clients'),
      where('centerId', '==', centerId),
      orderBy('lastName'),
      orderBy('__name__'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw new Error('Failed to fetch clients');
  }
};

export const getClientData = async (clientId: string): Promise<Client | null> => {
  try {
    const clientDoc = await getDoc(doc(db, 'clients', clientId));
    if (!clientDoc.exists()) return null;
    return { id: clientDoc.id, ...clientDoc.data() } as Client;
  } catch (error) {
    console.error('Error fetching client:', error);
    throw new Error('Failed to fetch client data');
  }
};

export const saveClient = async (formData: FormData, centerId: string): Promise<string> => {
  try {
    const clientData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
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
    await saveFormData(clientRef.id, formData, collections, true);

    try {
      await addClientToAirtable({ ...clientData, centerId });
    } catch (airtableError) {
      console.warn('Failed to sync with Airtable:', airtableError);
    }

    return clientRef.id;
  } catch (error) {
    console.error('Error saving client:', error);
    throw new Error('Failed to save client data');
  }
};

export const updateClient = async (clientId: string, formData: FormData, centerId: string): Promise<void> => {
  try {
    const clientRef = doc(db, 'clients', clientId);
    const clientData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
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
    console.error('Error updating client:', error);
    throw new Error('Failed to update client data');
  }
};

export const deleteClient = async (clientId: string, treatment: Treatment): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'clients', clientId));

    const collections = TREATMENT_COLLECTIONS[treatment] || [];
    await Promise.all(
      collections.map(async (collectionName) => {
        await deleteDoc(doc(db, collectionName, clientId));
      })
    );

    const measurementsQuery = query(collection(db, 'measurements'), where('clientId', '==', clientId));
    const sessionsQuery = query(collection(db, 'sessions'), where('clientId', '==', clientId));
    const mensurationsQuery = query(collection(db, 'mensurations'), where('clientId', '==', clientId));

    const [measurementsSnapshot, sessionsSnapshot, mensurationsSnapshot] = await Promise.all([
      getDocs(measurementsQuery),
      getDocs(sessionsQuery),
      getDocs(mensurationsQuery)
    ]);

    const deletePromises = [
      ...measurementsSnapshot.docs.map(doc => deleteDoc(doc.ref)),
      ...sessionsSnapshot.docs.map(doc => deleteDoc(doc.ref)),
      ...mensurationsSnapshot.docs.map(doc => deleteDoc(doc.ref))
    ];

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting client:', error);
    throw new Error('Failed to delete client');
  }
};