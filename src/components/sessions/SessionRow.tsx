import React, { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { updateMeasurement, deleteMeasurement } from '../../services/database';
import type { Measurement } from '../../types/measurements';

interface SessionRowProps {
  session: Measurement;
  onUpdate: () => void;
  previousWeight?: number;
}

const SessionRow: React.FC<SessionRowProps> = ({ session, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    date: session.date,
    weight: session.weight,
    comment: session.comment || '',
    photoTaken: session.photoTaken || false
  });

  const handleSave = async () => {
    try {
      await updateMeasurement({
        ...session,
        ...editedData
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating measurement:', error);
      alert('Erreur lors de la mise à jour de la mesure');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette mesure ?')) {
      return;
    }

    try {
      await deleteMeasurement(session.id!);
      onUpdate();
    } catch (error) {
      console.error('Error deleting measurement:', error);
      alert('Erreur lors de la suppression de la mesure');
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-4 p-2 bg-gray-50">
        <input
          type="date"
          value={editedData.date}
          onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
          className="rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
        />
        <input
          type="number"
          step="0.1"
          value={editedData.weight}
          onChange={(e) => setEditedData({ ...editedData, weight: parseFloat(e.target.value) })}
          className="w-24 rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
        />
        <input
          type="text"
          value={editedData.comment}
          onChange={(e) => setEditedData({ ...editedData, comment: e.target.value })}
          placeholder="Commentaire"
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
        />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editedData.photoTaken}
              onChange={(e) => setEditedData({ ...editedData, photoTaken: e.target.checked })}
              className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            <span className="text-sm text-gray-600">Photo</span>
          </label>
          <button
            onClick={handleSave}
            className="text-brand-blue hover:text-brand-blue/80"
          >
            <Check className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end space-x-2">
      <button
        onClick={() => setIsEditing(true)}
        className="text-brand-blue hover:text-brand-blue/80"
      >
        <Pencil className="h-5 w-5" />
      </button>
      <button
        onClick={handleDelete}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
};

export default SessionRow;