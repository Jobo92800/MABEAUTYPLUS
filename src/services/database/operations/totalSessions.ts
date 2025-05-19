import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const COLLECTION_NAME = 'treatment-sessions';

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