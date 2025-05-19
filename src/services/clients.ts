import { collection, addDoc, getDocs, getDoc, doc, query, where, orderBy, limit, startAfter, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { TREATMENT_COLLECTIONS } from './collections';
import { saveFormData } from './formUtils';
import { addClientToAirtable } from './airtable';
import type { Client, Treatment } from '../types/client';

export const saveClient = async (formData: FormData, centerId: string): Promise<string> => {
  try {
    // First save to Firestore
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

    // Save to Firestore
    const clientRef = await addDoc(collection(db, 'clients'), clientData);

    // Save treatment-specific form data
    const treatment = formData.get('treatment') as keyof typeof TREATMENT_COLLECTIONS;
    const collections = TREATMENT_COLLECTIONS[treatment] || [];
    await saveFormData(clientRef.id, formData, collections);

    // Try to save to Airtable, but don't block if it fails
    try {
      await addClientToAirtable({ ...clientData, centerId });
    } catch (airtableError) {
      console.warn('Failed to sync with Airtable:', airtableError);
      // Don't throw error since Airtable is optional
    }

    return clientRef.id;
  } catch (error) {
    console.error('Error saving client:', error);
    throw new Error('Failed to save client data. Please try again.');
  }
};