export interface Measurement {
  id?: string;
  clientId: string;
  centerId: string;
  date: string;
  weight: number;
  comment?: string;
  photoTaken?: boolean;
  cureNumber?: number;
}

export interface Mensuration {
  id?: string;
  clientId: string;
  centerId: string;
  date: string;
  bustLine: string;
  underBust: string;
  waist: string;
  belly: string;
  hips: string;
  rightArm: string;
  leftArm: string;
  rightThigh: string;
  leftThigh: string;
  rightCalf: string;
  leftCalf: string;
}