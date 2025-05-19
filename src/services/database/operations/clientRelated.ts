import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { TREATMENT_COLLECTIONS } from '../../collections';
import type { Treatment } from '../../../types/client';

export const deleteClientRelatedData = async (clientId: string, treatment: Treatment): Promise<void> => {
  try {
    // Delete treatment-specific collections
    const collections = TREATMENT_COLLECTIONS[treatment] || [];
    await Promise.all(
      collections.map(async (collectionName) => {
        await deleteDoc(doc(db, collectionName, clientId));
      })
    );

    // Delete related measurements, sessions, and mensurations
    const [measurementsSnapshot, sessionsSnapshot, mensurationsSnapshot] = await Promise.all([
      getDocs(query(collection(db, 'measurements'), where('clientId', '==', clientId))),
      getDocs(query(collection(db, 'sessions'), where('clientId', '==', clientId))),
      getDocs(query(collection(db, 'mensurations'), where('clientId', '==', clientId)))
    ]);

    const deletePromises = [
      ...measurementsSnapshot.docs.map(doc => deleteDoc(doc.ref)),
      ...sessionsSnapshot.docs.map(doc => deleteDoc(doc.ref)),
      ...mensurationsSnapshot.docs.map(doc => deleteDoc(doc.ref))
    ];

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting client related data:', error);
    throw new Error('Failed to delete client related data');
  }
};