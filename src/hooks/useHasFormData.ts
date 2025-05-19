import { useEffect, useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { TREATMENT_COLLECTIONS } from '../services/collections';
import type { Treatment } from '../types/client';

export const useHasFormData = (clientId: string | undefined, treatment: Treatment) => {
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFormData = async () => {
      if (!clientId) {
        setHasData(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const collections = TREATMENT_COLLECTIONS[treatment] || [];
        
        // Check each collection for data
        const results = await Promise.all(
          collections.map(async (collectionName) => {
            const docRef = doc(db, collectionName, clientId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return false;
            
            const data = docSnap.data();
            // Check if the document has any non-empty fields
            return Object.values(data).some(value => {
              if (typeof value === 'string') return value.trim() !== '';
              if (typeof value === 'boolean') return value;
              if (typeof value === 'number') return true;
              if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(v => v !== '' && v !== false && v !== null && v !== undefined);
              }
              return false;
            });
          })
        );

        // If any collection has data, set hasData to true
        setHasData(results.some(result => result));
      } catch (error) {
        console.error('Error checking form data:', error);
        setHasData(false);
      } finally {
        setLoading(false);
      }
    };

    checkFormData();
  }, [clientId, treatment]);

  return { hasData, loading };
};