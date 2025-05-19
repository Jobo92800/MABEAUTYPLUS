import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { TREATMENT_COLLECTIONS } from '../services/collections';
import type { Treatment } from '../types/client';

export const useFormData = (clientId: string | undefined, treatment: Treatment) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId || !treatment) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const collections = TREATMENT_COLLECTIONS[treatment] || [];
        
        const data: Record<string, any> = {};
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

        setFormData(data);
      } catch (err) {
        console.error('Error loading form data:', err);
        setError('Error loading form data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId, treatment]);

  return { formData, loading, error };
};