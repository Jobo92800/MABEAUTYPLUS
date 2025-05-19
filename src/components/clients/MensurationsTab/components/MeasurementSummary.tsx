import React from 'react';

interface MeasurementSummaryProps {
  totalLost: Record<string, number>;
}

const MeasurementSummary: React.FC<MeasurementSummaryProps> = ({ totalLost }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Upper Body */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Haut du corps</h3>
        <div className="space-y-2">
          {[
            { label: 'Tour de poitrine', value: totalLost.bustLine },
            { label: 'Dessous poitrine', value: totalLost.underBust },
            { label: 'Tour de taille', value: totalLost.waist },
            { label: 'Tour de ventre', value: totalLost.belly },
            { label: 'Tour de hanches', value: totalLost.hips }
          ].map(item => (
            <div key={item.label} className="flex justify-between">
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className={`font-medium ${item.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.value > 0 ? '-' : '+'}{Math.abs(item.value).toFixed(1)} cm
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Arms */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bras</h3>
        <div className="space-y-2">
          {[
            { label: 'Bras droit', value: totalLost.rightArm },
            { label: 'Bras gauche', value: totalLost.leftArm }
          ].map(item => (
            <div key={item.label} className="flex justify-between">
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className={`font-medium ${item.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.value > 0 ? '-' : '+'}{Math.abs(item.value).toFixed(1)} cm
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legs */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Jambes</h3>
        <div className="space-y-2">
          {[
            { label: 'Cuisse droite', value: totalLost.rightThigh },
            { label: 'Cuisse gauche', value: totalLost.leftThigh },
            { label: 'Mollet droit', value: totalLost.rightCalf },
            { label: 'Mollet gauche', value: totalLost.leftCalf }
          ].map(item => (
            <div key={item.label} className="flex justify-between">
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className={`font-medium ${item.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.value > 0 ? '-' : '+'}{Math.abs(item.value).toFixed(1)} cm
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MeasurementSummary;