import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const processValue = (value: FormDataEntryValue): boolean | number | string => {
  if (typeof value !== 'string') return value;
  
  // Handle checkbox values
  if (value === 'on') return true;
  if (value === 'off') return false;
  
  // Handle boolean values
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // Handle numeric values
  const num = Number(value);
  if (!isNaN(num) && value.trim() !== '') return num;
  
  return value;
};

export const processFormData = (formData: FormData, collectionName: string) => {
  const data: Record<string, any> = {};
  let hasData = false;

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith(collectionName + '.')) continue;
    
    hasData = true;
    const field = key.replace(collectionName + '.', '');
    
    // Handle nested fields
    if (field.includes('.')) {
      const parts = field.split('.');
      let current = data;
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      
      const lastPart = parts[parts.length - 1];
      current[lastPart] = processValue(value);
    } else {
      data[field] = processValue(value);
    }
  }

  return { data, hasData };
};

export const saveFormData = async (clientId: string, formData: FormData, collections: string[]) => {
  try {
    const savePromises = collections.map(async (collectionName) => {
      const { data, hasData } = processFormData(formData, collectionName);
      if (hasData) {
        const docRef = doc(db, collectionName, clientId);
        await setDoc(docRef, data, { merge: true });
      }
    });

    await Promise.all(savePromises);
  } catch (error) {
    console.error('Error saving form data:', error);
    throw error;
  }
};

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