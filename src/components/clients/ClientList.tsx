import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pencil as PencilIcon, CircleUser as UserCircle, MessageSquare, Trash2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { deleteClient } from '../../services/database';
import type { Client } from '../../services/database';
import ClientNoteModal from './ClientNoteModal';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ClientListProps {
  clients: Client[];
  centerId: string;
  onClientDeleted: () => void;
}

interface ClientNote {
  text: string;
  date: { toDate: () => Date };
}

interface PaymentLine {
  amount: string;
  isPaid: boolean;
  isGiven: boolean;
}

interface PaymentCategory {
  deposit?: {
    amount: string;
    isPaid: boolean;
    isGiven: boolean;
  };
  installments: PaymentLine[];
}

const ClientList: React.FC<ClientListProps> = ({ clients, centerId, onClientDeleted }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [clientNotes, setClientNotes] = useState<Record<string, ClientNote[]>>({});
  const [clientPayments, setClientPayments] = useState<Record<string, PaymentCategory[]>>({});
  const [modalPosition, setModalPosition] = useState<{ top: number } | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      const dataPromises = clients.map(async (client) => {
        try {
          const [noteDoc, paymentDoc] = await Promise.all([
            getDoc(doc(db, 'client-notes', client.id!)),
            getDoc(doc(db, 'payments', client.id!))
          ]);
          
          return {
            clientId: client.id!,
            notes: noteDoc.exists() ? noteDoc.data().notes || [] : [],
            payments: paymentDoc.exists() ? paymentDoc.data().categories || [] : []
          };
        } catch (error) {
          console.error('Error fetching data for client:', client.id, error);
          return { clientId: client.id!, notes: [], payments: [] };
        }
      });

      const results = await Promise.all(dataPromises);
      
      const notesMap: Record<string, ClientNote[]> = {};
      const paymentsMap: Record<string, PaymentCategory[]> = {};
      
      results.forEach(({ clientId, notes, payments }) => {
        notesMap[clientId] = notes;
        paymentsMap[clientId] = payments;
      });
      
      setClientNotes(notesMap);
      setClientPayments(paymentsMap);
    };

    fetchData();
  }, [clients]);

  const handleDeleteClient = async (client: Client) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${client.firstName} ${client.lastName} ?`)) {
      return;
    }

    try {
      await deleteClient(client.id!, client.treatment);
      toast.success('Client supprimé avec succès');
      onClientDeleted();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Erreur lors de la suppression du client');
    }
  };

  const getLatestNote = (clientId: string): ClientNote | null => {
    const notes = clientNotes[clientId] || [];
    if (notes.length === 0) return null;
    return notes[notes.length - 1];
  };

  const handleOpenNoteModal = (client: Client, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    setModalPosition({ top: rect.top + scrollTop - 20 });
    setSelectedClient(client);
    setIsNoteModalOpen(true);
  };

  // Nouvelle logique simplifiée pour détecter les règlements en retard
  const hasOverduePayments = (clientId: string): boolean => {
    const payments = clientPayments[clientId] || [];

    return payments.some(category => {
      // Vérifier l'acompte
      if (category.deposit?.amount && parseFloat(category.deposit.amount) > 0) {
        // Si ni payé ni donné -> en retard
        if (!category.deposit.isPaid && !category.deposit.isGiven) {
          return true;
        }
      }

      // Vérifier les échéances
      return category.installments.some(payment => {
        // Si il y a un montant et que ni payé ni donné -> en retard
        if (payment.amount && parseFloat(payment.amount) > 0) {
          if (!payment.isPaid && !payment.isGiven) {
            return true;
          }
        }
        return false;
      });
    });
  };

  return (
    <>
      <ul role="list" className="divide-y divide-gray-100">
        {clients.map((client) => {
          const latestNote = getLatestNote(client.id!);
          const isOverdue = hasOverduePayments(client.id!);
          
          return (
            <li key={client.id} className="flex justify-between gap-x-6 py-5 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex min-w-0 gap-x-4">
                <div className="h-12 w-12 flex-none rounded-full bg-gradient-to-br from-brand-blue/10 to-brand-pink/10 flex items-center justify-center">
                  <UserCircle className="h-8 w-8 text-brand-blue" />
                </div>
                <div className="min-w-0 flex-auto">
                  <p className={`text-sm font-semibold leading-6 ${isOverdue ? 'text-red-500' : 'text-gray-900'}`}>
                    {client.firstName} {client.lastName}
                  </p>
                  <p className="mt-1 truncate text-xs leading-5 text-gray-500">{client.email}</p>
                  <p className="text-xs leading-5 text-gray-500">{client.phone}</p>
                  {latestNote && (
                    <div className="mt-2 text-xs text-gray-600 bg-red-50 p-2 rounded-md border border-red-100">
                      <p className="line-clamp-2">{latestNote.text}</p>
                      <p className="text-gray-400 mt-1 text-[11px]">
                        {format(latestNote.date.toDate(), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleOpenNoteModal(client, e)}
                  className="rounded-full p-2 text-brand-pink transition-colors duration-200"
                  style={{ backgroundColor: 'var(--secondary-soft)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(218,51,191,0.18)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--secondary-soft)')}
                  title="Notes"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
                <Link
                  to={`/centers/${centerId}/clients/${client.id}/edit`}
                  className="rounded-full p-2 text-brand-blue transition-colors duration-200"
                  style={{ backgroundColor: 'var(--primary-soft)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(50,172,222,0.18)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--primary-soft)')}
                  title="Modifier"
                >
                  <PencilIcon className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDeleteClient(client)}
                  className="rounded-full p-2 text-red-500 transition-colors duration-200"
                  style={{ backgroundColor: 'rgba(254,226,226,0.6)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(254,202,202,0.8)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(254,226,226,0.6)')}
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <ClientNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setSelectedClient(null);
          setModalPosition(undefined);
        }}
        client={selectedClient}
        centerId={centerId}
        position={modalPosition}
        onNoteAdded={() => {
          // Refresh notes after adding a new one
          const fetchNotes = async () => {
            if (selectedClient?.id) {
              const noteDoc = await getDoc(doc(db, 'client-notes', selectedClient.id));
              if (noteDoc.exists()) {
                setClientNotes(prev => ({
                  ...prev,
                  [selectedClient.id!]: noteDoc.data().notes || []
                }));
              }
            }
          };
          fetchNotes();
        }}
      />
    </>
  );
};

export default ClientList;