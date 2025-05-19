import React, { useState } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface MeasurementFormProps {
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({ onSubmit, onClose }) => {
  const [newMensuration, setNewMensuration] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    bustLine: '',
    underBust: '',
    waist: '',
    belly: '',
    hips: '',
    rightArm: '',
    leftArm: '',
    rightThigh: '',
    leftThigh: '',
    rightCalf: '',
    leftCalf: ''
  });

  return (
    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-900">Nouvelles mensurations</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            name="date"
            id="date"
            required
            value={newMensuration.date}
            onChange={(e) => setNewMensuration({ ...newMensuration, date: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { id: 'bustLine', label: 'Tour de poitrine' },
            { id: 'underBust', label: 'Dessous poitrine' },
            { id: 'waist', label: 'Tour de taille' },
            { id: 'belly', label: 'Tour de ventre' },
            { id: 'hips', label: 'Tour de hanches' },
            { id: 'rightArm', label: 'Tour de bras D' },
            { id: 'leftArm', label: 'Tour de bras G' },
            { id: 'rightThigh', label: 'Tour de cuisses D' },
            { id: 'leftThigh', label: 'Tour de cuisses G' },
            { id: 'rightCalf', label: 'Tour de mollets D' },
            { id: 'leftCalf', label: 'Tour de mollets G' }
          ].map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <input
                type="text"
                name={field.id}
                id={field.id}
                value={newMensuration[field.id as keyof typeof newMensuration]}
                onChange={(e) => setNewMensuration({
                  ...newMensuration,
                  [field.id]: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeasurementForm;