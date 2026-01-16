import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { doc, getDoc, setDoc, collection, addDoc, query, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { format } from 'date-fns';
import SectionTitlePink from '../../SectionTitlePink';
import type { FullClientData } from '../../../types/client';

interface BodyZone {
  brasHautDroit: string;
  brasHautGauche: string;
  brasMilieuDroit: string;
  brasMilieuGauche: string;
  brasBasDroit: string;
  brasBasGauche: string;
  ventre: string;
  hanche: string;
  taille: string;
  fesses: string;
  sousFessier: string;
  cuisseHautDroit: string;
  cuisseHautGauche: string;
  cuisseMilieuDroit: string;
  cuisseMilieuGauche: string;
  cuisseBasDroit: string;
  cuisseBasGauche: string;
  molletDroit: string;
  molletGauche: string;
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
      brasHautDroit: '',
      brasHautGauche: '',
      brasMilieuDroit: '',
      brasMilieuGauche: '',
      brasBasDroit: '',
      brasBasGauche: '',
      ventre: '',
      hanche: '',
      taille: '',
      fesses: '',
      sousFessier: '',
      cuisseHautDroit: '',
      cuisseHautGauche: '',
      cuisseMilieuDroit: '',
      cuisseMilieuGauche: '',
      cuisseBasDroit: '',
      cuisseBasGauche: '',
      molletDroit: '',
      molletGauche: '',
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
          brasHautDroit: '',
          brasHautGauche: '',
          brasMilieuDroit: '',
          brasMilieuGauche: '',
          brasBasDroit: '',
          brasBasGauche: '',
          ventre: '',
          hanche: '',
          taille: '',
          fesses: '',
          sousFessier: '',
          cuisseHautDroit: '',
          cuisseHautGauche: '',
          cuisseMilieuDroit: '',
          cuisseMilieuGauche: '',
          cuisseBasDroit: '',
          cuisseBasGauche: '',
          molletDroit: '',
          molletGauche: '',
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

  const handleZoneChange = (zone: keyof BodyZone, value: string) => {
    setNewSession(prev => ({
      ...prev,
      zones: {
        ...prev.zones,
        [zone]: value
      }
    }));
  };

  const renderZoneInput = (label: string, zoneKey: keyof BodyZone) => {
    return (
      <div className="flex items-center gap-2">
        <label className="flex-1 text-sm">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            step="0.1"
            value={newSession.zones[zoneKey]}
            onChange={(e) => handleZoneChange(zoneKey, e.target.value)}
            className="w-20 px-2 py-1 text-sm rounded-md border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
            placeholder="cm"
          />
          <span className="text-xs text-gray-500">cm</span>
        </div>
      </div>
    );
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
            <h4 className="text-md font-semibold text-gray-900 mb-4">Zones traitées et mesures (cm)</h4>

            <div className="space-y-6">
              <div>
                <h5 className="text-sm font-semibold text-brand-pink mb-3">Bras</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {renderZoneInput('Zone 1 - Haut (épaule) Droit', 'brasHautDroit')}
                    {renderZoneInput('Zone 2 - Milieu Droit', 'brasMilieuDroit')}
                    {renderZoneInput('Zone 3 - Bas (coude) Droit', 'brasBasDroit')}
                  </div>
                  <div className="space-y-2">
                    {renderZoneInput('Zone 1 - Haut (épaule) Gauche', 'brasHautGauche')}
                    {renderZoneInput('Zone 2 - Milieu Gauche', 'brasMilieuGauche')}
                    {renderZoneInput('Zone 3 - Bas (coude) Gauche', 'brasBasGauche')}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-brand-pink mb-3">Tronc</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderZoneInput('Ventre', 'ventre')}
                  {renderZoneInput('Hanche', 'hanche')}
                  {renderZoneInput('Taille', 'taille')}
                  {renderZoneInput('Fesses', 'fesses')}
                  {renderZoneInput('Sous-fessier', 'sousFessier')}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-brand-pink mb-3">Cuisses</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {renderZoneInput('Zone 1 - Haut cuisse Droit', 'cuisseHautDroit')}
                    {renderZoneInput('Zone 2 - Milieu cuisse Droit', 'cuisseMilieuDroit')}
                    {renderZoneInput('Zone 3 - Bas cuisse (genoux) Droit', 'cuisseBasDroit')}
                  </div>
                  <div className="space-y-2">
                    {renderZoneInput('Zone 1 - Haut cuisse Gauche', 'cuisseHautGauche')}
                    {renderZoneInput('Zone 2 - Milieu cuisse Gauche', 'cuisseMilieuGauche')}
                    {renderZoneInput('Zone 3 - Bas cuisse (genoux) Gauche', 'cuisseBasGauche')}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-brand-pink mb-3">Mollets</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderZoneInput('Mollet Droit', 'molletDroit')}
                  {renderZoneInput('Mollet Gauche', 'molletGauche')}
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
              {sessions.map((session) => {
                const zonesWithMeasurements = Object.entries(session.zones).filter(([_, value]) => value && value !== '');

                return (
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

                    {zonesWithMeasurements.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <h6 className="text-xs font-semibold text-gray-700 mb-2">Mesures (cm):</h6>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {zonesWithMeasurements.map(([zone, measurement]) => {
                            const zoneLabels: Record<string, string> = {
                              brasHautDroit: 'Bras haut D',
                              brasHautGauche: 'Bras haut G',
                              brasMilieuDroit: 'Bras milieu D',
                              brasMilieuGauche: 'Bras milieu G',
                              brasBasDroit: 'Bras bas D',
                              brasBasGauche: 'Bras bas G',
                              ventre: 'Ventre',
                              hanche: 'Hanche',
                              taille: 'Taille',
                              fesses: 'Fesses',
                              sousFessier: 'Sous-fessier',
                              cuisseHautDroit: 'Cuisse haut D',
                              cuisseHautGauche: 'Cuisse haut G',
                              cuisseMilieuDroit: 'Cuisse milieu D',
                              cuisseMilieuGauche: 'Cuisse milieu G',
                              cuisseBasDroit: 'Cuisse bas D',
                              cuisseBasGauche: 'Cuisse bas G',
                              molletDroit: 'Mollet D',
                              molletGauche: 'Mollet G'
                            };

                            return (
                              <div key={zone} className="text-xs bg-pink-50 text-pink-800 px-2 py-1 rounded flex items-center justify-between">
                                <span className="font-medium">{zoneLabels[zone]}</span>
                                <span className="ml-2 font-semibold">{measurement} cm</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MesojetCorpsForm;
