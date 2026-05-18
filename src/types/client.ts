export interface CureInstallment {
  index: number;
  amount: number;
}

export interface ClientCureData {
  totalPrice: number;
  installmentCount: number;
  installments: CureInstallment[];
  savedAt: string;
  treatments: Array<{ name: string; sessions: number; pricePerSession: number }>;
}

export interface Client {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  age: number;
  address: string;
  postalCode: string;
  city: string;
  referral: string;
  centerId: string;
  treatment: Treatment;
  therapist: string;
  cureData?: ClientCureData;
  createdAt: string;
  updatedAt: string;
}

export type Treatment =
  | 'luxotherapy'
  | 'ishape'
  | 'adipology'
  | 'menopause'
  | 'mesojet'
  | 'mesojet-corps'
  | 'cavitalyse'
  | 'radiofrequency-mesojet'
  | 'advance-lift'
  | 'pressodynamie'
  | 'relaxation'
  | 'psio';