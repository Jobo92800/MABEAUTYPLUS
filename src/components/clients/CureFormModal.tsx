import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface CureFormModalProps {
  clientName?: string;
  onClose: () => void;
}

const CureFormModal: React.FC<CureFormModalProps> = ({ clientName, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

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
    --bg: #FBFAF8;
    --bg-soft: #F2EBE5;
    --bg-card: #FFFFFF;
    --ink: #565656;
    --ink-soft: #8A8A8A;
    --line: #EFEBE3;
    --line-strong: #D8CBC2;
    --gold: #D8CBC2;
    --gold-soft: #EFEBE3;
    --luxo: #E8A8AF;
    --luxo-soft: #F1D5DA;
    --ishape: #8FCDD5;
    --ishape-soft: #C5E6EA;
    --presso: #B5D4DC;
    --presso-soft: #E1F0F2;
    --relax: #D8CBC2;
    --relax-soft: #F2EBE5;
    --proposed: #D8CBC2;
    --recommended: #C5A99C;
    --mandatory: #8A8A8A;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: var(--bg);
    color: var(--ink);
    font-family: 'Manrope', sans-serif;
    font-weight: 400;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  body {
    background:
      radial-gradient(circle at 10% 0%, rgba(241,213,218,0.35) 0%, transparent 45%),
      radial-gradient(circle at 90% 100%, rgba(197,230,234,0.30) 0%, transparent 45%),
      var(--bg);
  }
  .container { max-width: 1200px; margin: 0 auto; padding: 24px 20px 60px; }

  .header { text-align: center; padding: 16px 0 28px; }
  .brand-mark { font-family: 'Cormorant Garamond', serif; font-size: 12px; letter-spacing: 0.35em; color: var(--gold); text-transform: uppercase; margin-bottom: 8px; font-weight: 500; }
  .header h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(26px, 4vw, 40px); font-weight: 500; letter-spacing: -0.01em; line-height: 1.05; color: var(--ink); }
  .header h1 em { font-style: italic; color: var(--gold); }
  .header .subtitle { margin-top: 10px; font-size: 13px; color: var(--ink-soft); max-width: 480px; margin-left: auto; margin-right: auto; }
  .divider { width: 50px; height: 1px; background: var(--gold); margin: 18px auto 0; }

  .client-bar { background: var(--bg-card); border: 1px solid var(--line); border-radius: 14px; padding: 16px 20px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr auto; gap: 16px; align-items: end; }
  .client-field label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--ink-soft); margin-bottom: 6px; font-weight: 500; }
  .client-field input { width: 100%; border: none; border-bottom: 1px solid var(--line); padding: 5px 0; font-family: 'Manrope', sans-serif; font-size: 15px; background: transparent; color: var(--ink); transition: border-color 0.2s; }
  .client-field input:focus { outline: none; border-bottom-color: var(--gold); }
  .reset-btn { background: transparent; border: 1px solid var(--line); color: var(--ink-soft); padding: 9px 16px; border-radius: 8px; font-family: 'Manrope', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.2s; }
  .reset-btn:hover { border-color: var(--gold); color: var(--gold); }

  .form-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
  @media (max-width: 900px) { .form-grid { grid-template-columns: repeat(2, 1fr); } .client-bar { grid-template-columns: 1fr; } }
  @media (max-width: 560px) { .form-grid { grid-template-columns: 1fr; } }

  .presta-card { background: var(--bg-card); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; transition: all 0.3s ease; position: relative; }
  .presta-card.has-score { box-shadow: 0 6px 20px -6px rgba(0,0,0,0.08); transform: translateY(-2px); }
  .presta-header { padding: 14px 16px 12px; border-bottom: 1px solid var(--line); position: relative; }
  .presta-card[data-key="luxo"] .presta-header { background: var(--luxo-soft); }
  .presta-card[data-key="ishape"] .presta-header { background: var(--ishape-soft); }
  .presta-card[data-key="presso"] .presta-header { background: var(--presso-soft); }
  .presta-card[data-key="relax"] .presta-header { background: var(--relax-soft); }
  .presta-name { font-family: 'Cormorant Garamond', serif; font-size: 19px; font-weight: 600; letter-spacing: 0.01em; color: var(--ink); line-height: 1.1; }
  .presta-tag { font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 3px; font-weight: 600; }
  .presta-card[data-key="luxo"] .presta-tag { color: var(--luxo); }
  .presta-card[data-key="ishape"] .presta-tag { color: var(--ishape); }
  .presta-card[data-key="presso"] .presta-tag { color: var(--presso); }
  .presta-card[data-key="relax"] .presta-tag { color: var(--relax); }
  .score-badge { position: absolute; top: 12px; right: 12px; width: 30px; height: 30px; border-radius: 50%; background: var(--bg-card); border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: var(--ink-soft); transition: all 0.3s; }
  .score-badge.active { color: var(--ink); border-color: var(--line-strong); background: var(--bg-soft); }
  .score-badge.recommended { background: var(--recommended); color: white; border-color: var(--recommended); }
  .score-badge.mandatory { background: var(--luxo); color: white; border-color: var(--luxo); box-shadow: 0 0 0 3px rgba(232,168,175,0.15); }
  .presta-body { padding: 10px 14px 14px; flex: 1; }
  .check-item { display: flex; align-items: flex-start; gap: 8px; padding: 6px 0; cursor: pointer; border-radius: 5px; transition: background 0.15s; user-select: none; }
  .check-item:hover { background: var(--bg-soft); padding-left: 6px; padding-right: 6px; margin-left: -6px; margin-right: -6px; }
  .check-item input[type="checkbox"], .check-item input[type="radio"] { appearance: none; -webkit-appearance: none; width: 16px; height: 16px; border: 1.5px solid var(--line); cursor: pointer; position: relative; flex-shrink: 0; margin-top: 2px; background: white; transition: all 0.2s; }
  .check-item input[type="checkbox"] { border-radius: 3px; }
  .check-item input[type="radio"] { border-radius: 50%; }
  .check-item input[type="checkbox"]:checked { background: var(--gold); border-color: var(--gold); }
  .check-item input[type="checkbox"]:checked::after { content: ''; position: absolute; left: 3px; top: 1px; width: 5px; height: 8px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
  .check-item input[type="radio"]:checked { border-color: var(--gold); background: white; }
  .check-item input[type="radio"]:checked::after { content: ''; position: absolute; top: 2px; left: 2px; width: 8px; height: 8px; border-radius: 50%; background: var(--gold); }
  .check-item label { font-size: 13px; color: var(--ink); cursor: pointer; line-height: 1.35; flex: 1; }
  .check-group { margin-top: 6px; padding: 8px 10px; background: var(--bg-soft); border-radius: 7px; border-left: 2px solid var(--gold-soft); }
  .check-group-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--ink-soft); margin-bottom: 5px; font-weight: 600; }

  .legend { background: var(--bg-card); border: 1px solid var(--line); border-radius: 10px; padding: 12px 18px; margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 18px; justify-content: center; align-items: center; font-size: 12px; color: var(--ink-soft); }
  .legend-item { display: flex; align-items: center; gap: 6px; }
  .legend-dot { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 700; }
  .legend-dot.l1 { background: var(--proposed); color: var(--ink); }
  .legend-dot.l2 { background: var(--recommended); }
  .legend-dot.l3 { background: var(--luxo); }

  .results { margin-top: 28px; opacity: 0; transform: translateY(16px); transition: opacity 0.4s, transform 0.4s; pointer-events: none; }
  .results.visible { opacity: 1; transform: translateY(0); pointer-events: auto; }
  .results-header { text-align: center; margin-bottom: 24px; padding-top: 24px; border-top: 1px solid var(--line); }
  .results-eyebrow { font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; color: var(--gold); margin-bottom: 8px; font-weight: 600; }
  .results-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(22px, 3.5vw, 34px); font-weight: 500; color: var(--ink); line-height: 1.1; }
  .results-title em { font-style: italic; color: var(--gold); }
  .results-sub { margin-top: 8px; font-size: 13px; color: var(--ink-soft); }

  .cure-grid { display: grid; gap: 14px; margin-bottom: 20px; }
  .cure-grid.cols-1 { grid-template-columns: minmax(0, 440px); justify-content: center; }
  .cure-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
  .cure-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
  .cure-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
  @media (max-width: 800px) { .cure-grid.cols-3, .cure-grid.cols-4 { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 500px) { .cure-grid { grid-template-columns: 1fr !important; } }

  .cure-card { background: var(--bg-card); border: 1px solid var(--line); border-radius: 16px; padding: 22px 20px; position: relative; overflow: hidden; display: flex; flex-direction: column; }
  .cure-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
  .cure-card[data-key="luxo"]::before { background: var(--luxo); }
  .cure-card[data-key="ishape"]::before { background: var(--ishape); }
  .cure-card[data-key="presso"]::before { background: var(--presso); }
  .cure-card[data-key="relax"]::before { background: var(--relax); }
  .cure-status { position: absolute; top: 14px; right: 14px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; padding: 3px 8px; border-radius: 100px; font-weight: 600; }
  .cure-status.proposed { background: rgba(216,203,194,0.25); color: #9A8478; }
  .cure-status.recommended { background: rgba(197,169,156,0.20); color: var(--recommended); }
  .cure-status.mandatory { background: rgba(232,168,175,0.20); color: var(--luxo); }
  .cure-tag { font-size: 9px; text-transform: uppercase; letter-spacing: 0.25em; font-weight: 600; margin-bottom: 6px; }
  .cure-card[data-key="luxo"] .cure-tag { color: var(--luxo); }
  .cure-card[data-key="ishape"] .cure-tag { color: var(--ishape); }
  .cure-card[data-key="presso"] .cure-tag { color: var(--presso); }
  .cure-card[data-key="relax"] .cure-tag { color: var(--relax); }
  .cure-name { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; line-height: 1.1; color: var(--ink); margin-bottom: 14px; }
  .cure-sessions { display: flex; align-items: baseline; gap: 6px; padding: 12px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); margin-bottom: 14px; }
  .cure-sessions-num { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 600; line-height: 1; }
  .cure-card[data-key="luxo"] .cure-sessions-num { color: var(--luxo); }
  .cure-card[data-key="ishape"] .cure-sessions-num { color: var(--ishape); }
  .cure-card[data-key="presso"] .cure-sessions-num { color: var(--presso); }
  .cure-card[data-key="relax"] .cure-sessions-num { color: var(--relax); }
  .cure-sessions-label { font-size: 12px; color: var(--ink-soft); }
  .cure-benefits { list-style: none; flex: 1; }
  .cure-benefits li { font-size: 12.5px; color: var(--ink); padding: 5px 0 5px 16px; position: relative; line-height: 1.35; }
  .cure-benefits li::before { content: ''; position: absolute; left: 0; top: 12px; width: 7px; height: 1px; background: var(--gold); }

  .pricing { background: var(--bg-card); border: 1px solid var(--line); border-radius: 16px; padding: 24px; text-align: center; }
  .pricing-locked { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .pricing-locked-text { font-size: 13px; color: var(--ink-soft); max-width: 340px; }
  .reveal-btn { background: var(--luxo); color: white; border: none; padding: 12px 28px; border-radius: 100px; font-family: 'Manrope', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
  .reveal-btn:hover { background: #D89098; transform: translateY(-1px); }
  .pricing-revealed { display: none; }
  .pricing-revealed.show { display: block; }
  .pricing-locked.hide { display: none; }
  .price-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--line); }
  .price-row:last-child { border-bottom: none; }
  .price-row-label { text-align: left; display: flex; flex-direction: column; gap: 2px; }
  .price-row-name { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 600; }
  .price-row-detail { font-size: 11px; color: var(--ink-soft); }
  .price-input { width: 80px; border: 1px solid var(--line-strong); border-radius: 5px; padding: 5px 8px; text-align: right; font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 600; color: var(--ink); background: var(--bg); }
  .price-input:focus { outline: none; border-color: var(--luxo); }
  .addon-section-label { margin: 14px 0 3px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.25em; color: var(--ink-soft); font-weight: 600; text-align: left; padding-top: 12px; border-top: 1px dashed var(--line); }
  .addon-row .addon-name { font-size: 16px; font-style: italic; }
  .price-row-amount { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 600; color: var(--ink); }
  .price-total { margin-top: 16px; padding-top: 16px; border-top: 2px solid var(--line-strong); display: flex; justify-content: space-between; align-items: baseline; }
  .price-total-label { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 600; }
  .price-total-amount { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 700; color: var(--luxo); }

  .empty-state { text-align: center; padding: 40px 20px; color: var(--ink-soft); }
  .empty-state-icon { font-family: 'Cormorant Garamond', serif; font-size: 40px; color: var(--gold-soft); margin-bottom: 10px; font-style: italic; }
  .empty-state-text { font-size: 13px; max-width: 340px; margin: 0 auto; }

  @media print {
    .client-bar, .form-grid, .legend, .results-header, .reset-btn { display: none !important; }
    body { background: white; }
    .container { padding: 0; }
    .results { opacity: 1; transform: none; }
    .pricing-locked { display: none !important; }
    .pricing-revealed { display: block !important; }
  }
  .print-btn { position: fixed; bottom: 20px; right: 20px; background: var(--luxo); color: white; border: none; width: 46px; height: 46px; border-radius: 50%; cursor: pointer; box-shadow: 0 8px 24px -8px rgba(232,168,175,0.5); transition: all 0.2s; display: none; align-items: center; justify-content: center; }
  .print-btn.visible { display: flex; }
  .print-btn:hover { background: #D89098; transform: translateY(-2px); }
  .print-btn svg { width: 20px; height: 20px; }
</style>
</head>
<body>
<div class="container">
  <header class="header">
    <div class="brand-mark">MaBeauty<span style="color: var(--ink-soft);">+</span></div>
    <h1>Bilan & <em>Cure personnalisée</em></h1>
    <p class="subtitle">Cochez les besoins identifiés lors du bilan pour générer la cure adaptée à votre cliente.</p>
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
        <div style="font-family: 'Cormorant Garamond', serif; font-size: 24px; color: var(--ink);">Tarif sur-mesure</div>
        <p class="pricing-locked-text">Le tarif sera détaillé après présentation complète des bénéfices et du protocole.</p>
        <button class="reveal-btn" onclick="revealPricing()">Afficher le tarif</button>
      </div>
      <div class="pricing-revealed" id="pricingRevealed">
        <div style="font-family: 'Cormorant Garamond', serif; font-size: 22px; margin-bottom: 16px; text-align: center;">Récapitulatif tarifaire</div>
        <div id="priceRows"></div>
        <div class="price-total">
          <span class="price-total-label">Total cure</span>
          <span class="price-total-amount" id="priceTotal">— €</span>
        </div>
        <p style="font-size: 11px; color: var(--ink-soft); margin-top: 12px; text-align: center;">Tarif standard 49€/séance. Vous pouvez ajuster chaque ligne au besoin.</p>
      </div>
    </div>
  </div>

  <div class="empty-state" id="emptyState">
    <div class="empty-state-icon">~</div>
    <p class="empty-state-text">Cochez au moins 2 cases sur une prestation pour découvrir la cure recommandée.</p>
  </div>
</div>

<button class="print-btn" id="printBtn" onclick="window.print()" title="Imprimer">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
</button>

<script>
  const prestations = {
    luxo: {
      name: 'Luxothérapie Perte de Poids', tag: 'Luxo', shortName: 'Luxo perte de poids',
      benefits: ['↓ Fringales et grignotage émotionnel', '↓ Pulsions de sucre', 'Régulation du système hormonal', "Retour à l'équilibre alimentaire naturel"],
      questions: [
        { id: 'luxo-pulsions', label: 'Pulsions / envies de sucre' },
        { id: 'luxo-graisse',  label: 'Graisse viscérale' },
        { id: 'luxo-stress',   label: 'Stress léger' },
        { id: 'luxo-sommeil',  label: 'Sommeil légèrement perturbé' }
      ],
      poidsGroup: {
        label: 'Objectif perte de poids',
        options: [
          { id: 'poids-3-5', label: '3 à 5 kg',   sessions: 12 },
          { id: 'poids-6-9', label: '6 à 9 kg',   sessions: 15 },
          { id: 'poids-10',  label: '10 kg et +', sessions: 20 }
        ]
      }
    },
    ishape: {
      name: 'I-Shape', tag: 'I-Shape', shortName: 'I-Shape',
      benefits: ['↑ Métabolisme de base et dépense calorique', 'Stimulation et tonicité musculaire', 'Perte centimétrique localisée — silhouette affinée', 'Diminution de la cellulite'],
      questions: [
        { id: 'ishape-mb',        label: 'Métabolisme bas' },
        { id: 'ishape-muscu',     label: 'Masse musculaire faible' },
        { id: 'ishape-ventre',    label: 'Ventre qui tombe' },
        { id: 'ishape-atonicite', label: 'Atonicité musculaire' },
        { id: 'ishape-cellulite', label: 'Cellulite' }
      ]
    },
    presso: {
      name: 'Presso', tag: 'Presso', shortName: 'Presso',
      benefits: ["↓ Rétention d'eau — légèreté immédiate", 'Améliore transit, élimination & constipation', 'Élimination des déchets métaboliques', 'Drainage & circulation boostés'],
      questions: [
        { id: 'presso-eau',          label: "Rétention d'eau" },
        { id: 'presso-circulation',  label: 'Mauvaise circulation' },
        { id: 'presso-constipation', label: 'Constipation' },
        { id: 'presso-teint',        label: 'Teint terne' },
        { id: 'presso-toxines',      label: "Sensation d'encombrement / toxines" }
      ]
    },
    relax: {
      name: 'Luxo Relax', tag: 'Relax', shortName: 'Luxo relax',
      benefits: ['Mental apaisé', 'Amélioration de la qualité du sommeil', "Régulation des sautes d'humeur & irritabilité", '↓ Stress et charge mentale'],
      questions: [
        { id: 'relax-stress',   label: 'Stress élevé ↑↑' },
        { id: 'relax-charge',   label: 'Charge mentale' },
        { id: 'relax-insomnie', label: 'Insomnie' },
        { id: 'relax-fatigue',  label: 'Fatigue mentale / instabilité émotionnelle' },
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
      let questionsHTML = p.questions.map(q => \`
        <label class="check-item">
          <input type="checkbox" id="\${q.id}" data-presta="\${key}" data-type="single" onchange="updateScores()">
          <span>\${q.label}</span>
        </label>
      \`).join('');
      let poidsHTML = '';
      if (p.poidsGroup) {
        poidsHTML = \`
          <div class="check-group">
            <div class="check-group-label">\${p.poidsGroup.label}</div>
            \${p.poidsGroup.options.map(o => \`
              <label class="check-item">
                <input type="radio" name="poids-group" id="\${o.id}" data-presta="\${key}" data-type="poids" data-sessions="\${o.sessions}" onchange="updateScores()">
                <span>\${o.label}</span>
              </label>
            \`).join('')}
          </div>
        \`;
      }
      card.innerHTML = \`
        <div class="presta-header">
          <div class="presta-tag">\${p.tag}</div>
          <div class="presta-name">\${p.name}</div>
          <div class="score-badge" id="badge-\${key}">0</div>
        </div>
        <div class="presta-body">\${questionsHTML}\${poidsHTML}</div>
      \`;
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
    const recommended = Object.entries(scores).filter(([_, s]) => s >= 2).sort((a, b) => b[1] - a[1]);
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
    let subText = 'Protocole personnalisé sur <strong>' + sessionsCount + ' séances</strong>';
    if (poidsLabel) subText += ' — objectif ' + poidsLabel;
    sub.innerHTML = subText;
    cureGrid.className = 'cure-grid cols-' + recommended.length;
    cureGrid.innerHTML = '';
    recommended.forEach(([key, score]) => {
      const p = prestations[key];
      let statusClass = 'proposed', statusText = 'Proposée';
      if (score >= 4) { statusClass = 'mandatory'; statusText = 'Indispensable'; }
      else if (score >= 3) { statusClass = 'recommended'; statusText = 'Fortement recommandée'; }
      const card = document.createElement('div');
      card.className = 'cure-card'; card.dataset.key = key;
      card.innerHTML = \`
        <div class="cure-status \${statusClass}">\${statusText}</div>
        <div class="cure-tag">\${p.tag}</div>
        <div class="cure-name">\${p.name}</div>
        <div class="cure-sessions">
          <span class="cure-sessions-num">\${sessionsCount}</span>
          <span class="cure-sessions-label">séances</span>
        </div>
        <ul class="cure-benefits">\${p.benefits.map(b => '<li>' + b + '</li>').join('')}</ul>
      \`;
      cureGrid.appendChild(card);
    });
    renderPricingRows(recommended, sessionsCount);
  }

  const DEFAULT_PRICE = 49;
  const ADDONS = {
    luxo:   { name: 'Guide du rééquilibrage alimentaire', detail: 'Offert avec la cure Luxo perte de poids', price: 19 },
    ishape: { name: 'Tenue I-Shape', detail: 'Tenue technique dédiée à la cure I-Shape', price: 60 }
  };

  function renderPricingRows(recommended, sessionsCount) {
    const rows = document.getElementById('priceRows');
    const keys = recommended.map(([k]) => k);
    let html = recommended.map(([key]) => {
      const p = prestations[key];
      return \`
        <div class="price-row">
          <div class="price-row-label">
            <span class="price-row-name">\${p.name}</span>
            <span class="price-row-detail">\${sessionsCount} séances</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <input type="number" class="price-input" id="price-\${key}" placeholder="49" min="0" step="1" oninput="updateTotal()" value="\${DEFAULT_PRICE}">
            <span style="font-size:13px; color:var(--ink-soft);">€ / séance</span>
          </div>
        </div>
      \`;
    }).join('');
    const addons = [];
    if (keys.includes('luxo'))   addons.push(ADDONS.luxo);
    if (keys.includes('ishape')) addons.push(ADDONS.ishape);
    if (addons.length > 0) {
      html += '<div class="addon-section-label">Compléments inclus</div>';
      html += addons.map(a => \`
        <div class="price-row addon-row" data-fixed-price="\${a.price}">
          <div class="price-row-label">
            <span class="price-row-name addon-name">\${a.name}</span>
            <span class="price-row-detail">\${a.detail}</span>
          </div>
          <div class="price-row-amount">\${a.price} €</div>
        </div>
      \`).join('');
    }
    rows.innerHTML = html;
    updateTotal();
  }

  function updateTotal() {
    const { poidsSessions } = calculateScores();
    const sessionsCount = poidsSessions || 12;
    let total = 0;
    document.querySelectorAll('.price-input').forEach(inp => { total += (parseFloat(inp.value) || 0) * sessionsCount; });
    document.querySelectorAll('[data-fixed-price]').forEach(el => { total += parseFloat(el.dataset.fixedPrice) || 0; });
    document.getElementById('priceTotal').textContent = total > 0 ? total.toLocaleString('fr-FR') + ' €' : '— €';
  }

  function revealPricing() {
    document.getElementById('pricingLocked').classList.add('hide');
    document.getElementById('pricingRevealed').classList.add('show');
  }

  function resetForm() {
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    document.getElementById('clientName').value = '';
    document.getElementById('clientDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('pricingLocked').classList.remove('hide');
    document.getElementById('pricingRevealed').classList.remove('show');
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Formulaire Cure</span>
            {clientName && (
              <span className="text-xs text-gray-400">— {clientName}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Fermer (Échap)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* iframe */}
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
