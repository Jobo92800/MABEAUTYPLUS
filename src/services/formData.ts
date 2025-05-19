import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export const loadFormData = async (clientId: string, collections: string[]) => {
  const data: Record<string, any> = {};
  
  try {
    await Promise.all(
      collections.map(async (collectionName) => {
        const docRef = doc(db, collectionName, clientId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          data[collectionName] = docSnap.data();
        } else {
          data[collectionName] = {};
        }
      })
    );
  } catch (error) {
    console.error('Error loading form data:', error);
    throw error;
  }
  
  return data;
};

export const getFormValue = (
  formData: Record<string, any>,
  field: string,
  defaultValue: string | number = ''
): string => {
  if (!formData) return defaultValue.toString();

  const [collection, ...pathParts] = field.split('.');
  const path = pathParts.join('.');

  const collectionData = formData[collection];
  if (!collectionData) return defaultValue.toString();

  const value = path.split('.').reduce((acc: any, part) => {
    return acc && acc[part];
  }, collectionData);

  if (value === undefined || value === null) return defaultValue.toString();
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'number' && !isNaN(value)) return value.toString();
  return value.toString() || defaultValue.toString();
};

export const isFieldChecked = (formData: Record<string, any>, field: string): boolean => {
  const value = getFormValue(formData, field);
  return value === 'true';
};