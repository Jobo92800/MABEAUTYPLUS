import React, { useState, useEffect } from 'react';
import { X, Send, Clock, Trash2 } from 'lucide-react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { deleteNote } from '../../services/database';
import type { Client } from '../../services/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

interface ClientNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  centerId: string;
  onNoteAdded?: () => void;
  position?: { top: number };
}

interface Note {
  text: string;
  date: Timestamp;
}

const ClientNoteModal: React.FC<ClientNoteModalProps> = ({ isOpen, onClose, client, centerId, onNoteAdded, position }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!client?.id) return;
      
      try {
        setLoading(true);
        const noteDoc = await getDoc(doc(db, 'client-notes', client.id));
        if (noteDoc.exists()) {
          setNotes(noteDoc.data().notes || []);
        } else {
          setNotes([]);
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast.error('Erreur lors du chargement des notes');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchNotes();
    }
  }, [client?.id, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client?.id || !newNote.trim()) return;

    try {
      const noteRef = doc(db, 'client-notes', client.id);
      const newNoteObj = {
        text: newNote.trim(),
        date: Timestamp.now()
      };
      
      await setDoc(noteRef, {
        notes: [...notes, newNoteObj]
      }, { merge: true });

      setNotes(prev => [...prev, newNoteObj]);
      setNewNote('');
      onNoteAdded?.();
      toast.success('Note ajoutée avec succès');
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Erreur lors de l\'ajout de la note');
    }
  };

  const handleDeleteNote = async (noteToDelete: Note) => {
    if (!client?.id) return;
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      return;
    }

    try {
      await deleteNote(client.id, noteToDelete);
      setNotes(prev => prev.filter(note => note.date !== noteToDelete.date));
      toast.success('Note supprimée avec succès');
      onNoteAdded?.();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Erreur lors de la suppression de la note');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center" style={{ paddingTop: position?.top || 96 }}>
      <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Notes - {client?.firstName} {client?.lastName}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Notes List */}
        <div className="max-h-[400px] overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
            </div>
          ) : notes.length > 0 ? (
            <div className="space-y-4">
              {[...notes].reverse().map((note, index) => (
                <div 
                  key={index} 
                  className="group relative rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.text}</p>
                    <button
                      onClick={() => handleDeleteNote(note)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <Clock className="mr-1 h-3 w-3" />
                    {format(note.date.toDate(), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">Aucune note</p>
            </div>
          )}
        </div>

        {/* Add Note Form */}
        <div className="border-t border-gray-100 bg-gray-50/80 px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="note" className="sr-only">Nouvelle note</label>
              <textarea
                id="note"
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ajouter une note..."
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="inline-flex items-center rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 mr-2" />
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientNoteModal;