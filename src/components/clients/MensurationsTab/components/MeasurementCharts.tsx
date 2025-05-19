import React from 'react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { Mensuration } from '../../../../types/measurements';

interface MeasurementChartsProps {
  mensurations: Mensuration[];
}

const MeasurementCharts: React.FC<MeasurementChartsProps> = ({ mensurations }) => {
  const chartData = mensurations.map(m => ({
    date: format(new Date(m.date), 'dd/MM'),
    poitrine: parseFloat(m.bustLine) || null,
    taille: parseFloat(m.waist) || null,
    ventre: parseFloat(m.belly) || null,
    hanches: parseFloat(m.hips) || null,
    cuisseDroite: parseFloat(m.rightThigh) || null,
    cuisseGauche: parseFloat(m.leftThigh) || null
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Upper Body Chart */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4">
        <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
          Évolution Poitrine et Taille
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="poitrine" 
                name="Tour de poitrine" 
                stroke="#35aedc" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="taille" 
                name="Tour de taille" 
                stroke="#f42abe" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="ventre" 
                name="Tour de ventre" 
                stroke="#10B981" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lower Body Chart */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4">
        <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
          Évolution Hanches et Cuisses
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="hanches" 
                name="Tour de hanches" 
                stroke="#35aedc" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="cuisseDroite" 
                name="Cuisse droite" 
                stroke="#f42abe" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="cuisseGauche" 
                name="Cuisse gauche" 
                stroke="#10B981" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MeasurementCharts;