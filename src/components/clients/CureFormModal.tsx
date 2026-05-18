import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { saveCureData } from '../../services/database';
import type { ClientCureData } from '../../types/client';

interface CureFormModalProps {
  clientId?: string;
  clientName?: string;
  onClose: () => void;
  onSaved?: () => void;
}

const CureFormModal: React.FC<CureFormModalProps> = ({ clientId, clientName, onClose, onSaved }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (e.data?.type !== 'SAVE_CURE_DATA') return;
      if (!clientId) {
        toast.error('Aucun client sélectionné');
        return;
      }
      try {
        const cureData: ClientCureData = e.data.payload;
        await saveCureData(clientId, cureData);
        toast.success('Cure enregistrée sur la fiche client');
        onSaved?.();
        onClose();
      } catch {
        toast.error("Erreur lors de l'enregistrement");
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [clientId, onClose, onSaved]);

  const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Aide à la vente — MaBeautyPlus</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #F3F3FF;
    --bg-soft: #E8E8FA;
    --bg-card: #FFFFFF;
    --ink: #00002E;
    --ink-soft: #4A4A6E;
    --line: #D8D8EC;
    --line-strong: #B8B8D4;
    --primary: #32ACDE;
    --primary-soft: #C8E8F5;
    --secondary: #DA33BF;
    --secondary-soft: #F5C8EE;
    --tertiary: #FC84E9;
    --tertiary-soft: #FDDDF7;
    --gold: #32ACDE;
    --gold-soft: #C8E8F5;
    --luxo: #DA33BF;
    --luxo-soft: #F5C8EE;
    --ishape: #32ACDE;
    --ishape-soft: #C8E8F5;
    --presso: #5B7FE8;
    --presso-soft: #D4DEF8;
    --relax: #FC84E9;
    --relax-soft: #FDDDF7;
    --proposed: #B8B8D4;
    --recommended: #32ACDE;
    --mandatory: #DA33BF;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: var(--bg);
    color: var(--ink);
    font-family: 'Manrope', sans-serif;
    font-weight: 400;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }
  body {
    background:
      radial-gradient(circle at 10% 0%, rgba(50, 172, 222, 0.10) 0%, transparent 45%),
      radial-gradient(circle at 90% 100%, rgba(218, 51, 191, 0.08) 0%, transparent 45%),
      radial-gradient(circle at 50% 50%, rgba(252, 132, 233, 0.05) 0%, transparent 60%),
      var(--bg);
  }
  .container { max-width: 1400px; margin: 0 auto; padding: 32px 24px 80px; }
  .header { text-align: center; padding: 24px 0 40px; position: relative; }
  .brand-mark { font-family: 'Cormorant Garamond', serif; font-size: 13px; letter-spacing: 0.35em; color: var(--gold); text-transform: uppercase; margin-bottom: 12px; font-weight: 500; }
  .header h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(34px, 5vw, 52px); font-weight: 500; letter-spacing: -0.01em; line-height: 1.05; color: var(--ink); }
  .header h1 em { font-style: italic; color: var(--gold); }
  .header .subtitle { margin-top: 16px; font-size: 14px; color: var(--ink-soft); letter-spacing: 0.02em; max-width: 540px; margin-left: auto; margin-right: auto; }
  .divider { width: 60px; height: 1px; background: var(--gold); margin: 24px auto 0; }
  .client-bar { background: var(--bg-card); border: 1px solid var(--line); border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; display: grid; grid-template-columns: 1fr 1fr auto; gap: 20px; align-items: end; }
  .client-field label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--ink-soft); margin-bottom: 8px; font-weight: 500; }
  .client-field input { width: 100%; border: none; border-bottom: 1px solid var(--line); padding: 6px 0; font-family: 'Manrope', sans-serif; font-size: 16px; background: transparent; color: var(--ink); transition: border-color 0.2s; }
  .client-field input:focus { outline: none; border-bottom-color: var(--gold); }
  .reset-btn { background: transparent; border: 1px solid var(--line); color: var(--ink-soft); padding: 10px 18px; border-radius: 8px; font-family: 'Manrope', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.2s; letter-spacing: 0.02em; }
  .reset-btn:hover { border-color: var(--gold); color: var(--gold); }
  .form-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 36px; }
  @media (max-width: 1024px) { .form-grid { grid-template-columns: repeat(2, 1fr); } .client-bar { grid-template-columns: 1fr; } }
  @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
  .presta-card { background: var(--bg-card); border: 1px solid var(--line); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; transition: all 0.3s ease; position: relative; }
  .presta-card.has-score { box-shadow: 0 8px 24px -8px rgba(0,0,0,0.08); transform: translateY(-2px); }
  .presta-header { padding: 18px 20px 14px; border-bottom: 1px solid var(--line); position: relative; }
  .presta-card[data-key="luxo"] .presta-header { background: var(--luxo-soft); }
  .presta-card[data-key="ishape"] .presta-header { background: var(--ishape-soft); }
  .presta-card[data-key="presso"] .presta-header { background: var(--presso-soft); }
  .presta-card[data-key="relax"] .presta-header { background: var(--relax-soft); }
  .presta-name { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; letter-spacing: 0.01em; color: var(--ink); line-height: 1.1; }
  .presta-tag { font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 4px; font-weight: 600; }
  .presta-card[data-key="luxo"] .presta-tag { color: var(--luxo); }
  .presta-card[data-key="ishape"] .presta-tag { color: var(--ishape); }
  .presta-card[data-key="presso"] .presta-tag { color: var(--presso); }
  .presta-card[data-key="relax"] .presta-tag { color: var(--relax); }
  .score-badge { position: absolute; top: 16px; right: 16px; width: 36px; height: 36px; border-radius: 50%; background: var(--bg-card); border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: var(--ink-soft); transition: all 0.3s; }
  .score-badge.active { color: var(--primary); border-color: var(--primary); background: var(--primary-soft); }
  .score-badge.recommended { background: var(--primary); color: white; border-color: var(--primary); }
  .score-badge.mandatory { background: var(--secondary); color: white; border-color: var(--secondary); box-shadow: 0 0 0 4px rgba(218, 51, 191, 0.20); }
  .presta-body { padding: 14px 20px 20px; flex: 1; }
  .check-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; cursor: pointer; border-radius: 6px; transition: background 0.15s; user-select: none; }
  .check-item:hover { background: var(--bg-soft); padding-left: 8px; padding-right: 8px; margin-left: -8px; margin-right: -8px; }
  .check-item input[type="checkbox"], .check-item input[type="radio"] { appearance: none; -webkit-appearance: none; width: 18px; height: 18px; border: 1.5px solid var(--line); cursor: pointer; position: relative; flex-shrink: 0; margin-top: 2px; background: white; transition: all 0.2s; }
  .check-item input[type="checkbox"] { border-radius: 4px; }
  .check-item input[type="radio"] { border-radius: 50%; }
  .check-item input[type="checkbox"]:checked { background: var(--gold); border-color: var(--gold); }
  .check-item input[type="checkbox"]:checked::after { content: ''; position: absolute; left: 4px; top: 1px; width: 5px; height: 9px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
  .check-item input[type="radio"]:checked { border-color: var(--gold); background: white; }
  .check-item input[type="radio"]:checked::after { content: ''; position: absolute; top: 3px; left: 3px; width: 9px; height: 9px; border-radius: 50%; background: var(--gold); }
  .check-item label { font-size: 14px; color: var(--ink); cursor: pointer; line-height: 1.4; flex: 1; }
  .check-group { margin-top: 4px; padding: 10px 12px; background: var(--bg-soft); border-radius: 8px; border-left: 2px solid var(--gold-soft); }
  .check-group-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--ink-soft); margin-bottom: 6px; font-weight: 600; }
  .legend { background: var(--bg-card); border: 1px solid var(--line); border-radius: 12px; padding: 16px 24px; margin-bottom: 32px; display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; align-items: center; font-size: 13px; color: var(--ink-soft); }
  .legend-item { display: flex; align-items: center; gap: 8px; }
  .legend-dot { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 700; }
  .legend-dot.l1 { background: var(--proposed); color: white; }
  .legend-dot.l2 { background: var(--primary); }
  .legend-dot.l3 { background: var(--secondary); }
  .results { margin-top: 40px; opacity: 0; transform: translateY(20px); transition: opacity 0.5s, transform 0.5s; pointer-events: none; }
  .results.visible { opacity: 1; transform: translateY(0); pointer-events: auto; }
  .results-header { text-align: center; margin-bottom: 36px; padding-top: 32px; border-top: 1px solid var(--line); }
  .results-eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em; color: var(--gold); margin-bottom: 12px; font-weight: 600; }
  .results-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(28px, 4vw, 42px); font-weight: 500; color: var(--ink); line-height: 1.1; }
  .results-title em { font-style: italic; color: var(--gold); }
  .results-sub { margin-top: 12px; font-size: 14px; color: var(--ink-soft); }
  .cure-grid { display: grid; gap: 18px; margin-bottom: 28px; }
  .cure-grid.cols-1 { grid-template-columns: minmax(0, 500px); justify-content: center; }
  .cure-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
  .cure-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
  .cure-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
  @media (max-width: 900px) { .cure-grid.cols-3, .cure-grid.cols-4 { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px) { .cure-grid { grid-template-columns: 1fr !important; } }
  .cure-card { background: var(--bg-card); border: 1px solid var(--line); border-radius: 18px; padding: 28px 24px; position: relative; overflow: hidden; display: flex; flex-direction: column; }
  .cure-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; }
  .cure-card[data-key="luxo"]::before { background: var(--luxo); }
  .cure-card[data-key="ishape"]::before { background: var(--ishape); }
  .cure-card[data-key="presso"]::before { background: var(--presso); }
  .cure-card[data-key="relax"]::before { background: var(--relax); }
  .cure-status { position: absolute; top: 16px; right: 16px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; padding: 4px 10px; border-radius: 100px; font-weight: 600; }
  .cure-status.proposed { background: rgba(184, 184, 212, 0.25); color: var(--ink-soft); }
  .cure-status.recommended { background: rgba(50, 172, 222, 0.18); color: var(--primary); }
  .cure-status.mandatory { background: rgba(218, 51, 191, 0.18); color: var(--secondary); }
  .cure-tag { font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; font-weight: 600; margin-bottom: 8px; }
  .cure-card[data-key="luxo"] .cure-tag { color: var(--luxo); }
  .cure-card[data-key="ishape"] .cure-tag { color: var(--ishape); }
  .cure-card[data-key="presso"] .cure-tag { color: var(--presso); }
  .cure-card[data-key="relax"] .cure-tag { color: var(--relax); }
  .cure-name { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 600; line-height: 1.1; color: var(--ink); margin-bottom: 18px; }
  .cure-sessions { display: flex; align-items: baseline; gap: 8px; padding: 16px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); margin-bottom: 18px; }
  .cure-sessions-num { font-family: 'Cormorant Garamond', serif; font-size: 44px; font-weight: 600; line-height: 1; }
  .cure-card[data-key="luxo"] .cure-sessions-num { color: var(--luxo); }
  .cure-card[data-key="ishape"] .cure-sessions-num { color: var(--ishape); }
  .cure-card[data-key="presso"] .cure-sessions-num { color: var(--presso); }
  .cure-card[data-key="relax"] .cure-sessions-num { color: var(--relax); }
  .cure-sessions-label { font-size: 13px; color: var(--ink-soft); letter-spacing: 0.02em; }
  .cure-benefits { list-style: none; flex: 1; }
  .cure-benefits li { font-size: 13.5px; color: var(--ink); padding: 6px 0 6px 18px; position: relative; line-height: 1.4; }
  .cure-benefits li::before { content: ''; position: absolute; left: 0; top: 14px; width: 8px; height: 1px; background: var(--gold); }
  .pricing { background: var(--bg-card); border: 1px solid var(--line); border-radius: 18px; padding: 32px; text-align: center; position: relative; overflow: hidden; }
  .pricing-locked { display: flex; flex-direction: column; align-items: center; gap: 16px; }
  .pricing-locked-text { font-size: 14px; color: var(--ink-soft); max-width: 380px; }
  .reveal-btn { background: var(--primary); color: white; border: none; padding: 14px 32px; border-radius: 100px; font-family: 'Manrope', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; box-shadow: 0 6px 18px -6px rgba(50, 172, 222, 0.5); }
  .reveal-btn:hover { background: #1F8FBC; transform: translateY(-1px); }
  .pricing-revealed { display: none; }
  .pricing-revealed.show { display: block; }
  .pricing-locked.hide { display: none; }
  .price-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--line); }
  .price-row:last-child { border-bottom: none; }
  .price-row-label { text-align: left; display: flex; flex-direction: column; gap: 2px; }
  .price-row-name { font-family: 'Cormorant Garamond', serif; font-size: 19px; font-weight: 600; }
  .price-row-detail { font-size: 12px; color: var(--ink-soft); }
  .price-row-amount { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; color: var(--ink); }
  .price-input { width: 90px; border: 1px solid var(--line-strong); border-radius: 6px; padding: 6px 10px; text-align: right; font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 600; color: var(--ink); background: var(--bg); }
  .price-input:focus { outline: none; border-color: var(--luxo); }
  .sessions-input { width: 72px; border: 1px solid var(--line-strong); border-radius: 6px; padding: 6px 10px; text-align: right; font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 600; color: var(--ink); background: var(--bg); }
  .sessions-input:focus { outline: none; border-color: var(--luxo); }
  .addon-section-label { margin: 18px 0 4px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; color: var(--ink-soft); font-weight: 600; text-align: left; padding-top: 14px; border-top: 1px dashed var(--line); }
  .addon-row .addon-name { font-size: 18px; font-style: italic; }
  .price-total { margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--ink); display: flex; justify-content: space-between; align-items: baseline; }
  .price-total-label { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; }
  .price-total-amount { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 700; color: var(--secondary); }
  .empty-state { text-align: center; padding: 60px 20px; color: var(--ink-soft); }
  .empty-state-icon { font-family: 'Cormorant Garamond', serif; font-size: 48px; color: var(--gold-soft); margin-bottom: 12px; font-style: italic; }
  .empty-state-text { font-size: 14px; max-width: 380px; margin: 0 auto; }
  /* ── ÉCHEANCIER ── */
  .echeancier { margin-top: 24px; background: var(--bg-card); border: 1px solid var(--line); border-radius: 18px; padding: 32px; display: none; }
  .echeancier.show { display: block; }
  .ech-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 500; text-align: center; margin-bottom: 8px; color: var(--ink); }
  .ech-subtitle { font-size: 13px; color: var(--ink-soft); text-align: center; margin-bottom: 28px; }
  .ech-selector { display: flex; gap: 8px; justify-content: center; margin-bottom: 28px; flex-wrap: wrap; }
  .ech-btn { width: 52px; height: 52px; border-radius: 12px; border: 2px solid var(--line); background: var(--bg); font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 600; color: var(--ink-soft); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
  .ech-btn:hover { border-color: var(--primary); color: var(--primary); }
  .ech-btn.active { border-color: var(--primary); background: var(--primary); color: white; box-shadow: 0 4px 14px -4px rgba(50,172,222,0.5); }
  .ech-total-banner { background: linear-gradient(135deg, var(--primary) 0%, #1a7fa8 100%); border-radius: 14px; padding: 20px 24px; text-align: center; margin-bottom: 24px; }
  .ech-total-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255,255,255,0.75); margin-bottom: 6px; }
  .ech-total-amount { font-family: 'Cormorant Garamond', serif; font-size: 42px; font-weight: 500; color: white; line-height: 1; }
  .ech-total-sub { font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 6px; }
  .ech-cards { display: grid; gap: 10px; }
  .ech-card { background: var(--bg-card); border: 2px solid var(--line); border-radius: 14px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s; }
  .ech-card.first { background: linear-gradient(135deg, #fff0fb, #fce7f3); border-color: #f9a8d4; }
  .ech-card:hover { transform: translateY(-1px); box-shadow: 0 6px 20px -6px rgba(0,0,0,0.1); }
  .ech-card-left { display: flex; flex-direction: column; gap: 4px; }
  .ech-card-ordinal { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  .ech-card.first .ech-card-ordinal { color: var(--secondary); }
  .ech-card:not(.first) .ech-card-ordinal { color: var(--ink-soft); }
  .ech-card-note { font-size: 11px; color: var(--ink-soft); }
  .ech-bar-wrap { width: 80px; height: 4px; background: var(--bg-soft); border-radius: 2px; margin-top: 4px; }
  .ech-bar { height: 100%; border-radius: 2px; transition: width 0.4s; }
  .ech-card.first .ech-bar { background: var(--secondary); }
  .ech-card:not(.first) .ech-bar { background: var(--primary); }
  .ech-card-amount { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 600; text-align: right; }
  .ech-card.first .ech-card-amount { color: var(--secondary); }
  .ech-card:not(.first) .ech-card-amount { color: var(--primary); }
  .ech-card-pct { font-size: 11px; color: var(--ink-soft); text-align: right; }
  .ech-verify { margin-top: 12px; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; }
  .ech-verify-label { font-size: 13px; color: #15803d; font-weight: 500; }
  .ech-verify-amount { font-size: 14px; font-weight: 700; color: #15803d; }
  /* ── BOUTON ENREGISTRER ── */
  .save-section { margin-top: 24px; display: none; }
  .save-section.show { display: block; }
  .save-btn { width: 100%; padding: 18px 24px; border-radius: 14px; border: none; background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); color: white; font-family: 'Manrope', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 0.06em; cursor: pointer; transition: all 0.2s; box-shadow: 0 6px 20px -6px rgba(13,148,136,0.5); display: flex; align-items: center; justify-content: center; gap: 10px; }
  .save-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px -6px rgba(13,148,136,0.55); }
  .save-btn:active { transform: translateY(0); }
  .save-btn svg { width: 20px; height: 20px; flex-shrink: 0; }
  .save-note { font-size: 12px; color: var(--ink-soft); text-align: center; margin-top: 10px; }
  @media print {
    .client-bar, .form-grid, .legend, .results-header, .reset-btn { display: none !important; }
    body { background: white; }
    .container { padding: 0; }
    .results { opacity: 1; transform: none; }
    .pricing-locked { display: none !important; }
    .pricing-revealed { display: block !important; }
    .echeancier { display: block !important; }
  }
  .print-btn { position: fixed; bottom: 24px; right: 24px; background: var(--primary); color: white; border: none; width: 52px; height: 52px; border-radius: 50%; cursor: pointer; box-shadow: 0 10px 30px -10px rgba(50, 172, 222, 0.6); transition: all 0.2s; display: none; align-items: center; justify-content: center; }
  .print-btn.visible { display: flex; }
  .print-btn:hover { background: #1F8FBC; transform: translateY(-2px); }
  .print-btn svg { width: 22px; height: 22px; }
</style>
</head>
<body>
<div class="container">
  <header class="header">
    <div class="brand-mark">MaBeauty<span style="color: var(--ink-soft);">+</span></div>
    <h1>Bilan & <em>Cure personnalisée</em></h1>
    <p class="subtitle">Aide à la vente — Cochez les besoins identifiés lors du bilan pour générer la cure adaptée à votre cliente.</p>
    <div class="divider"></div>
  </header>
  <div class="client-bar">
    <div class="client-field">
      <label>Cliente</label>
      <input type="text" id="clientName" placeholder="Prénom & Nom">
    </div>
    <div class="client-field">
      <label>Date du bilan</label>
      <input type="date" id="clientDate">
    </div>
    <button class="reset-btn" onclick="resetForm()">Réinitialiser</button>
  </div>
  <div class="legend">
    <div class="legend-item"><span class="legend-dot l1">2</span> Prestation proposée</div>
    <div class="legend-item"><span class="legend-dot l2">3</span> Fortement recommandée</div>
    <div class="legend-item"><span class="legend-dot l3">4+</span> Obligatoire</div>
  </div>
  <div class="form-grid" id="formGrid"></div>
  <div class="results" id="results">
    <div class="results-header">
      <div class="results-eyebrow">Votre cure sur-mesure</div>
      <h2 class="results-title" id="resultsTitle">Cure <em>recommandée</em></h2>
      <p class="results-sub" id="resultsSub"></p>
    </div>
    <div class="cure-grid" id="cureGrid"></div>
    <div class="pricing" id="pricing">
      <div class="pricing-locked" id="pricingLocked">
        <div style="font-family: 'Cormorant Garamond', serif; font-size: 28px; color: var(--ink);">Tarif sur-mesure</div>
        <p class="pricing-locked-text">Le tarif de la cure sera détaillé après présentation complète des bénéfices et du protocole.</p>
        <button class="reveal-btn" onclick="revealPricing()">Afficher le tarif</button>
      </div>
      <div class="pricing-revealed" id="pricingRevealed">
        <div style="font-family: 'Cormorant Garamond', serif; font-size: 24px; margin-bottom: 20px; text-align: center;">Récapitulatif tarifaire</div>
        <div id="priceRows"></div>
        <div class="price-total">
          <span class="price-total-label">Total cure</span>
          <span class="price-total-amount" id="priceTotal">— €</span>
        </div>
        <p style="font-size: 12px; color: var(--ink-soft); margin-top: 16px; text-align: center;">Tarif fixe 49 €/séance. Vous pouvez ajuster le nombre de séances par prestation.</p>
      </div>
    </div>
    <!-- ÉCHÉANCIER -->
    <div class="echeancier" id="echeancier">
      <div class="ech-title">Échéancier de paiement</div>
      <p class="ech-subtitle">Sélectionnez le nombre de fois pour répartir le règlement.</p>
      <div class="ech-selector">
        <button class="ech-btn" data-n="1" onclick="setNbEch(1)">1×</button>
        <button class="ech-btn" data-n="2" onclick="setNbEch(2)">2×</button>
        <button class="ech-btn active" data-n="3" onclick="setNbEch(3)">3×</button>
        <button class="ech-btn" data-n="4" onclick="setNbEch(4)">4×</button>
        <button class="ech-btn" data-n="5" onclick="setNbEch(5)">5×</button>
        <button class="ech-btn" data-n="6" onclick="setNbEch(6)">6×</button>
      </div>
      <div class="ech-total-banner">
        <div class="ech-total-label">Total cure</div>
        <div class="ech-total-amount" id="echTotal">— €</div>
        <div class="ech-total-sub" id="echTotalSub"></div>
      </div>
      <div class="ech-cards" id="echCards"></div>
      <div class="ech-verify" id="echVerify" style="display:none;">
        <span class="ech-verify-label">✓ Total vérifié</span>
        <span class="ech-verify-amount" id="echVerifyAmount"></span>
      </div>
    </div>
    <!-- BOUTON ENREGISTRER -->
    <div class="save-section" id="saveSection">
      <button class="save-btn" onclick="saveCure()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
        </svg>
        Enregistrer sur la fiche client
      </button>
      <p class="save-note">Les informations de cure et l'échéancier seront sauvegardés sur la fiche du client.</p>
    </div>
  </div>
  <div class="empty-state" id="emptyState">
    <div class="empty-state-icon">~</div>
    <p class="empty-state-text">Cochez au moins 2 cases sur une prestation pour découvrir la cure recommandée.</p>
  </div>
</div>
<button class="print-btn" id="printBtn" onclick="window.print()" title="Imprimer la cure">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
</button>
<script>
  const prestations = {
    luxo: {
      name: 'Luxoth\u00e9rapie Perte de Poids', tag: 'Luxo', shortName: 'Luxo perte de poids',
      benefits: ['\u2193 Fringales et grignotage \u00e9motionnel', '\u2193 Pulsions de sucre', 'R\u00e9gulation du syst\u00e8me hormonal', "Retour \u00e0 l'\u00e9quilibre alimentaire naturel"],
      questions: [
        { id: 'luxo-pulsions', label: 'Pulsions / envies de sucre' },
        { id: 'luxo-graisse',  label: 'Graisse visc\u00e9rale' },
        { id: 'luxo-stress',   label: 'Stress l\u00e9ger' },
        { id: 'luxo-sommeil',  label: 'Sommeil l\u00e9g\u00e8rement perturb\u00e9' }
      ],
      poidsGroup: {
        label: 'Objectif perte de poids',
        options: [
          { id: 'poids-3-5', label: '3 \u00e0 5 kg',   sessions: 12 },
          { id: 'poids-6-9', label: '6 \u00e0 9 kg',   sessions: 15 },
          { id: 'poids-10',  label: '10 kg et +', sessions: 20 }
        ]
      }
    },
    ishape: {
      name: 'I-Shape', tag: 'I-Shape', shortName: 'I-Shape',
      benefits: ['\u2191 M\u00e9tabolisme de base et d\u00e9pense calorique', 'Stimulation et tonicit\u00e9 musculaire', 'Perte centim\u00e9trique localis\u00e9e \u2014 silhouette affin\u00e9e', 'Diminution de la cellulite'],
      questions: [
        { id: 'ishape-mb',        label: 'M\u00e9tabolisme bas' },
        { id: 'ishape-muscu',     label: 'Masse musculaire faible' },
        { id: 'ishape-ventre',    label: 'Ventre qui tombe' },
        { id: 'ishape-atonicite', label: 'Atonicit\u00e9 musculaire' },
        { id: 'ishape-cellulite', label: 'Cellulite' }
      ]
    },
    presso: {
      name: 'Presso', tag: 'Presso', shortName: 'Presso',
      benefits: ["\u2193 R\u00e9tention d'eau \u2014 l\u00e9g\u00e8ret\u00e9 imm\u00e9diate", 'Am\u00e9liore transit, \u00e9limination & constipation', '\u00c9limination des d\u00e9chets m\u00e9taboliques', 'Drainage & circulation boost\u00e9s'],
      questions: [
        { id: 'presso-eau',          label: "R\u00e9tention d'eau" },
        { id: 'presso-circulation',  label: 'Mauvaise circulation' },
        { id: 'presso-constipation', label: 'Constipation' },
        { id: 'presso-teint',        label: 'Teint terne' },
        { id: 'presso-toxines',      label: "Sensation d'encombrement / toxines" }
      ]
    },
    relax: {
      name: 'Luxo Relax', tag: 'Relax', shortName: 'Luxo relax',
      benefits: ['Mental apais\u00e9', 'Am\u00e9lioration de la qualit\u00e9 du sommeil', "R\u00e9gulation des sautes d'humeur & irritabilit\u00e9", '\u2193 Stress et charge mentale'],
      questions: [
        { id: 'relax-stress',   label: 'Stress \u00e9lev\u00e9 \u2191\u2191' },
        { id: 'relax-charge',   label: 'Charge mentale' },
        { id: 'relax-insomnie', label: 'Insomnie' },
        { id: 'relax-fatigue',  label: 'Fatigue mentale / instabilit\u00e9 \u00e9motionnelle' },
        { id: 'relax-sommeil',  label: 'Trouble du sommeil important' }
      ]
    }
  };

  function renderForm() {
    const grid = document.getElementById('formGrid');
    grid.innerHTML = '';
    Object.entries(prestations).forEach(([key, p]) => {
      const card = document.createElement('div');
      card.className = 'presta-card';
      card.dataset.key = key;
      let questionsHTML = p.questions.map(q =>
        '<label class="check-item"><input type="checkbox" id="' + q.id + '" data-presta="' + key + '" data-type="single" onchange="updateScores()"><span>' + q.label + '</span></label>'
      ).join('');
      let poidsHTML = '';
      if (p.poidsGroup) {
        poidsHTML = '<div class="check-group"><div class="check-group-label">' + p.poidsGroup.label + '</div>' +
          p.poidsGroup.options.map(o =>
            '<label class="check-item"><input type="radio" name="poids-group" id="' + o.id + '" data-presta="' + key + '" data-type="poids" data-sessions="' + o.sessions + '" onchange="updateScores()"><span>' + o.label + '</span></label>'
          ).join('') + '</div>';
      }
      card.innerHTML =
        '<div class="presta-header"><div class="presta-tag">' + p.tag + '</div><div class="presta-name">' + p.name + '</div><div class="score-badge" id="badge-' + key + '">0</div></div>' +
        '<div class="presta-body">' + questionsHTML + poidsHTML + '</div>';
      grid.appendChild(card);
    });
  }

  function calculateScores() {
    const scores = { luxo: 0, ishape: 0, presso: 0, relax: 0 };
    let poidsSessions = null, poidsLabel = null;
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
      if (cb.dataset.presta) scores[cb.dataset.presta]++;
    });
    const poidsChecked = document.querySelector('input[data-type="poids"]:checked');
    if (poidsChecked) {
      scores.luxo += 1;
      poidsSessions = parseInt(poidsChecked.dataset.sessions);
      const opt = prestations.luxo.poidsGroup.options.find(o => o.id === poidsChecked.id);
      if (opt) poidsLabel = opt.label;
    }
    return { scores, poidsSessions, poidsLabel };
  }

  function updateScores() {
    const { scores, poidsSessions, poidsLabel } = calculateScores();
    Object.entries(scores).forEach(([key, score]) => {
      const badge = document.getElementById('badge-' + key);
      const card = document.querySelector('.presta-card[data-key="' + key + '"]');
      badge.textContent = score;
      badge.className = 'score-badge';
      card.classList.remove('has-score');
      if (score >= 4) { badge.classList.add('mandatory'); card.classList.add('has-score'); }
      else if (score >= 3) { badge.classList.add('recommended'); card.classList.add('has-score'); }
      else if (score >= 2) { badge.classList.add('active'); card.classList.add('has-score'); }
    });
    renderResults(scores, poidsSessions, poidsLabel);
  }

  function renderResults(scores, poidsSessions, poidsLabel) {
    const recommended = Object.entries(scores).filter(([, s]) => s >= 2).sort((a, b) => b[1] - a[1]);
    const cureGrid = document.getElementById('cureGrid');
    const results = document.getElementById('results');
    const emptyState = document.getElementById('emptyState');
    const printBtn = document.getElementById('printBtn');
    if (recommended.length === 0) {
      results.classList.remove('visible'); emptyState.style.display = 'block'; printBtn.classList.remove('visible'); return;
    }
    emptyState.style.display = 'none'; results.classList.add('visible'); printBtn.classList.add('visible');
    const sessionsCount = poidsSessions || 12;
    const sub = document.getElementById('resultsSub');
    sub.innerHTML = 'Protocole personnalis\u00e9 sur <strong>' + sessionsCount + ' s\u00e9ances</strong>' + (poidsLabel ? ' \u2014 objectif ' + poidsLabel : '');
    cureGrid.className = 'cure-grid cols-' + recommended.length;
    cureGrid.innerHTML = '';
    recommended.forEach(([key, score]) => {
      const p = prestations[key];
      let statusClass = 'proposed', statusText = 'Propos\u00e9e';
      if (score >= 4) { statusClass = 'mandatory'; statusText = 'Indispensable'; }
      else if (score >= 3) { statusClass = 'recommended'; statusText = 'Fortement recommand\u00e9e'; }
      const card = document.createElement('div');
      card.className = 'cure-card'; card.dataset.key = key;
      card.innerHTML =
        '<div class="cure-status ' + statusClass + '">' + statusText + '</div>' +
        '<div class="cure-tag">' + p.tag + '</div>' +
        '<div class="cure-name">' + p.name + '</div>' +
        '<div class="cure-sessions"><span class="cure-sessions-num">' + sessionsCount + '</span><span class="cure-sessions-label">s\u00e9ances</span></div>' +
        '<ul class="cure-benefits">' + p.benefits.map(b => '<li>' + b + '</li>').join('') + '</ul>';
      cureGrid.appendChild(card);
    });
    renderPricingRows(recommended, sessionsCount);
  }

  const DEFAULT_PRICE = 49;
  const ADDONS = {
    luxo:   { name: 'Guide du r\u00e9\u00e9quilibrage alimentaire', detail: 'Offert avec la cure Luxo perte de poids', price: 19 },
    ishape: { name: 'Tenue I-Shape', detail: 'Tenue technique d\u00e9di\u00e9e \u00e0 la cure I-Shape', price: 60 }
  };

  function renderPricingRows(recommended, sessionsCount) {
    const rows = document.getElementById('priceRows');
    const keys = recommended.map(([k]) => k);
    let html = recommended.map(([key]) => {
      const p = prestations[key];
      return '<div class="price-row"><div class="price-row-label"><span class="price-row-name">' + p.name + '</span><span class="price-row-detail" style="color:var(--ink-soft);">' + DEFAULT_PRICE + ' \u20ac / s\u00e9ance</span></div>' +
        '<div style="display:flex;align-items:center;gap:8px;"><input type="number" class="sessions-input" id="sessions-' + key + '" min="1" step="1" oninput="updateTotal()" value="' + sessionsCount + '"><span style="font-size:14px;color:var(--ink-soft);">s\u00e9ances</span></div></div>';
    }).join('');
    const addons = [];
    if (keys.includes('luxo'))   addons.push(ADDONS.luxo);
    if (keys.includes('ishape')) addons.push(ADDONS.ishape);
    if (addons.length > 0) {
      html += '<div class="addon-section-label">Compl\u00e9ments inclus</div>';
      html += addons.map(a =>
        '<div class="price-row addon-row" data-fixed-price="' + a.price + '"><div class="price-row-label"><span class="price-row-name addon-name">' + a.name + '</span><span class="price-row-detail">' + a.detail + '</span></div><div class="price-row-amount">' + a.price + ' \u20ac</div></div>'
      ).join('');
    }
    rows.innerHTML = html;
    updateTotal();
  }

  function updateTotal() {
    let total = 0;
    document.querySelectorAll('.sessions-input').forEach(inp => {
      const key = inp.id.replace('sessions-', '');
      const count = parseFloat(inp.value) || 0;
      total += count * DEFAULT_PRICE;
      // sync session count shown in the cure card
      const cureCard = document.querySelector('.cure-card[data-key="' + key + '"] .cure-sessions-num');
      if (cureCard) cureCard.textContent = count;
      // sync the detail line in the pricing row
      const detail = inp.closest('.price-row')?.querySelector('.price-row-detail');
      if (detail) detail.textContent = DEFAULT_PRICE + ' \u20ac / s\u00e9ance';
    });
    document.querySelectorAll('[data-fixed-price]').forEach(el => { total += parseFloat(el.dataset.fixedPrice) || 0; });
    document.getElementById('priceTotal').textContent = total > 0 ? total.toLocaleString('fr-FR') + ' \u20ac' : '\u2014 \u20ac';
    renderEcheancier();
  }

  // ── ÉCHÉANCIER ──────────────────────────────────────────────────────────────
  let currentNbEch = 3;
  const ordinal = ['1ère', '2ème', '3ème', '4ème', '5ème', '6ème'];

  function distribute(qty, n) {
    if (qty <= 0) return Array(n).fill(0);
    const result = [];
    let remaining = qty;
    for (let i = 0; i < n; i++) {
      const share = i === 0 ? Math.ceil(remaining / (n - i)) : Math.round(remaining / (n - i));
      result.push(share);
      remaining -= share;
    }
    return result;
  }

  function computeInstallments(total, n) {
    if (total === 0) return Array(n).fill(0);
    if (n === 1) return [total];
    const payments = Array(n).fill(0);
    // Distribuer les centimes
    const base = Math.floor(total / n);
    const remainder = total - base * n;
    for (let i = 0; i < n; i++) payments[i] = base + (i < remainder ? 1 : 0);
    // Première échéance légèrement plus haute si arrondi
    return payments;
  }

  function getTotalNumeric() {
    let total = 0;
    document.querySelectorAll('.sessions-input').forEach(inp => {
      total += (parseFloat(inp.value) || 0) * DEFAULT_PRICE;
    });
    document.querySelectorAll('[data-fixed-price]').forEach(el => {
      total += parseFloat(el.dataset.fixedPrice) || 0;
    });
    return total;
  }

  function setNbEch(n) {
    currentNbEch = n;
    document.querySelectorAll('.ech-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.n) === n);
    });
    renderEcheancier();
  }

  function renderEcheancier() {
    const total = getTotalNumeric();
    const echEl = document.getElementById('echeancier');
    if (total <= 0) { echEl.classList.remove('show'); return; }
    echEl.classList.add('show');

    const fmtEur = (v) => v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' \u20ac';
    document.getElementById('echTotal').textContent = fmtEur(total);
    const sub = document.getElementById('echTotalSub');
    sub.textContent = currentNbEch > 1 ? 'R\u00e9parti sur ' + currentNbEch + ' \u00e9ch\u00e9ances' : 'R\u00e8glement en une fois';

    const payments = computeInstallments(total, currentNbEch);
    const cards = document.getElementById('echCards');
    cards.innerHTML = payments.map((amt, i) => {
      const isFirst = i === 0;
      const pct = Math.round(amt / total * 100);
      return '<div class="ech-card ' + (isFirst ? 'first' : '') + '">' +
        '<div class="ech-card-left">' +
          '<div class="ech-card-ordinal">' + ordinal[i] + ' \u00e9ch\u00e9ance</div>' +
          (isFirst && currentNbEch > 1 ? '<div class="ech-card-note">Versement initial</div>' : '') +
          '<div class="ech-bar-wrap"><div class="ech-bar" style="width:' + pct + '%"></div></div>' +
        '</div>' +
        '<div>' +
          '<div class="ech-card-amount">' + fmtEur(amt) + '</div>' +
          '<div class="ech-card-pct">' + pct + ' %</div>' +
        '</div>' +
      '</div>';
    }).join('');

    const verifyEl = document.getElementById('echVerify');
    const verifyAmt = document.getElementById('echVerifyAmount');
    verifyEl.style.display = currentNbEch > 1 ? 'flex' : 'none';
    if (currentNbEch > 1) verifyAmt.textContent = fmtEur(payments.reduce((a, b) => a + b, 0));

    // Afficher le bouton enregistrer
    document.getElementById('saveSection').classList.add('show');
  }
  // ────────────────────────────────────────────────────────────────────────────

  // Mapping clé formulaire cure → ID CARE_SERVICES du PaymentForm
  const CURE_KEY_TO_CARE_SERVICE = {
    'luxo':   'luxo-pdp',
    'ishape': 'ishape',
    'presso': 'presso',
    'relax':  'luxo-relax',
    'meno':   'luxo-meno',
    'adipo':  'adipologie',
    'cavitalyse': 'cavitalyse',
    'meso':   'meso-visage',
    'meso-corps': 'meso-corps',
    'advance-lift': 'advance-lift',
    'psio':   'psio',
  };
  const CARE_SERVICES_MAP = {
    'luxo-pdp':      'Luxo - PDP',
    'luxo-relax':    'Luxo - Relax',
    'luxo-meno':     'Luxo - Méno',
    'ishape':        'I-Shape',
    'cavitalyse':    'Cavitalyse',
    'adipologie':    'Adipologie',
    'presso':        'Presso',
    'meso-corps':    'Méso Corps',
    'meso-visage':   'Méso Visage',
    'advance-lift':  'Advance Lift',
    'psio':          'Psio',
    'guide':         'Guide',
    'tenue':         'Tenue',
  };

  function getActiveTreatments() {
    const results = [];
    document.querySelectorAll('.sessions-input').forEach(inp => {
      const key = inp.id.replace('sessions-', '');
      const sessions = parseFloat(inp.value) || 0;
      if (sessions > 0) {
        const nameEl = inp.closest('.price-row')?.querySelector('.price-row-name');
        const careServiceId = CURE_KEY_TO_CARE_SERVICE[key] || key;
        results.push({
          name: nameEl ? nameEl.textContent : key,
          sessions: sessions,
          pricePerSession: DEFAULT_PRICE,
          careServiceId: careServiceId,
        });
      }
    });
    // Addons (guide, tenue)
    document.querySelectorAll('[data-fixed-price]').forEach(el => {
      const addonName = el.querySelector('.addon-name')?.textContent || '';
      let careServiceId = null;
      if (addonName.toLowerCase().includes('guide')) careServiceId = 'guide';
      else if (addonName.toLowerCase().includes('tenue')) careServiceId = 'tenue';
      if (careServiceId) {
        results.push({ name: addonName, sessions: 1, pricePerSession: parseFloat(el.dataset.fixedPrice) || 0, careServiceId });
      }
    });
    return results;
  }

  function saveCure() {
    const total = getTotalNumeric();
    if (total <= 0) return;
    const payments = computeInstallments(total, currentNbEch);
    const treatments = getActiveTreatments();
    const payload = {
      totalPrice: total,
      installmentCount: currentNbEch,
      installments: payments.map((amt, i) => ({ index: i + 1, amount: amt })),
      savedAt: new Date().toISOString(),
      treatments: treatments,
      careServiceIds: treatments.map(t => t.careServiceId).filter(Boolean),
    };
    window.parent.postMessage({ type: 'SAVE_CURE_DATA', payload }, '*');
  }

  function revealPricing() {
    document.getElementById('pricingLocked').classList.add('hide');
    document.getElementById('pricingRevealed').classList.add('show');
    renderEcheancier();
  }

  function resetForm() {
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    document.getElementById('clientName').value = '';
    document.getElementById('clientDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('pricingLocked').classList.remove('hide');
    document.getElementById('pricingRevealed').classList.remove('show');
    document.getElementById('echeancier').classList.remove('show');
    document.getElementById('saveSection').classList.remove('show');
    updateScores();
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderForm();
    updateScores();
    document.getElementById('clientDate').value = new Date().toISOString().split('T')[0];
    ${clientName ? `document.getElementById('clientName').value = ${JSON.stringify(clientName)};` : ''}
  });
</script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Formulaire Cure</span>
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
          src={url}
          className="flex-1 w-full border-0"
          title="Formulaire Cure MaBeautyPlus"
        />
      </div>
    </div>
  );
};

export default CureFormModal;
