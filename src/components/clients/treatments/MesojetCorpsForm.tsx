import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { doc, getDoc, setDoc, collection, addDoc, query, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { format } from 'date-fns';
import SectionTitlePink from '../../SectionTitlePink';
import type { FullClientData } from '../../../types/client';

interface BodyZone {
  brasHautDroit: boolean;
  brasHautGauche: boolean;
  brasMilieuDroit: boolean;
  brasMilieuGauche: boolean;
  brasBasDroit: boolean;
  brasBasGauche: boolean;
  ventre: boolean;
  hanche: boolean;
  taille: boolean;
  fesses: boolean;
  sousFessier: boolean;
  cuisseHautDroit: boolean;
  cuisseHautGauche: boolean;
  cuisseMilieuDroit: boolean;
  cuisseMilieuGauche: boolean;
  cuisseBasDroit: boolean;
  cuisseBasGauche: boolean;
  molletDroit: boolean;
  molletGauche: boolean;
}

interface MesojetCorpsSession {
  id?: string;
  date: string;
  sessionNumber: number;
  comments: string;
  zones: BodyZone;
}

interface MesojetCorpsFormProps {
  initialData?: FullClientData;
}

const MesojetCorpsForm: React.FC<MesojetCorpsFormProps> = ({ initialData }) => {
  const [sessions, setSessions] = useState<MesojetCorpsSession[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newSession, setNewSession] = useState<MesojetCorpsSession>({
    date: format(new Date(), 'yyyy-MM-dd'),
    sessionNumber: 1,
    comments: '',
    zones: {
      brasHautDroit: false,
      brasHautGauche: false,
      brasMilieuDroit: false,
      brasMilieuGauche: false,
      brasBasDroit: false,
      brasBasGauche: false,
      ventre: false,
      hanche: false,
      taille: false,
      fesses: false,
      sousFessier: false,
      cuisseHautDroit: false,
      cuisseHautGauche: false,
      cuisseMilieuDroit: false,
      cuisseMilieuGauche: false,
      cuisseBasDroit: false,
      cuisseBasGauche: false,
      molletDroit: false,
      molletGauche: false,
    }
  });

  useEffect(() => {
    const loadSessions = async () => {
      if (!initialData?.client.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const sessionsRef = collection(db, 'mesojetCorpsSessions');
        const q = query(
          sessionsRef,
          orderBy('sessionNumber', 'desc')
        );
        const querySnapshot = await getDocs(q);

        const loadedSessions: MesojetCorpsSession[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.clientId === initialData.client.id) {
            loadedSessions.push({
              id: doc.id,
              ...data
            } as MesojetCorpsSession);
          }
        });

        setSessions(loadedSessions);

        if (loadedSessions.length > 0) {
          setNewSession(prev => ({
            ...prev,
            sessionNumber: loadedSessions[0].sessionNumber + 1
          }));
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [initialData?.client.id]);

  const handleAddSession = async () => {
    if (!initialData?.client.id) return;

    try {
      const sessionsRef = collection(db, 'mesojetCorpsSessions');
      await addDoc(sessionsRef, {
        ...newSession,
        clientId: initialData.client.id,
        createdAt: new Date().toISOString()
      });

      setSessions([newSession, ...sessions]);
      setNewSession({
        date: format(new Date(), 'yyyy-MM-dd'),
        sessionNumber: newSession.sessionNumber + 1,
        comments: '',
        zones: {
          brasHautDroit: false,
          brasHautGauche: false,
          brasMilieuDroit: false,
          brasMilieuGauche: false,
          brasBasDroit: false,
          brasBasGauche: false,
          ventre: false,
          hanche: false,
          taille: false,
          fesses: false,
          sousFessier: false,
          cuisseHautDroit: false,
          cuisseHautGauche: false,
          cuisseMilieuDroit: false,
          cuisseMilieuGauche: false,
          cuisseBasDroit: false,
          cuisseBasGauche: false,
          molletDroit: false,
          molletGauche: false,
        }
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!sessionId) return;

    try {
      await deleteDoc(doc(db, 'mesojetCorpsSessions', sessionId));
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleZoneChange = (zone: keyof BodyZone) => {
    setNewSession(prev => ({
      ...prev,
      zones: {
        ...prev.zones,
        [zone]: !prev.zones[zone]
      }
    }));
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-8 mt-8">
      <SectionTitlePink>Suivi des séances Mésojet Corps</SectionTitlePink>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Nombre de séances : {sessions.length}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-pink to-brand-blue rounded-full hover:shadow-md transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une séance
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Nouvelle séance</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={newSession.date}
                onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">N° Séance</label>
              <input
                type="number"
                value={newSession.sessionNumber}
                onChange={(e) => setNewSession({ ...newSession, sessionNumber: parseInt(e.target.value) || 1 })}
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Commentaires</label>
              <input
                type="text"
                value={newSession.comments}
                onChange={(e) => setNewSession({ ...newSession, comments: e.target.value })}
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
                placeholder="Commentaires sur la séance"
              />
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Zones traitées</h4>

            <div className="space-y-6">
              <div>
                <h5 className="text-sm font-semibold text-brand-pink mb-3">Bras</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSession.zones.brasHautDroit}
                        onChange={() => handleZoneChange('brasHautDroit')}
                        className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                      />
                      <span className="ml-2 text-sm">Zone 1 - Haut (épaule) Droit</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSession.zones.brasMilieuDroit}
                        onChange={() => handleZoneChange('brasMilieuDroit')}
                        className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                      />
                      <span className="ml-2 text-sm">Zone 2 - Milieu Droit</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSession.zones.brasBasDroit}
                        onChange={() => handleZoneChange('brasBasDroit')}
                        className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                      />
                      <span className="ml-2 text-sm">Zone 3 - Bas (coude) Droit</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSession.zones.brasHautGauche}
                        onChange={() => handleZoneChange('brasHautGauche')}
                        className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                      />
                      <span className="ml-2 text-sm">Zone 1 - Haut (épaule) Gauche</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSession.zones.brasMilieuGauche}
                        onChange={() => handleZoneChange('brasMilieuGauche')}
                        className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                      />
                      <span className="ml-2 text-sm">Zone 2 - Milieu Gauche</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSession.zones.brasBasGauche}
                        onChange={() => handleZoneChange('brasBasGauche')}
                        className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                      />
                      <span className="ml-2 text-sm">Zone 3 - Bas (coude) Gauche</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-brand-pink mb-3">Tronc</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newSession.zones.ventre}
                      onChange={() => handleZoneChange('ventre')}
                      className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                    />
                    <span className="ml-2 text-sm">Ventre</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newSession.zones.hanche}
                      onChange={() => handleZoneChange('hanche')}
                      className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                    />
                    <span className="ml-2 text-sm">Hanche</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newSession.zones.taille}
                      onChange={() => handleZoneChange('taille')}
                      className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                    />
                    <span className="ml-2 text-sm">Taille</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newSession.zones.fesses}
                      onChange={() => handleZoneChange('fesses')}
                      className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                    />
                    <span className="ml-2 text-sm">Fesses</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newSession.zones.sousFessier}
                      onChange={() => handleZoneChange('sousFessier')}
                      className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                    />
                    <span className="ml-2 text-sm">Sous-fessier</span>
                  </label>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-brand-pink mb-3">Cuisses</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSession.zones.cuisseHautDroit}
                        onChange={() => handleZoneChange('cuisseHautDroit')}
                        className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                      />
                      <span className="ml-2 text-sm">Zone 1 - Haut cuisse Droit</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSession.zones.cuisseMilieuDroit}
                        onChange={() => handleZoneChange('cuisseMilieuDroit')}
                        className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                      />
                      <span className="ml-2 text-sm">Zone 2 - Milieu cuisse Droit</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSession.zones.cuisseBasDroit}
                        onChange={() => handleZoneChange('cuisseBasDroit')}
                        className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                      />
                      <span className="ml-2 text-sm">Zone 3 - Bas cuisse (genoux) Droit</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSession.zones.cuisseHautGauche}
                        onChange={() => handleZoneChange('cuisseHautGauche')}
                        className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                      />
                      <span className="ml-2 text-sm">Zone 1 - Haut cuisse Gauche</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSession.zones.cuisseMilieuGauche}
                        onChange={() => handleZoneChange('cuisseMilieuGauche')}
                        className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                      />
                      <span className="ml-2 text-sm">Zone 2 - Milieu cuisse Gauche</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSession.zones.cuisseBasGauche}
                        onChange={() => handleZoneChange('cuisseBasGauche')}
                        className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                      />
                      <span className="ml-2 text-sm">Zone 3 - Bas cuisse (genoux) Gauche</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-brand-pink mb-3">Mollets</h5>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newSession.zones.molletDroit}
                      onChange={() => handleZoneChange('molletDroit')}
                      className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                    />
                    <span className="ml-2 text-sm">Mollet Droit</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newSession.zones.molletGauche}
                      onChange={() => handleZoneChange('molletGauche')}
                      className="h-4 w-4 text-brand-pink rounded focus:ring-brand-pink"
                    />
                    <span className="ml-2 text-sm">Mollet Gauche</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleAddSession}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-pink to-brand-blue rounded-lg hover:shadow-md"
            >
              Enregistrer la séance
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des séances</h3>

          {sessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune séance enregistrée</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          Séance #{session.sessionNumber}
                        </span>
                        <span className="text-sm text-gray-600">
                          {format(new Date(session.date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      {session.comments && (
                        <p className="text-sm text-gray-600">{session.comments}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => session.id && handleDeleteSession(session.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <h6 className="text-xs font-semibold text-gray-700 mb-2">Zones traitées:</h6>
                    <div className="flex flex-wrap gap-2">
                      {session.zones.brasHautDroit && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Bras haut D</span>}
                      {session.zones.brasHautGauche && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Bras haut G</span>}
                      {session.zones.brasMilieuDroit && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Bras milieu D</span>}
                      {session.zones.brasMilieuGauche && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Bras milieu G</span>}
                      {session.zones.brasBasDroit && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Bras bas D</span>}
                      {session.zones.brasBasGauche && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Bras bas G</span>}
                      {session.zones.ventre && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Ventre</span>}
                      {session.zones.hanche && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Hanche</span>}
                      {session.zones.taille && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Taille</span>}
                      {session.zones.fesses && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Fesses</span>}
                      {session.zones.sousFessier && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Sous-fessier</span>}
                      {session.zones.cuisseHautDroit && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Cuisse haut D</span>}
                      {session.zones.cuisseHautGauche && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Cuisse haut G</span>}
                      {session.zones.cuisseMilieuDroit && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Cuisse milieu D</span>}
                      {session.zones.cuisseMilieuGauche && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Cuisse milieu G</span>}
                      {session.zones.cuisseBasDroit && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Cuisse bas D</span>}
                      {session.zones.cuisseBasGauche && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Cuisse bas G</span>}
                      {session.zones.molletDroit && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Mollet D</span>}
                      {session.zones.molletGauche && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Mollet G</span>}
                    </div>
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

export default MesojetCorpsForm;
