import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Trash2, FileCheck, ChevronDown, Maximize2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ContractPreview from './ContractPreview';
import { getConsentEntries } from './ConsentPreview';
import type { ContractData } from '../../services/contractService';
import { saveSignedContract } from '../../services/contractService';
import { generateSignedContractPdf } from '../../services/contractPdfService';
import { uploadContractToAirtable, uploadConsentsToAirtable } from '../../services/airtable';

interface ContractSignatureModalProps {
  contractData: ContractData;
  clientId: string;
  centerId: string;
  clientName: string;
  onClose: () => void;
  onSigned: () => void;
}

const ENGAGEMENT_ITEMS = [
  'J\'ai pris connaissance du présent contrat et des modalités financières du forfait souscrit.',
  'J\'ai reçu toutes les informations nécessaires avant la signature et ai pu poser l\'ensemble de mes questions.',
  'J\'ai été informé(e) de mon droit légal de rétractation de 14 jours conformément aux articles L221-18 et suivants du Code de la consommation.',
  'J\'ai pris connaissance et accepté les Conditions Générales de Vente remises préalablement à la signature du présent contrat.',
];

const ContractSignatureModal: React.FC<ContractSignatureModalProps> = ({
  contractData,
  clientId,
  centerId,
  clientName,
  onClose,
  onSigned,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [engagements, setEngagements] = useState<boolean[]>(ENGAGEMENT_ITEMS.map(() => false));
  const [isSaving, setIsSaving] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [showSignatureFullscreen, setShowSignatureFullscreen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  // Per-consent photo rights state: map of consent key → [bool, bool]
  const [consentPhotoChecked, setConsentPhotoChecked] = useState<Record<string, boolean[]>>({});
  const [consentAccepted, setConsentAccepted] = useState<Record<string, boolean>>({});

  const handlePhotoToggle = (consentKey: string, index: number) => {
    setConsentPhotoChecked((prev) => {
      const current = prev[consentKey] ?? [false, false];
      const updated = current.map((v, i) => (i === index ? !v : v));
      return { ...prev, [consentKey]: updated };
    });
  };

  const handleConsentAccept = (consentKey: string) => {
    setConsentAccepted((prev) => ({ ...prev, [consentKey]: !prev[consentKey] }));
  };

  const flatPhotoChecked = Object.values(consentPhotoChecked).flat();

  const allChecked = engagements.every(Boolean);
  const consentEntries = getConsentEntries(contractData.activeServiceIds);
  const allConsentsAccepted = consentEntries.length === 0 || consentEntries.every(({ key }) => consentAccepted[key]);
  const canValidate = allChecked && hasSignature && allConsentsAccepted;

  // Canvas drawing helpers
  const getPos = useCallback((e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e instanceof TouchEvent) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDraw = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current = getPos(e, canvas);
  }, [getPos]);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e, canvas);
    const last = lastPosRef.current;
    if (!last) return;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPosRef.current = pos;
    setHasSignature(true);
  }, [getPos]);

  const endDraw = useCallback(() => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }, []);

  // Sync fullscreen canvas from main canvas when opening
  const openSignatureFullscreen = () => {
    setShowSignatureFullscreen(true);
  };

  useEffect(() => {
    if (!showSignatureFullscreen) return;
    const src = canvasRef.current;
    const dst = fullscreenCanvasRef.current;
    if (!src || !dst) return;
    const ctx = dst.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, dst.width, dst.height);
    // Scale signature from small canvas into fullscreen canvas
    if (hasSignature) {
      ctx.drawImage(src, 0, 0, dst.width, dst.height);
    }
  }, [showSignatureFullscreen, hasSignature]);

  // Fullscreen canvas drawing — mirrors back to main canvas on confirm
  const fullscreenGetPos = useCallback((e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e instanceof TouchEvent) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

  const fullscreenStartDraw = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = fullscreenCanvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current = fullscreenGetPos(e, canvas);
  }, [fullscreenGetPos]);

  const fullscreenDraw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = fullscreenCanvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = fullscreenGetPos(e, canvas);
    const last = lastPosRef.current;
    if (!last) return;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPosRef.current = pos;
    setHasSignature(true);
  }, [fullscreenGetPos]);

  useEffect(() => {
    if (!showSignatureFullscreen) return;
    const canvas = fullscreenCanvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('mousedown', fullscreenStartDraw);
    canvas.addEventListener('mousemove', fullscreenDraw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseleave', endDraw);
    canvas.addEventListener('touchstart', fullscreenStartDraw, { passive: false });
    canvas.addEventListener('touchmove', fullscreenDraw, { passive: false });
    canvas.addEventListener('touchend', endDraw);
    return () => {
      canvas.removeEventListener('mousedown', fullscreenStartDraw);
      canvas.removeEventListener('mousemove', fullscreenDraw);
      canvas.removeEventListener('mouseup', endDraw);
      canvas.removeEventListener('mouseleave', endDraw);
      canvas.removeEventListener('touchstart', fullscreenStartDraw);
      canvas.removeEventListener('touchmove', fullscreenDraw);
      canvas.removeEventListener('touchend', endDraw);
    };
  }, [showSignatureFullscreen, fullscreenStartDraw, fullscreenDraw, endDraw]);

  const handleClearFullscreen = () => {
    const canvas = fullscreenCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleConfirmFullscreen = () => {
    // Copy fullscreen canvas back to main canvas
    const src = fullscreenCanvasRef.current;
    const dst = canvasRef.current;
    if (src && dst) {
      const ctx = dst.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, dst.width, dst.height);
        ctx.drawImage(src, 0, 0, dst.width, dst.height);
      }
    }
    setShowSignatureFullscreen(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseleave', endDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', endDraw);
    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', endDraw);
      canvas.removeEventListener('mouseleave', endDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', endDraw);
    };
  }, [startDraw, draw, endDraw]);

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleToggleEngagement = (index: number) => {
    setEngagements((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const sendContractEmail = async (pdfBase64: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-contract-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientEmail: contractData.clientEmail,
          clientFirstName: contractData.clientFirstName,
          clientLastName: contractData.clientLastName,
          centerName: contractData.centerName,
          centerEmail: contractData.centerEmail,
          pdfBase64,
          signatureDate: contractData.signatureDate,
        }),
      });
    } catch {
      // email failure is non-blocking
    }
  };

  const handleValidate = async () => {
    if (!canValidate) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSaving(true);
    try {
      const signatureDataUrl = canvas.toDataURL('image/png');
      const pdfBase64 = await generateSignedContractPdf(contractData, signatureDataUrl, engagements);
      await saveSignedContract(clientId, centerId, clientName, pdfBase64, contractData);
      if (contractData.clientEmail) {
        await sendContractEmail(pdfBase64);
      }
      // Upload contract PDF and consent PDFs to Airtable (non-blocking)
      uploadContractToAirtable(
        contractData.clientFirstName,
        contractData.clientLastName,
        centerId,
        clientId,
        pdfBase64
      ).catch(() => {});
      uploadConsentsToAirtable(
        contractData.clientFirstName,
        contractData.clientLastName,
        centerId,
        clientId,
        contractData.activeServiceIds,
        signatureDataUrl,
        contractData.signatureDate,
        flatPhotoChecked,
      ).catch(() => {});
      toast.success('Contrat signé et enregistré avec succès');
      onSigned();
    } catch (err) {
      console.error('Error saving contract:', err);
      toast.error('Erreur lors de la sauvegarde du contrat');
    } finally {
      setIsSaving(false);
    }
  };

  const handleScroll = () => {
    setShowScrollHint(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Contrat de Prestation de Services</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {clientName} — {contractData.centerName}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Contract preview */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ContractPreview
            data={contractData}
            id="contract-preview-content"
            engagements={engagements}
            onEngagementToggle={(i) => setEngagements((prev) => prev.map((v, idx) => idx === i ? !v : v))}
          />
        </div>

        {/* Consent previews */}
        {(() => {
          const entries = getConsentEntries(contractData.activeServiceIds);
          if (entries.length === 0) return null;
          const today = format(new Date(), 'dd/MM/yyyy', { locale: fr });
          const clientName = `${contractData.clientFirstName} ${contractData.clientLastName}`;
          return (
            <div className="max-w-4xl mx-auto px-4 pb-2">
              <div className="border-t-2 border-dashed border-gray-300 my-4" />
              <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-6">
                Consentements mutuels
              </p>
              {entries.map(({ key, title, Component, hasPhotoAuth }, idx) => (
                <div key={key}>
                  {idx > 0 && <div className="border-t border-gray-200 my-6" />}
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2 pl-1">
                    Consentement — {title}
                  </div>
                  <Component
                    clientName={clientName}
                    date={today}
                    photoChecked={hasPhotoAuth ? (consentPhotoChecked[key] ?? [false, false]) : []}
                    onPhotoToggle={(i) => handlePhotoToggle(key, i)}
                    accepted={consentAccepted[key] ?? false}
                    onAccept={() => handleConsentAccept(key)}
                  />
                </div>
              ))}
              <div className="border-t-2 border-dashed border-gray-300 my-6" />
            </div>
          );
        })()}

        {/* Engagement + Signature section */}
        <div className="max-w-4xl mx-auto px-4 pb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
            {/* Engagement checkboxes */}
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-1">
                Engagements du client
              </h3>
              <p className="text-xs text-gray-500 mb-4">Valable pour le contrat de prestation et l'ensemble des consentements ci-dessus. Chaque consentement doit également être accepté individuellement.</p>
              <div className="space-y-3">
                {ENGAGEMENT_ITEMS.map((text, i) => (
                  <label
                    key={i}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <div
                      onClick={() => handleToggleEngagement(i)}
                      className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        engagements[i]
                          ? 'bg-brand-blue border-brand-blue'
                          : 'border-gray-300 group-hover:border-brand-blue'
                      }`}
                    >
                      {engagements[i] && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span
                      className="text-sm text-gray-700 leading-relaxed"
                      onClick={() => handleToggleEngagement(i)}
                    >
                      {text}
                    </span>
                  </label>
                ))}
              </div>
              {!allChecked && (
                <p className="mt-3 text-xs text-amber-600 font-medium">
                  Veuillez cocher toutes les cases avant de signer.
                </p>
              )}
            </div>

            {/* Signature pad */}
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                  Signature du Client — "Lu et approuvé"
                </h3>
                <div className="flex items-center gap-2">
                  {hasSignature && (
                    <button
                      onClick={handleClearSignature}
                      className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Effacer
                    </button>
                  )}
                  <button
                    onClick={openSignatureFullscreen}
                    className="flex items-center gap-1.5 text-sm text-brand-blue hover:text-blue-700 transition-colors font-medium"
                    title="Ouvrir la zone de signature en plein écran"
                  >
                    <Maximize2 className="h-4 w-4" />
                    Plein écran
                  </button>
                </div>
              </div>
              <div
                className={`relative rounded-xl border-2 transition-colors cursor-pointer ${
                  hasSignature ? 'border-brand-blue' : 'border-dashed border-gray-300 hover:border-brand-blue'
                } bg-white`}
                style={{ touchAction: 'none' }}
                onClick={openSignatureFullscreen}
                title="Cliquer pour ouvrir la signature en plein écran"
              >
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={200}
                  className="w-full rounded-xl pointer-events-none"
                  style={{ display: 'block', height: '160px' }}
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2">
                    <Maximize2 className="h-5 w-5 text-gray-300" />
                    <p className="text-gray-400 text-sm select-none">
                      Cliquez pour signer
                    </p>
                  </div>
                )}
                {hasSignature && (
                  <div className="absolute top-2 right-2 pointer-events-none">
                    <Maximize2 className="h-4 w-4 text-gray-300" />
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Cliquez sur la zone pour ouvrir la signature en plein écran (optimisé tablette graphique).
              </p>
            </div>

            {/* Validate button */}
            <div className="px-6 pb-6">
              <button
                onClick={handleValidate}
                disabled={!canValidate || isSaving}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold transition-all duration-200 ${
                  canValidate && !isSaving
                    ? 'bg-brand-blue text-white shadow-md hover:shadow-lg hover:opacity-90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FileCheck className="h-5 w-5" />
                {isSaving ? 'Enregistrement...' : 'Valider et signer le contrat et les consentements'}
              </button>
              {!canValidate && !isSaving && (
                <p className="text-center text-xs text-gray-400 mt-2">
                  {!allChecked && !hasSignature && !allConsentsAccepted
                    ? 'Cochez toutes les cases et apposez votre signature'
                    : !allConsentsAccepted
                    ? 'Acceptez l\'ensemble des consentements de soins'
                    : !allChecked
                    ? 'Cochez toutes les cases d\'engagement'
                    : 'Apposez votre signature'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      {showScrollHint && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none animate-bounce">
          <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
            Faites défiler pour lire le contrat
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      )}

      {/* Fullscreen signature overlay */}
      {showSignatureFullscreen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Signature du client</h2>
              <p className="text-sm text-gray-500 mt-0.5">Signez dans la zone ci-dessous — "Lu et approuvé"</p>
            </div>
            <button
              onClick={() => setShowSignatureFullscreen(false)}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Canvas + actions — fixed layout so buttons are always visible */}
          <div className="flex flex-col p-5 gap-4 overflow-hidden" style={{ height: 'calc(100vh - 73px)' }}>
            <div
              className={`relative rounded-2xl border-2 transition-colors ${
                hasSignature ? 'border-brand-blue' : 'border-dashed border-gray-300'
              } bg-white shadow-inner`}
              style={{ touchAction: 'none', flex: '1 1 0', minHeight: 0 }}
            >
              <canvas
                ref={fullscreenCanvasRef}
                width={1600}
                height={900}
                className="w-full h-full rounded-2xl"
                style={{ display: 'block', cursor: 'crosshair' }}
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-base select-none">Signez ici avec votre stylet ou la souris</p>
                </div>
              )}
            </div>

            {/* Actions — always visible at bottom */}
            <div className="flex items-center justify-between flex-shrink-0">
              <button
                onClick={handleClearFullscreen}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors font-medium"
              >
                <Trash2 className="h-5 w-5" />
                Effacer
              </button>
              <button
                onClick={handleConfirmFullscreen}
                disabled={!hasSignature}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-base font-bold transition-all ${
                  hasSignature
                    ? 'bg-brand-blue text-white shadow-md hover:opacity-90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Check className="h-5 w-5" />
                Confirmer la signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractSignatureModal;