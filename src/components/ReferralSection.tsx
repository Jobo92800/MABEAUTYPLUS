import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Users } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Godchild {
  name: string;
  gains: string;
}

interface ReferralData {
  godfather: string;
  godchildren: Godchild[];
}

interface ReferralSectionProps {
  clientId?: string;
}

const ReferralSection: React.FC<ReferralSectionProps> = ({ clientId }) => {
  const [godfather, setGodfather] = useState('');
  const [godchildren, setGodchildren] = useState<Godchild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReferralData = async () => {
      if (!clientId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const docRef = doc(db, 'referrals', clientId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as ReferralData;
          if (data.godfather) {
            setGodfather(data.godfather);
          }
          if (Array.isArray(data.godchildren) && data.godchildren.length > 0) {
            setGodchildren(data.godchildren);
          }
        }
      } catch (error) {
        console.error('Error loading referral data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReferralData();
  }, [clientId]);

  const saveReferralData = async (newGodfather: string, newGodchildren: Godchild[]) => {
    if (!clientId) return;

    try {
      const docRef = doc(db, 'referrals', clientId);
      await setDoc(docRef, {
        godfather: newGodfather,
        godchildren: newGodchildren,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving referral data:', error);
    }
  };

  const handleGodfatherChange = (value: string) => {
    setGodfather(value);
    saveReferralData(value, godchildren);
  };

  const handleGodchildChange = (index: number, field: keyof Godchild, value: string) => {
    const newGodchildren = [...godchildren];
    newGodchildren[index] = { ...newGodchildren[index], [field]: value };
    setGodchildren(newGodchildren);
    saveReferralData(godfather, newGodchildren);
  };

  const addGodchild = () => {
    const newGodchildren = [...godchildren, { name: '', gains: '' }];
    setGodchildren(newGodchildren);
    saveReferralData(godfather, newGodchildren);
  };

  const removeGodchild = (index: number) => {
    const newGodchildren = godchildren.filter((_, i) => i !== index);
    setGodchildren(newGodchildren);
    saveReferralData(godfather, newGodchildren);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-blue to-brand-pink p-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-white" />
          <h3 className="text-lg font-semibold text-white">
            Parrain / Filleuil
          </h3>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Parrain Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label htmlFor="godfather" className="block text-sm font-medium text-gray-700 mb-2">
            Parrain
          </label>
          <input
            type="text"
            id="godfather"
            value={godfather}
            onChange={(e) => handleGodfatherChange(e.target.value)}
            className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
            placeholder="Nom du parrain"
          />
        </div>

        {/* Filleuls Section */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-900">
              Filleuil(s)
            </h4>
            <button
              type="button"
              onClick={addGodchild}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-brand-blue hover:text-brand-pink transition-colors rounded-full hover:bg-gray-100"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter un filleuil
            </button>
          </div>

          {godchildren.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Aucun filleuil enregistré
            </p>
          ) : (
            <div className="space-y-3">
              {godchildren.map((godchild, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start p-3 rounded-lg border-2 border-gray-200 bg-white"
                >
                  {/* Nom */}
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Nom du filleuil"
                      value={godchild.name}
                      onChange={(e) => handleGodchildChange(index, 'name', e.target.value)}
                      className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                    />
                  </div>

                  {/* Gains */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Gains"
                      value={godchild.gains}
                      onChange={(e) => handleGodchildChange(index, 'gains', e.target.value)}
                      className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                    />

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => removeGodchild(index)}
                      className="p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Supprimer ce filleuil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralSection;
