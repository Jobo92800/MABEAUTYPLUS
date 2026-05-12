import React from 'react';
import { Users, TrendingUp, Calendar } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { name: 'Clients Actifs', value: '42', icon: Users },
    { name: 'Rendez-vous Aujourd\'hui', value: '8', icon: Calendar },
    { name: 'Objectifs Atteints', value: '15', icon: TrendingUp },
  ];

  const recentClients = [
    { id: 1, name: 'Sophie Martin', appointment: '14:30', status: 'Confirmé' },
    { id: 2, name: 'Marie Dubois', appointment: '15:45', status: 'En attente' },
    { id: 3, name: 'Claire Bernard', appointment: '16:30', status: 'Confirmé' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="bg-white overflow-hidden shadow-sm rounded-xl border"
              style={{ borderColor: 'var(--line)' }}
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.name}
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {item.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white shadow-sm rounded-xl border" style={{ borderColor: 'var(--line)' }}>
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Rendez-vous du Jour
          </h3>
        </div>
        <div className="border-t" style={{ borderColor: 'var(--line)' }}>
          <ul className="divide-y" style={{ borderColor: 'var(--line)' }}>
            {recentClients.map((client) => (
              <li key={client.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {client.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {client.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {client.appointment}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.status === 'Confirmé'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;