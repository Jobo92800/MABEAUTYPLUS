export interface CenterConfig {
  id: string;
  name: string;
  societyName: string;
  siren: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  siegeSocial: {
    address: string;
    postalCode: string;
    city: string;
  };
}

export const CENTERS_CONFIG: Record<string, CenterConfig> = {
  'grau-du-roi': {
    id: 'grau-du-roi',
    name: 'Le Grau-du-Roi',
    societyName: 'MB1PRO',
    siren: '853 874 428 00016',
    address: '577 Rue des Tamaris',
    postalCode: '30240',
    city: 'Le Grau-du-Roi',
    phone: '04 66 73 02 00',
    email: 'contact@mabeautyplus.fr',
    siegeSocial: {
      address: '577 Rue des Tamaris',
      postalCode: '30240',
      city: 'Le Grau-du-Roi',
    },
  },
  'le-cres': {
    id: 'le-cres',
    name: 'Le Crès',
    societyName: 'MB2PRO',
    siren: '982 876 047 00019',
    address: '1 Avenue des Chasseurs',
    postalCode: '34920',
    city: 'Le Crès',
    phone: '04 66 73 02 00',
    email: 'contact@mabeautyplus.fr',
    siegeSocial: {
      address: '577 Rue des Tamaris',
      postalCode: '30240',
      city: 'Le Grau-du-Roi',
    },
  },
  'serignant': {
    id: 'serignant',
    name: 'Sérignan',
    societyName: 'MB3PRO',
    siren: '928 646 322 00018',
    address: '120 Avenue de la Plage',
    postalCode: '34410',
    city: 'Sérignan',
    phone: '04 66 73 02 00',
    email: 'contact@mabeautyplus.fr',
    siegeSocial: {
      address: '577 Rue des Tamaris',
      postalCode: '30240',
      city: 'Le Grau-du-Roi',
    },
  },
  'cabestany': {
    id: 'cabestany',
    name: 'Cabestany',
    societyName: 'MB4PRO',
    siren: '938 742 541 00015',
    address: '4 Rue Ambroise Croizat',
    postalCode: '66330',
    city: 'Cabestany',
    phone: '04 66 73 02 00',
    email: 'contact@mabeautyplus.fr',
    siegeSocial: {
      address: '577 Rue des Tamaris',
      postalCode: '30240',
      city: 'Le Grau-du-Roi',
    },
  },
  'avignon': {
    id: 'avignon',
    name: 'Avignon',
    societyName: 'MB5PRO',
    siren: '102 009 677 00018',
    address: '8 Bd de la Fraternité',
    postalCode: '84140',
    city: 'Avignon',
    phone: '04 66 73 02 00',
    email: 'contact@mabeautyplus.fr',
    siegeSocial: {
      address: '577 Rue des Tamaris',
      postalCode: '30240',
      city: 'Le Grau-du-Roi',
    },
  },
};

export function getCenterConfig(centerId: string): CenterConfig | null {
  return CENTERS_CONFIG[centerId] ?? null;
}
