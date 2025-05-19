import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import MensurationRow from '../../../sessions/MensurationRow';
import type { Mensuration } from '../../../../types/measurements';

interface MeasurementTableProps {
  mensurations: Mensuration[];
  onUpdate: () => void;
}

const MeasurementTable: React.FC<MeasurementTableProps> = ({ mensurations, onUpdate }) => {
  // Sort mensurations by date (newest first)
  const sortedMensurations = [...mensurations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="mt-6 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">N°</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tour de poitrine</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Dessous poitrine</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tour de taille</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tour de ventre</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tour de hanches</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tour de bras D/G</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tour de cuisses D/G</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tour de mollets D/G</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedMensurations.map((mensuration, index) => (
                <tr key={mensuration.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
                    <MensurationRow
                      mensuration={mensuration}
                      onUpdate={onUpdate}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MeasurementTable;