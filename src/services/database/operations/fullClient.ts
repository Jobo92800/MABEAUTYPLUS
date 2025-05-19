import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { TREATMENT_COLLECTIONS } from '../../collections';
import { getClientData } from './client';
import type { FullClientData } from '../../../types/client';

export const getFullClientData = async (clientId: string, centerId: string): Promise<FullClientData> => {
  try {
    const clientData = await getClientData(clientId);
    if (!clientData) {
      throw new Error('Client not found');
    }

    const treatment = clientData.treatment;
    const collections = TREATMENT_COLLECTIONS[treatment] || [];

    const additionalData: Record<string, any> = {};
    
    await Promise.all(
      collections.map(async (collectionName) => {
        const docRef = await getDoc(doc(db, collectionName, clientId));
        additionalData[collectionName] = docRef.exists() ? docRef.data() : {};
      })
    );

    return {
      client: clientData,
      ...additionalData
    };
  } catch (error) {
    console.error('Error fetching full client data:', error);
    throw new Error('Failed to fetch client data');
  }
};