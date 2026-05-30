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
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

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
    setDeleteTarget(client);
    setPasswordInput('');
    setPasswordError(false);
  };

  const confirmDelete = async () => {
    if (passwordInput !== 'Admin') {
      setPasswordError(true);
      return;
    }
    if (!deleteTarget) return;
    try {
      await deleteClient(deleteTarget.id!, deleteTarget.treatment);
      toast.success('Client supprimé avec succès');
      setDeleteTarget(null);
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
                  className="rounded-full bg-white p-2 text-brand-pink hover:bg-brand-pink/5 transition-colors duration-200"
                  title="Notes"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
                <Link
                  to={`/centers/${centerId}/clients/${client.id}/edit`}
                  className="rounded-full bg-white p-2 text-brand-blue hover:bg-brand-blue/5 transition-colors duration-200"
                  title="Modifier"
                >
                  <PencilIcon className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDeleteClient(client)}
                  className="rounded-full bg-white p-2 text-red-500 hover:bg-red-50 transition-colors duration-200"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Supprimer le client</h3>
                <p className="text-sm text-gray-500">{deleteTarget.firstName} {deleteTarget.lastName}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Cette action est irréversible. Entrez le mot de passe administrateur pour confirmer.</p>
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                onKeyDown={(e) => e.key === 'Enter' && confirmDelete()}
                placeholder="Mot de passe"
                autoFocus
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  passwordError
                    ? 'border-red-400 focus:ring-red-300'
                    : 'border-gray-300 focus:ring-brand-blue/30 focus:border-brand-blue'
                }`}
              />
              {passwordError && (
                <p className="mt-1.5 text-xs text-red-500">Mot de passe incorrect.</p>
              )}
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

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