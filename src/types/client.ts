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
  therapist: string; // Added therapist field
  createdAt: string;
  updatedAt: string;
}

export type Treatment = 
  | 'luxotherapy' 
  | 'ishape' 
  | 'adipology' 
  | 'menopause' 
  | 'mesojet' 
  | 'cavitalyse' 
  | 'radiofrequency-mesojet'
  | 'advance-lift'
  | 'pressodynamie'
  | 'relaxation';