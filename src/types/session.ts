export interface Session {
  id?: string;
  clientId: string;
  centerId: string;
  date: string;
  type: 'relaxation' | 'menopause' | 'ishape' | 'adipology' | 'cavitalyse' | 'advance-lift' | 'pressodynamie' | 'mesojet';
  comment: string;
  photoTaken?: boolean;
  measurements?: Record<string, any>;
  number?: number;
  weight?: number;
  updatedAt?: string;
}