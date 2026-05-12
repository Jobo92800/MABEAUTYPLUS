import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus as PlusIcon, Download } from 'lucide-react';
import { getClients } from '../../services/database';
import { utils, writeFile } from 'xlsx';
import type { Client } from '../../services/database';
import ClientList from '../../components/clients/ClientList';

const ClientsPage = () => {
  const { centerId } = useParams<{ centerId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    if (!centerId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getClients(centerId);
      setClients(data);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      if (err.message?.includes('index')) {
        setError('Les index sont en cours de construction. Veuillez patienter quelques minutes et réessayer.');
      } else {
        setError('Erreur lors du chargement des clients. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [centerId]);

  const handleExportExcel = () => {
    if (!clients?.length) return;

    const exportData = clients.map(client => ({
      'Nom': client.lastName,
      'Prénom': client.firstName,
      'Email': client.email,
      'Téléphone': client.phone,
      'Date de naissance': client.birthDate,
      'Âge': client.age,
      'Adresse': client.address,
      'Code postal': client.postalCode,
      'Ville': client.city,
      'Comment nous a connu': client.referral
    }));

    const wb = utils.book_new();
    const ws = utils.json_to_sheet(exportData);
    utils.book_append_sheet(wb, ws, 'Clients');
    writeFile(wb, 'clients.xlsx');
  };

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    if (!searchQuery.trim()) return clients;

    const query = searchQuery.toLowerCase().trim();
    return clients.filter((client) => {
      return (
        client.firstName?.toLowerCase().includes(query) ||
        client.lastName?.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.phone?.toLowerCase().includes(query)
      );
    });
  }, [clients, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-brand-blue hover:text-brand-pink transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10" style={{ background: 'var(--bg)' }} />
      
      {/* Content */}
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-brand-blue/10 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-brand-blue">
                Clients
              </h1>
              <div className="flex gap-4">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center px-4 py-2 rounded-full text-white bg-brand-blue transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Exporter Excel
                </button>
                <Link
                  to={`/centers/${centerId}/clients/new`}
                  className="flex items-center px-4 py-2 rounded-full text-white bg-brand-pink transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nouveau Client
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Search and List Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-brand-blue/20 rounded-full leading-5 bg-white/80 backdrop-blur-sm
                placeholder-gray-500 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink
                transition-all duration-200"
              placeholder="Rechercher un client..."
            />
          </div>

          {/* Clients List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-brand-blue/10 p-4">
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">
                  {searchQuery.trim() 
                    ? "Aucun client ne correspond à votre recherche" 
                    : "Aucun client enregistré"}
                </p>
              </div>
            ) : (
              <ClientList 
                clients={filteredClients} 
                centerId={centerId!} 
                onClientDeleted={fetchClients}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;