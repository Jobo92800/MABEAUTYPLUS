import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { updateMensuration, deleteMensuration } from '../../services/measurements';
import type { Mensuration } from '../../types/measurements';

interface MensurationRowProps {
  mensuration: Mensuration;
  onUpdate: () => void;
}

const MensurationRow: React.FC<MensurationRowProps> = ({ mensuration, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    bustLine: mensuration.bustLine || '',
    underBust: mensuration.underBust || '',
    waist: mensuration.waist || '',
    belly: mensuration.belly || '',
    hips: mensuration.hips || '',
    rightArm: mensuration.rightArm || '',
    leftArm: mensuration.leftArm || '',
    rightThigh: mensuration.rightThigh || '',
    leftThigh: mensuration.leftThigh || '',
    rightCalf: mensuration.rightCalf || '',
    leftCalf: mensuration.leftCalf || ''
  });

  const handleSave = async () => {
    try {
      await updateMensuration({
        ...mensuration,
        ...editedData
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating mensuration:', error);
      alert('Erreur lors de la mise à jour des mensurations');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ces mensurations ?')) {
      return;
    }

    try {
      await deleteMensuration(mensuration.id!);
      onUpdate();
    } catch (error) {
      console.error('Error deleting mensuration:', error);
      alert('Erreur lors de la suppression des mensurations');
    }
  };

  if (isEditing) {
    return (
      <tr>
        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
          {format(new Date(mensuration.date), 'dd MMMM yyyy', { locale: fr })}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm">
          <input
            type="text"
            value={editedData.bustLine}
            onChange={(e) => setEditedData({ ...editedData, bustLine: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
          />
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm">
          <input
            type="text"
            value={editedData.underBust}
            onChange={(e) => setEditedData({ ...editedData, underBust: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
          />
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm">
          <input
            type="text"
            value={editedData.waist}
            onChange={(e) => setEditedData({ ...editedData, waist: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
          />
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm">
          <input
            type="text"
            value={editedData.belly}
            onChange={(e) => setEditedData({ ...editedData, belly: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
          />
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm">
          <input
            type="text"
            value={editedData.hips}
            onChange={(e) => setEditedData({ ...editedData, hips: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
          />
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm">
          <div className="flex gap-1">
            <input
              type="text"
              value={editedData.rightArm}
              onChange={(e) => setEditedData({ ...editedData, rightArm: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
              placeholder="D"
            />
            <input
              type="text"
              value={editedData.leftArm}
              onChange={(e) => setEditedData({ ...editedData, leftArm: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
              placeholder="G"
            />
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm">
          <div className="flex gap-1">
            <input
              type="text"
              value={editedData.rightThigh}
              onChange={(e) => setEditedData({ ...editedData, rightThigh: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
              placeholder="D"
            />
            <input
              type="text"
              value={editedData.leftThigh}
              onChange={(e) => setEditedData({ ...editedData, leftThigh: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
              placeholder="G"
            />
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm">
          <div className="flex gap-1">
            <input
              type="text"
              value={editedData.rightCalf}
              onChange={(e) => setEditedData({ ...editedData, rightCalf: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
              placeholder="D"
            />
            <input
              type="text"
              value={editedData.leftCalf}
              onChange={(e) => setEditedData({ ...editedData, leftCalf: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
              placeholder="G"
            />
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
          <div className="flex justify-end space-x-2">
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
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
        {format(new Date(mensuration.date), 'dd MMMM yyyy', { locale: fr })}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{mensuration.bustLine}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{mensuration.underBust}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{mensuration.waist}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{mensuration.belly}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{mensuration.hips}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {mensuration.rightArm}/{mensuration.leftArm}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {mensuration.rightThigh}/{mensuration.leftThigh}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {mensuration.rightCalf}/{mensuration.leftCalf}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
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
      </td>
    </tr>
  );
};

export default MensurationRow;