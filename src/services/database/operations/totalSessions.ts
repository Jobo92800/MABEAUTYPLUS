import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const COLLECTION_NAME = 'treatment-sessions';
const CURE_COLLECTION = 'client-cures';

export const updateTotalTreatmentSessions = async (
  clientId: string, 
  treatment: string, 
  totalSessions: number
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    await setDoc(docRef, { 
      [treatment]: totalSessions,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating total treatment sessions:', error);
    throw new Error('Failed to update total sessions');
  }
};

export const getTotalTreatmentSessions = async (
  clientId: string,
  treatment: string
): Promise<number> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, clientId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data()?.[treatment] || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting total treatment sessions:', error);
    throw new Error('Failed to get total sessions');
  }
};

export const getCurrentCureNumber = async (
  clientId: string,
  treatment: string
): Promise<number> => {
  try {
    const docRef = doc(db, CURE_COLLECTION, clientId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data()?.[treatment] ?? 1;
    }
    return 1;
  } catch (error) {
    console.error('Error getting current cure number:', error);
    return 1;
  }
};

export const setCurrentCureNumber = async (
  clientId: string,
  treatment: string,
  cureNumber: number
): Promise<void> => {
  try {
    const docRef = doc(db, CURE_COLLECTION, clientId);
    await setDoc(docRef, {
      [treatment]: cureNumber,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error setting cure number:', error);
    throw new Error('Failed to set cure number');
  }
};