import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';

export const deleteNote = async (clientId: string, noteToDelete: { text: string; date: any }) => {
  try {
    const noteRef = doc(db, 'client-notes', clientId);
    await updateDoc(noteRef, {
      notes: arrayRemove(noteToDelete)
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    throw new Error('Failed to delete note');
  }
};