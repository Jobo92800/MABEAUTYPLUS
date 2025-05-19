import type { Treatment } from '../../../types/client';
import LuxotherapyForm from '../treatments/LuxotherapyForm';
import IShapeForm from '../treatments/IShapeForm';
import AdipologyForm from '../treatments/AdipologyForm';
import MenopauseForm from '../treatments/MenopauseForm';
import MesojetForm from '../treatments/MesojetForm';
import CavitalyseForm from '../treatments/CavitalyseForm';
import RadiofrequencyMesojetForm from '../treatments/RadiofrequencyMesojetForm';
import AdvanceLiftForm from '../treatments/AdvanceLiftForm';
import PressodynamieForm from '../treatments/PressodynamieForm';
import RelaxationForm from '../treatments/RelaxationForm';

export const treatmentCategories = [
  {
    name: 'Luxothérapie',
    treatments: [
      { id: 'luxotherapy', label: 'Perte de Poids' },
      { id: 'relaxation', label: 'Relaxation' },
      { id: 'menopause', label: 'Ménopause' },
    ]
  },
  {
    name: 'Soins Minceur',
    treatments: [
      { id: 'cavitalyse', label: 'Cavita-Lyse' },
      { id: 'radiofrequency-mesojet', label: 'RF Mésojet' },
      { id: 'adipology', label: 'Adipologie' },
      { id: 'ishape', label: 'I-Shape' },
      { id: 'pressodynamie', label: 'Pressodynamie' },
    ]
  },
  {
    name: 'Anti-Âge',
    treatments: [
      { id: 'advance-lift', label: 'Advance Lift' },
      { id: 'mesojet', label: 'Mésojet' },
    ]
  }
];

export const treatmentForms: Record<Treatment, React.ComponentType<any>> = {
  luxotherapy: LuxotherapyForm,
  ishape: IShapeForm,
  adipology: AdipologyForm,
  menopause: MenopauseForm,
  mesojet: MesojetForm,
  cavitalyse: CavitalyseForm,
  'radiofrequency-mesojet': RadiofrequencyMesojetForm,
  'advance-lift': AdvanceLiftForm,
  pressodynamie: PressodynamieForm,
  relaxation: RelaxationForm,
};