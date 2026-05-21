import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { PAYMENT_COLLECTION } from './collections';
import { getCenterConfig } from '../config/centers';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Client } from '../types/client';
import { supabase } from './supabase';

export interface ContractCareItem {
  label: string;
  sessions: number;
  checked: boolean;
}

export interface ContractInstallment {
  label: string;
  amount: string;
  date: string;
  method: string;
}

export interface ContractData {
  // Client
  clientFirstName: string;
  clientLastName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  // Center
  centerName: string;
  centerAddress: string;
  centerPostalCode: string;
  centerCity: string;
  centerPhone: string;
  centerEmail: string;
  centerSocietyName: string;
  centerSiren: string;
  siegeSocialAddress: string;
  siegeSocialPostalCode: string;
  siegeSocialCity: string;
  // CGV dynamic fields
  cgvSocietyName: string;
  cgvSiren: string;
  // Contract
  signatureDate: string;
  signatureCity: string;
  // Cure
  careItems: ContractCareItem[];
  totalAmount: string;
  installmentCount: number;
  deposit: ContractInstallment | null;
  installments: ContractInstallment[];
}

// Mapping: care service IDs → contract article lines
// Each contract line can aggregate multiple care service IDs
const CONTRACT_LINES: Array<{
  contractLabel: string;
  careServiceIds: string[];
}> = [
  { contractLabel: 'Electrostimulation', careServiceIds: ['ishape'] },
  { contractLabel: 'Luxothérapie', careServiceIds: ['luxo-pdp', 'luxo-relax', 'luxo-meno'] },
  { contractLabel: 'Pressodynamie', careServiceIds: ['presso'] },
  { contractLabel: 'Soins minceur / soins esthétiques corps', careServiceIds: ['cavitalyse', 'adipologie', 'meso-corps'] },
  { contractLabel: 'Soins visage', careServiceIds: ['meso-visage', 'advance-lift'] },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cheque: 'Chèque',
  especes: 'Espèces',
  cb: 'Carte bancaire',
  alma: 'Alma',
  virement: 'Virement',
  '': '',
};

function formatPaymentMethod(method: string): string {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'dd/MM/yyyy', { locale: fr });
  } catch {
    return dateStr;
  }
}

export async function buildContractData(client: Client): Promise<ContractData | null> {
  const centerId = client.centerId;
  const centerConfig = getCenterConfig(centerId);
  if (!centerConfig) return null;

  // Load payment data from Firestore
  let paymentCategories: any[] = [];
  if (client.id) {
    try {
      const paymentDoc = await getDoc(doc(db, PAYMENT_COLLECTION, client.id));
      if (paymentDoc.exists()) {
        const data = paymentDoc.data();
        paymentCategories = data.categories ?? [];
      }
    } catch {
      // no payment data
    }
  }

  // Use first category for the contract (primary cure)
  const category = paymentCategories[0] ?? null;

  // Build care items from payment category careServices
  const careItems: ContractCareItem[] = CONTRACT_LINES.map((line) => {
    let totalSessions = 0;
    let found = false;

    if (category?.careServices) {
      for (const cs of category.careServices as Array<{ id: string; sessions: string }>) {
        if (line.careServiceIds.includes(cs.id)) {
          const n = parseInt(cs.sessions, 10);
          if (!isNaN(n) && n > 0) {
            totalSessions += n;
            found = true;
          }
        }
      }
    }

    return {
      label: line.contractLabel,
      sessions: totalSessions,
      checked: found,
    };
  });

  // Total amount
  const totalAmount = category?.totalAmount
    ? parseFloat(category.totalAmount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
    : '';

  // Deposit
  let deposit: ContractInstallment | null = null;
  if (category?.deposit?.amount) {
    deposit = {
      label: 'Acompte',
      amount: parseFloat(category.deposit.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €',
      date: formatDate(category.deposit.date),
      method: formatPaymentMethod(category.deposit.method),
    };
  }

  // Installments
  const installments: ContractInstallment[] = (category?.installments ?? [])
    .filter((inst: any) => inst.amount)
    .map((inst: any, index: number) => ({
      label: `Échéance ${index + 1}`,
      amount: parseFloat(inst.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €',
      date: formatDate(inst.date),
      method: formatPaymentMethod(inst.method),
    }));

  const installmentCount = (deposit ? 1 : 0) + installments.length;

  return {
    clientFirstName: client.firstName,
    clientLastName: client.lastName,
    clientPhone: client.phone,
    clientEmail: client.email,
    clientAddress: client.address,
    clientPostalCode: client.postalCode,
    clientCity: client.city,
    centerName: centerConfig.name,
    centerAddress: centerConfig.address,
    centerPostalCode: centerConfig.postalCode,
    centerCity: centerConfig.city,
    centerPhone: centerConfig.phone,
    centerEmail: centerConfig.email,
    centerSocietyName: centerConfig.societyName,
    centerSiren: centerConfig.siren,
    siegeSocialAddress: centerConfig.siegeSocial.address,
    siegeSocialPostalCode: centerConfig.siegeSocial.postalCode,
    siegeSocialCity: centerConfig.siegeSocial.city,
    cgvSocietyName: centerConfig.societyName,
    cgvSiren: centerConfig.siren.replace(/\s/g, ''),
    signatureDate: format(new Date(), 'dd MMMM yyyy', { locale: fr }),
    signatureCity: centerConfig.city,
    careItems,
    totalAmount,
    installmentCount,
    deposit,
    installments,
  };
}

export interface SignedContractRecord {
  id: string;
  client_id: string;
  center_id: string;
  client_name: string;
  signed_at: string;
  pdf_data: string;
  contract_data: any;
}

export async function saveSignedContract(
  clientId: string,
  centerId: string,
  clientName: string,
  pdfBase64: string,
  contractData: ContractData
): Promise<string> {
  const { data, error } = await supabase
    .from('signed_contracts')
    .insert({
      client_id: clientId,
      center_id: centerId,
      client_name: clientName,
      signed_at: new Date().toISOString(),
      pdf_data: pdfBase64,
      contract_data: contractData,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getSignedContracts(clientId: string): Promise<SignedContractRecord[]> {
  const { data, error } = await supabase
    .from('signed_contracts')
    .select('id, client_id, center_id, client_name, signed_at, contract_data')
    .eq('client_id', clientId)
    .order('signed_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getSignedContractPdf(contractId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('signed_contracts')
    .select('pdf_data')
    .eq('id', contractId)
    .maybeSingle();

  if (error) throw error;
  return data?.pdf_data ?? null;
}
