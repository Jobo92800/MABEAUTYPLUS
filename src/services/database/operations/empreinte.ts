import { supabase } from '../../supabase';

export interface EmpreinteAnswerMap {
  [stepIndex: number]: number;
}

export interface EmpreinteContact {
  nom: string;
  prenom: string;
  email: string;
  tel: string;
  adresse: string;
  cp: string;
  ville: string;
  age: string;
}

export interface EmpreinteScores {
  pct: Record<string, number>;
  sortP: string[];
  sortT: string[];
}

export interface EmpreintePayload {
  prenom: string;
  answers: EmpreinteAnswerMap;
  slider: number;
  text: string;
  contact: EmpreinteContact;
  cure: { seances: number; electro: boolean };
  last: EmpreinteScores;
  total: number;
  inbody: Array<[string, string]>;
}

export interface EmpreinteBilanRecord {
  id: string;
  client_id: string | null;
  center_id: string | null;
  client_name: string;
  prenom: string;
  answers: Record<string, unknown>;
  scores: Record<string, unknown>;
  empreinte: Record<string, unknown>;
  total_price: number;
  seances: number;
  electro: boolean;
  validated: boolean;
  created_at: string;
  updated_at: string;
}

function buildRow(
  payload: EmpreintePayload,
  clientId: string | null,
  centerId: string | null,
) {
  const clientName = `${payload.contact.prenom || payload.prenom || ''} ${payload.contact.nom || ''}`.trim();
  const profil = payload.last?.sortP?.[0] || null;
  const terrain = payload.last?.sortT?.[0] || null;

  return {
    client_id: clientId,
    center_id: centerId,
    client_name: clientName,
    prenom: payload.prenom || payload.contact.prenom || '',
    answers: {
      responses: payload.answers,
      slider: payload.slider,
      text: payload.text,
      contact: payload.contact,
      cure: payload.cure,
      inbody: payload.inbody,
    },
    scores: payload.last || {},
    empreinte: { profil, terrain },
    total_price: payload.total || 0,
    seances: payload.cure?.seances || 0,
    electro: !!payload.cure?.electro,
    validated: true,
    updated_at: new Date().toISOString(),
  };
}

export async function saveEmpreinteBilan(
  payload: EmpreintePayload,
  options: { clientId?: string | null; centerId?: string | null } = {},
): Promise<EmpreinteBilanRecord> {
  const row = buildRow(payload, options.clientId ?? null, options.centerId ?? null);
  const { data, error } = await supabase
    .from('client_empreinte_bilans')
    .insert(row)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Impossible d'enregistrer le bilan");
  return data as EmpreinteBilanRecord;
}

export async function getLatestEmpreinteBilan(clientId: string): Promise<EmpreinteBilanRecord | null> {
  const { data, error } = await supabase
    .from('client_empreinte_bilans')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as EmpreinteBilanRecord | null) ?? null;
}
