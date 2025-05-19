import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { FullClientData } from '../types/client';
import type { Measurement } from '../types/measurements';
import type { Session } from '../types/session';

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return '';
  }
};

const drawLineChart = (
  doc: jsPDF,
  data: { x: string; y: number }[],
  startY: number,
  title: string,
  yLabel: string
) => {
  const margin = 20;
  const width = doc.internal.pageSize.width - 2 * margin;
  const height = 100;
  const chartEndY = startY + height;

  // Title
  doc.setFontSize(12);
  doc.text(title, margin, startY - 10);

  // Y-axis label
  doc.setFontSize(8);
  doc.text(yLabel, margin - 15, startY + height/2, { angle: 90 });

  if (data.length === 0) return chartEndY;

  // Calculate scales
  const yValues = data.map(d => d.y);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const yRange = maxY - minY;

  // Draw axes
  doc.line(margin, startY, margin, chartEndY); // Y axis
  doc.line(margin, chartEndY, margin + width, chartEndY); // X axis

  // Plot points and lines
  data.forEach((point, i) => {
    const x = margin + (i * (width / (data.length - 1)));
    const y = chartEndY - ((point.y - minY) * (height / yRange));

    // Draw point
    doc.circle(x, y, 1, 'F');

    // Draw line to next point
    if (i < data.length - 1) {
      const nextX = margin + ((i + 1) * (width / (data.length - 1)));
      const nextY = chartEndY - ((data[i + 1].y - minY) * (height / yRange));
      doc.line(x, y, nextX, nextY);
    }

    // X-axis label
    doc.setFontSize(8);
    doc.text(point.x, x - 8, chartEndY + 10);
  });

  // Y-axis labels
  const ySteps = 5;
  for (let i = 0; i <= ySteps; i++) {
    const value = minY + (i * (yRange / ySteps));
    const y = chartEndY - (i * (height / ySteps));
    doc.text(value.toFixed(1), margin - 15, y);
    doc.line(margin - 2, y, margin, y);
  }

  return chartEndY + 20;
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
        const text = `${subKey}: ${subValue}`;
        doc.text(text, 30, y);
        y += 7;
      });
      y += 5;
    } else {
      const text = `${key}: ${value}`;
      doc.text(text, 20, y);
      y += 7;
    }
  });
};

export const generateClientPDF = async (
  clientData: FullClientData,
  measurements: Measurement[],
  sessions: Session[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Client Information Page
  doc.setFontSize(20);
  doc.text('Fiche Client', pageWidth / 2, 20, { align: 'center' });

  // Basic Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations Client', 20, 40);
  doc.setFont('helvetica', 'normal');

  const clientInfo = [
    ['Nom:', clientData.client.lastName || ''],
    ['Prénom:', clientData.client.firstName || ''],
    ['Date de naissance:', formatDate(clientData.client.birthDate)],
    ['Âge:', clientData.client.age?.toString() || ''],
    ['Email:', clientData.client.email || ''],
    ['Téléphone:', clientData.client.phone || ''],
    ['Adresse:', clientData.client.address || ''],
    ['Code postal:', clientData.client.postalCode || ''],
    ['Ville:', clientData.client.city || ''],
    ['Comment nous avez-vous connu ?', clientData.client.referral || '']
  ];

  let y = 50;
  clientInfo.forEach(([label, value]) => {
    doc.text(`${label} ${value}`, 20, y);
    y += 7;
  });

  // Treatment-specific data
  switch (clientData.client.treatment) {
    case 'ishape':
      if (clientData.bilanishape) {
        addTreatmentSection(doc, 'Bilan I-Shape', clientData.bilanishape);
      }
      if (clientData.objishape) {
        addTreatmentSection(doc, 'Objectifs I-Shape', clientData.objishape);
      }
      break;

    case 'adipology':
      if (clientData.bilanAdipo) {
        addTreatmentSection(doc, 'Bilan Adipologie', clientData.bilanAdipo);
      }
      if (clientData.hygieneAdipo) {
        addTreatmentSection(doc, 'Hygiène Adipologie', clientData.hygieneAdipo);
      }
      break;

    case 'cavitalyse':
      if (clientData.cavitalyseSkin) {
        addTreatmentSection(doc, 'Bilan Cavita-Lyse', clientData.cavitalyseSkin);
      }
      if (clientData.cavitalyseLifestyle) {
        addTreatmentSection(doc, 'Mode de vie Cavita-Lyse', clientData.cavitalyseLifestyle);
      }
      break;

    // Add other treatments...
  }

  // Weight Tracking Page
  if (measurements.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Suivi du poids', pageWidth / 2, 20, { align: 'center' });

    // Weight table
    const measurementData = measurements
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((m, index, arr) => [
        formatDate(m.date),
        m.weight.toString(),
        index === 0 ? '-' : 
          (m.weight - arr[index - 1].weight).toFixed(1)
      ]);

    doc.autoTable({
      startY: 30,
      head: [['Date', 'Poids (kg)', 'Variation']],
      body: measurementData,
      theme: 'striped',
      headStyles: { fillColor: [236, 72, 153] }
    });

    // Weight evolution graph
    const chartData = measurements
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(m => ({
        x: format(new Date(m.date), 'dd/MM'),
        y: m.weight
      }));

    drawLineChart(
      doc,
      chartData,
      doc.autoTable.previous.finalY + 20,
      'Évolution du poids',
      'Poids (kg)'
    );
  }

  // Sessions Page
  if (sessions.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Suivi des séances', pageWidth / 2, 20, { align: 'center' });

    // Sort sessions by date
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Sessions table
    const sessionData = sortedSessions.map(s => [
      formatDate(s.date),
      s.type,
      s.comment || '-'
    ]);

    doc.autoTable({
      startY: 30,
      head: [['Date', 'Type', 'Commentaire']],
      body: sessionData,
      theme: 'striped',
      headStyles: { fillColor: [236, 72, 153] }
    });

    // Add measurements if available
    if (sessions[0].measurements) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Mesures des séances', pageWidth / 2, 20, { align: 'center' });

      const measurementKeys = Object.keys(sessions[0].measurements);
      const measurementData = sortedSessions.map(s => {
        const row = [formatDate(s.date)];
        measurementKeys.forEach(key => {
          row.push(s.measurements?.[key]?.toString() || '-');
        });
        return row;
      });

      doc.autoTable({
        startY: 30,
        head: [['Date', ...measurementKeys]],
        body: measurementData,
        theme: 'striped',
        headStyles: { fillColor: [236, 72, 153] }
      });
    }
  }

  // Save the PDF
  const fileName = `fiche_${clientData.client.lastName || 'client'}_${clientData.client.firstName || ''}.pdf`;
  doc.save(fileName);
};