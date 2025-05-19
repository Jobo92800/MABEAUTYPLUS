export const TREATMENT_COLLECTIONS = {
  relaxation: ['relaxationHealth', 'relaxationLifestyle'],
  menopause: ['menopauseHealth', 'menopauseLifestyle'],
  cavitalyse: ['cavitalyseSkin', 'cavitalyseLifestyle', 'cavitalyseTreatment'],
  'radiofrequency-mesojet': ['RFmesojetBilan', 'RFmesojetHygiene'],
  ishape: ['bilanishape', 'objishape'],
  adipology: ['bilanAdipo', 'hygieneAdipo'],
  'advance-lift': ['bilanAdvancelift', 'cureadvancelift'],
  pressodynamie: ['prbpresso', 'curepresso'],
  mesojet: ['bilanmeso'], // Correction ici - utilisation d'une seule collection
  luxotherapy: ['bilanluxo', 'bilanluxoalim', 'objectives']
} as const;

export const PAYMENT_COLLECTION = 'payments';