import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Measurement, Mensuration } from '../../../types/measurements';

// Measurements
export const getMeasurements = async (clientId: string, centerId: string): Promise<Measurement[]> => {
  try {
    const q = query(
      collection(db, 'measurements'),
      where('clientId', '==', clientId),
      where('centerId', '==', centerId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Measurement));
  } catch (error) {
    console.error('Error fetching measurements:', error);
    throw new Error('Failed to fetch measurements');
  }
};

export const addMeasurement = async (clientId: string, centerId: string, data: { date: string; weight: number; comment?: string }): Promise<void> => {
  try {
    await addDoc(collection(db, 'measurements'), {
      clientId,
      centerId,
      ...data,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding measurement:', error);
    throw new Error('Failed to add measurement');
  }
};

export const updateMeasurement = async (measurement: Measurement): Promise<void> => {
  if (!measurement.id) throw new Error('Measurement ID is required');
  
  try {
    const measurementRef = doc(db, 'measurements', measurement.id);
    await updateDoc(measurementRef, {
      ...measurement,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating measurement:', error);
    throw new Error('Failed to update measurement');
  }
};

export const deleteMeasurement = async (measurementId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'measurements', measurementId));
  } catch (error) {
    console.error('Error deleting measurement:', error);
    throw new Error('Failed to delete measurement');
  }
};

// Mensurations
export const getMensurations = async (clientId: string, centerId: string): Promise<Mensuration[]> => {
  try {
    const q = query(
      collection(db, 'mensurations'),
      where('clientId', '==', clientId),
      where('centerId', '==', centerId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mensuration));
  } catch (error) {
    console.error('Error fetching mensurations:', error);
    throw new Error('Failed to fetch mensurations');
  }
};

export const addMensuration = async (clientId: string, centerId: string, data: Omit<Mensuration, 'id' | 'clientId' | 'centerId'>): Promise<void> => {
  try {
    await addDoc(collection(db, 'mensurations'), {
      clientId,
      centerId,
      ...data,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding mensuration:', error);
    throw new Error('Failed to add mensuration');
  }
};

export const updateMensuration = async (mensuration: Mensuration): Promise<void> => {
  if (!mensuration.id) throw new Error('Mensuration ID is required');
  
  try {
    const mensurationRef = doc(db, 'mensurations', mensuration.id);
    await updateDoc(mensurationRef, {
      ...mensuration,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating mensuration:', error);
    throw new Error('Failed to update mensuration');
  }
};

export const deleteMensuration = async (mensurationId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'mensurations', mensurationId));
  } catch (error) {
    console.error('Error deleting mensuration:', error);
    throw new Error('Failed to delete mensuration');
  }
};