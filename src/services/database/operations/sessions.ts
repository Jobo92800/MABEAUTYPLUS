import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Session } from '../../../types/session';

export const getSessions = async (clientId: string, centerId: string, type: Session['type']): Promise<Session[]> => {
  try {
    const q = query(
      collection(db, 'sessions'),
      where('clientId', '==', clientId),
      where('centerId', '==', centerId),
      where('type', '==', type),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw new Error('Failed to fetch sessions');
  }
};

export const addSession = async (session: Omit<Session, 'id'>): Promise<void> => {
  try {
    await addDoc(collection(db, 'sessions'), {
      ...session,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding session:', error);
    throw new Error('Failed to add session');
  }
};

export const updateSession = async (session: Session): Promise<void> => {
  if (!session.id) throw new Error('Session ID is required');
  
  try {
    const sessionRef = doc(db, 'sessions', session.id);
    await updateDoc(sessionRef, {
      ...session,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating session:', error);
    throw new Error('Failed to update session');
  }
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'sessions', sessionId));
  } catch (error) {
    console.error('Error deleting session:', error);
    throw new Error('Failed to delete session');
  }
};

export const updateTotalSessions = async (clientId: string, totalSessions: number): Promise<void> => {
  try {
    const docRef = doc(db, 'client-sessions', clientId);
    await setDoc(docRef, { totalSessions }, { merge: true });
  } catch (error) {
    console.error('Error updating total sessions:', error);
    throw new Error('Failed to update total sessions');
  }
};

export const getTotalSessions = async (clientId: string): Promise<number | null> => {
  try {
    const docRef = doc(db, 'client-sessions', clientId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().totalSessions || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting total sessions:', error);
    throw new Error('Failed to get total sessions');
  }
};