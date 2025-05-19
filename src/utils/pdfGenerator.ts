import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { FullClientData } from '../types/client';
import type { Measurement } from '../types/measurements';
import type { Session } from '../types/session';
import { TREATMENT_COLLECTIONS } from '../services/collections';

const formatDate = (date: string) => {
  try {
    return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    return '';
  }
};

const addHeader = (doc: jsPDF, title: string) => {
  doc.setFontSize(20);
  doc.setTextColor(236, 72, 153); // primary-500
  doc.text(title, 20, 20);
  doc.setTextColor(0);
  doc.setFontSize(12);
};

const addClientInfo = (doc: jsPDF, client: FullClientData['client']) => {
  doc.setFontSize(14);
  doc.text('Coordonnées', 20, 40);
  
  const info = [
    ['Nom', client.lastName],
    ['Prénom', client.firstName],
    ['Né(e) le', client.birthDate ? formatDate(client.birthDate) : ''],
    ['Age', client.age?.toString() || ''],
    ['Adresse', client.address],
    ['Code postal', client.postalCode],
    ['Ville', client.city],
    ['Email', client.email],
    ['Téléphone', client.phone],
    ['Comment nous avez-vous connu ?', client.referral]
  ];

  autoTable(doc, {
    startY: 50,
    head: [],
    body: info,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 2
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' }
    }
  });
};

const addTreatmentSection = (doc: jsPDF, title: string, data: any) => {
  doc.addPage();
  doc.setFontSize(16);
  doc.text(title, doc.internal.pageSize.width / 2, 20, { align: 'center' });

  let y = 40;
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'object') {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(key, 20, y);
      y += 10;

      doc.setFont('helvetica', 'normal');
      Object.entries(value as any).forEach(([subKey, subValue]) => {
        if (subValue === true) {
          doc.text(`✓ ${subKey}`, 30, y);
          y += 7;
        } else if (subValue === false) {
          doc.text(`✗ ${subKey}`, 30, y);
          y += 7;
        } else if (subValue) {
          const text = `${subKey}: ${subValue}`;
          doc.text(text, 30, y);
          y += 7;
        }
      });
      y += 5;
    } else if (value) {
      const text = `${key}: ${value}`;
      doc.text(text, 20, y);
      y += 7;
    }
  });
};

const addSessionsTable = (doc: jsPDF, sessions: Session[]) => {
  if (sessions.length === 0) return;

  const data = sessions.map(session => {
    const row = [
      formatDate(session.date),
      session.type,
      session.comment || '-'
    ];

    if (session.measurements) {
      row.push(Object.entries(session.measurements)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
      );
    }

    return row;
  });

  autoTable(doc, {
    head: [['Date', 'Type', 'Commentaire', 'Mesures']],
    body: data,
    startY: doc.lastAutoTable?.finalY + 10 || undefined,
    theme: 'striped',
    headStyles: { fillColor: [236, 72, 153] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 30 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 50 }
    }
  });
};

const addMeasurementsChart = (doc: jsPDF, measurements: Measurement[]) => {
  if (measurements.length === 0) return;

  const data = measurements.map(m => [
    formatDate(m.date),
    m.weight.toString(),
    m.comment || '-'
  ]);

  autoTable(doc, {
    head: [['Date', 'Poids (kg)', 'Commentaire']],
    body: data,
    startY: doc.lastAutoTable?.finalY + 10 || undefined,
    theme: 'striped',
    headStyles: { fillColor: [236, 72, 153] }
  });
};

const hasTreatmentData = (clientData: FullClientData, treatmentCollections: string[]) => {
  return treatmentCollections.some(collection => {
    const data = clientData[collection as keyof typeof clientData];
    if (!data || typeof data !== 'object') return false;
    
    return Object.values(data).some(value => {
      if (typeof value === 'object') {
        return Object.values(value).some(v => v !== null && v !== undefined && v !== '');
      }
      return value !== null && value !== undefined && value !== '';
    });
  });
};

export const generateClientPDF = async (
  clientData: FullClientData,
  measurements: Measurement[],
  sessions: Session[]
) => {
  const doc = new jsPDF();

  // Client Information
  addHeader(doc, 'Fiche Client');
  addClientInfo(doc, clientData.client);

  // Treatment Data
  const treatment = clientData.client.treatment;
  const treatmentCollections = TREATMENT_COLLECTIONS[treatment] || [];

  if (hasTreatmentData(clientData, treatmentCollections)) {
    treatmentCollections.forEach(collection => {
      const data = clientData[collection as keyof typeof clientData];
      if (data && Object.keys(data).length > 0) {
        addTreatmentSection(doc, `Données ${collection}`, data);
      }
    });
  }

  // Measurements and Sessions
  if (measurements.length > 0 || sessions.length > 0) {
    doc.addPage();
    addHeader(doc, 'Suivi');
    
    if (measurements.length > 0) {
      doc.setFontSize(14);
      doc.text('Évolution du poids', 20, 40);
      addMeasurementsChart(doc, measurements);
    }

    if (sessions.length > 0) {
      doc.setFontSize(14);
      doc.text('Historique des séances', 20, doc.lastAutoTable?.finalY + 20 || 40);
      addSessionsTable(doc, sessions);
    }
  }

  // Save the PDF
  const fileName = `Fiche_${clientData.client.lastName || 'Client'}_${clientData.client.firstName || ''}_${format(new Date(), 'dd-MM-yyyy')}.pdf`;
  doc.save(fileName);
};