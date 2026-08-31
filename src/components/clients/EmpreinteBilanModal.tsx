import React, { useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import rawHtml from './formulaire-cure-empreinte-complet.html?raw';
import {
  saveEmpreinteBilan,
  type EmpreintePayload,
} from '../../services/database/operations/empreinte';
import { saveCureData, updateClientContactInfo } from '../../services/database';
import type { ClientCureData } from '../../types/client';

const PRIX_SEANCE = 59;
const PRIX_GUIDE = 29;
const PRIX_TENUE = 60;
const DEFAULT_INSTALLMENTS = 4;

interface EmpreinteCurePayload extends ClientCureData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  age?: number;
  empreinte?: EmpreintePayload;
}

interface EmpreinteBilanModalProps {
  clientId?: string;
  centerId?: string;
  clientName?: string;
  onClose: () => void;
  onSaved?: () => void;
  onCureData?: (payload: EmpreinteCurePayload) => void;
}

function buildHtmlWithHooks(prefillName: string): string {
  const safeName = JSON.stringify(prefillName || '');

  let html = rawHtml.replace(
    'let LAST={};',
    `let LAST={};
const __PREFILL_NAME__ = ${safeName};
if(__PREFILL_NAME__){
  prenom = __PREFILL_NAME__;
  contact.prenom = __PREFILL_NAME__;
  requestAnimationFrame(()=>{
    const __pinp = document.getElementById('prenom');
    if(__pinp && !__pinp.value) __pinp.value = __PREFILL_NAME__;
  });
}
`,
  );

  html = html.replace(
    'function validateCure(){\n  const who=',
    `function validateCure(){
  try {
    window.parent.postMessage({
      type: 'SAVE_EMPREINTE_BILAN',
      payload: {
        prenom: prenom,
        answers: Object.assign({}, ans),
        slider: slider,
        text: txt,
        contact: Object.assign({}, contact),
        cure: Object.assign({}, cure),
        last: LAST,
        total: totalPrix(),
        inbody: inbodyItems()
      }
    }, '*');
  } catch(e) { console.error('postMessage save failed', e); }
  const who=`,
  );

  return html;
}

function deriveCureData(payload: EmpreintePayload): ClientCureData {
  const seances = payload.cure?.seances || 0;
  const electro = !!payload.cure?.electro;
  const total =
    payload.total ||
    PRIX_SEANCE * seances + PRIX_GUIDE + (electro ? PRIX_TENUE : 0);

  const treatments: ClientCureData['treatments'] = [
    {
      name: 'Luxothérapie',
      sessions: seances,
      pricePerSession: PRIX_SEANCE,
      careServiceId: 'luxo-pdp',
    },
    {
      name: 'Guide alimentaire',
      sessions: 1,
      pricePerSession: PRIX_GUIDE,
      careServiceId: 'guide',
    },
  ];
  if (electro) {
    treatments.push({
      name: 'Tenue I-Shape',
      sessions: 1,
      pricePerSession: PRIX_TENUE,
      careServiceId: 'tenue',
    });
  }

  const amount = Math.round((total / DEFAULT_INSTALLMENTS) * 100) / 100;
  const installments = Array.from(
    { length: DEFAULT_INSTALLMENTS },
    (_, i) => ({ index: i + 1, amount }),
  );

  const careServiceIds = Array.from(
    new Set(treatments.map((t) => t.careServiceId).filter(Boolean) as string[]),
  );

  return {
    totalPrice: total,
    installmentCount: DEFAULT_INSTALLMENTS,
    installments,
    savedAt: new Date().toISOString(),
    treatments,
    careServiceIds,
  };
}

const EmpreinteBilanModal: React.FC<EmpreinteBilanModalProps> = ({
  clientId,
  centerId,
  clientName,
  onClose,
  onSaved,
  onCureData,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const savingRef = useRef(false);

  const prefillName = useMemo(() => {
    if (!clientName) return '';
    return clientName.trim().split(' ')[0] || '';
  }, [clientName]);

  const blobUrl = useMemo(() => {
    const html = buildHtmlWithHooks(prefillName);
    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [prefillName]);

  useEffect(() => {
    return () => URL.revokeObjectURL(blobUrl);
  }, [blobUrl]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (e.data?.type !== 'SAVE_EMPREINTE_BILAN') return;
      if (savingRef.current) return;
      savingRef.current = true;

      const payload = e.data.payload as EmpreintePayload;

      try {
        await saveEmpreinteBilan(payload, {
          clientId: clientId ?? null,
          centerId: centerId ?? null,
        });
      } catch (err) {
        console.error(err);
        toast.error("Le bilan n'a pas pu être enregistré");
        savingRef.current = false;
        return;
      }

      const cureData = deriveCureData(payload);
      const contact = payload.contact || ({} as EmpreintePayload['contact']);
      const ageNumber = contact.age ? parseInt(contact.age, 10) : NaN;
      const contactPatch = {
        firstName: contact.prenom || payload.prenom || '',
        lastName: contact.nom || '',
        email: contact.email || '',
        phone: contact.tel || '',
        address: contact.adresse || '',
        postalCode: contact.cp || '',
        city: contact.ville || '',
        age: Number.isFinite(ageNumber) ? ageNumber : undefined,
      };

      if (!clientId) {
        onCureData?.({
          ...cureData,
          ...contactPatch,
          empreinte: payload,
        });
        toast.success('Bilan enregistré. Il sera relié au client à sa création.');
        savingRef.current = false;
        onClose();
        return;
      }

      try {
        await updateClientContactInfo(clientId, contactPatch);
      } catch (err) {
        console.error('Contact info update failed', err);
      }

      try {
        await saveCureData(clientId, cureData);
        toast.success('Bilan et cure enregistrés sur la fiche client');
        onSaved?.();
      } catch (err) {
        console.error(err);
        toast.success('Bilan enregistré');
        toast.error('La synchronisation de la cure a échoué');
      } finally {
        savingRef.current = false;
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [clientId, centerId, onCureData, onClose, onSaved]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-6xl h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Bilan Empreinte &amp; Cure</span>
            {clientName && <span className="text-xs text-gray-400">— {clientName}</span>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Fermer (Échap)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <iframe
          ref={iframeRef}
          src={blobUrl}
          className="flex-1 w-full border-0"
          title="Bilan Empreinte MAbeautyplus"
        />
      </div>
    </div>
  );
};

export default EmpreinteBilanModal;
