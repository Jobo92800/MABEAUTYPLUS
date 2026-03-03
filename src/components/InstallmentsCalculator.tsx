import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';

const UP = Math.ceil;
const DOWN = Math.floor;

function distribute(qty: number, n: number, type: string): number[] {
  if (qty <= 0) return Array(n).fill(0);
  switch (n) {
    case 1: return [qty];
    case 2: return [UP(qty/2), DOWN(qty/2)];
    case 3:
      if (["129","259","dome"].includes(type)) { const t=UP(qty/3),u=DOWN(qty/3); return [t,u,qty-t-u]; }
      { const u=UP(qty/3),v=DOWN(qty/3); return [qty-u-v,u,v]; }
    case 4: { const t=UP(qty/4),u=DOWN(qty/4),v=DOWN(qty/4),w=qty-t-u-v; return type==="dome"?[t,u,v,w]:[t,w,v,u]; }
    case 5: { const u=UP(qty/5),v=DOWN(qty/5),w=DOWN(qty/5),x=UP(qty/5),t=qty-u-v-w-x; return type==="dome"?[t,u,v,w,x]:[x,u,v,w,t]; }
    case 6: {
      if (type==="49") { const u=UP(qty/6),v=UP(qty/6),w=DOWN(qty/6),x=DOWN(qty/6),y=DOWN(qty/6); return [qty-u-v-w-x-y,u,v,w,x,y]; }
      if (["149","195","129","259","dome"].includes(type)) { const u=UP(qty/6),v=UP(qty/6),w=UP(qty/6),x=DOWN(qty/6),y=DOWN(qty/6); return [qty-u-v-w-x-y,u,v,w,x,y]; }
      if (type==="65") { const u=UP(qty/6),v=DOWN(qty/6),w=DOWN(qty/6),x=DOWN(qty/6),y=UP(qty/6); return [qty-u-v-w-x-y,u,v,w,x,y]; }
      const u=UP(qty/6),v=DOWN(qty/6),w=DOWN(qty/6),x=DOWN(qty/6),y=DOWN(qty/6); return [qty-u-v-w-x-y,u,v,w,x,y];
    }
    default: return [qty];
  }
}

function distributeAmount(amount: number, N: number): number[] {
  if (amount <= 0) return Array(N).fill(0);
  const base = DOWN(amount/N);
  const higher = amount - base*N;
  return Array(N).fill(0).map((_,i) => i < higher ? base+1 : base);
}

const CATEGORIES = [
  {
    id:"corpo", name:"Soins Minceur — Corps & Minceur", icon:"✦", color:"#0d9488",
    items:[
      { key:"B4",  label:"Luxothérapie",               type:"session", price:49,  tier:"49"  },
      { key:"B5",  label:"I-shape",                    type:"session", price:49,  tier:"49"  },
      { key:"B15", label:"Bottes Presso-Dynamie",      type:"session", price:49,  tier:"49"  },
      { key:"B10", label:"Cavitation seule",           type:"session", price:60,  tier:"60"  },
      { key:"B11", label:"RF + Cavitation",            type:"session", price:99,  tier:"99"  },
      { key:"B12", label:"Plaques + RF + Cavitation",  type:"session", price:110, tier:"110" },
    ],
  },
  {
    id:"extras", name:"Accessoires & Services", icon:"◇", color:"#6366f1",
    items:[
      { key:"B6", label:"Guide rééquilibrage alimentaire", type:"session", price:19, tier:"fixed" },
      { key:"B7", label:"Tenue I-shape",                  type:"session", price:60, tier:"fixed" },
    ],
  },
  {
    id:"lift", name:"Advance Lift — Visage", icon:"◈", color:"#be185d",
    items:[
      { key:"B21", label:"Magic Lift",         type:"session", price:85, tier:"85" },
      { key:"B22", label:"Firming",            type:"session", price:85, tier:"85" },
      { key:"B23", label:"Contour des yeux",   type:"session", price:75, tier:"75" },
      { key:"B24", label:"Contour des lèvres", type:"session", price:75, tier:"75" },
      { key:"B25", label:"Décolleté",          type:"session", price:75, tier:"75" },
      { key:"B26", label:"Acno-Lyse",          type:"session", price:85, tier:"85" },
    ],
  },
  {
    id:"adipo", name:"Adipologie", icon:"◉", color:"#7c3aed",
    items:[
      { key:"B18", label:"Adipologie", type:"session", price:149, tier:"149" },
    ],
  },
  {
    id:"flash", name:"Soins Flash", icon:"⚡", color:"#d97706",
    items:[
      { key:"B27", label:"Soins Flash", type:"session", price:55, tier:"55" },
    ],
  },
  {
    id:"meso_ar", name:"Mésojet — Anti-rides & Fermeté", icon:"◎", color:"#0891b2",
    items:[
      { key:"M01", label:"Cure anti-rides & ridules (7 soins)",  type:"package", price:997 },
      { key:"M02", label:"Cure fermeté & contours (7 séances)",  type:"package", price:997 },
      { key:"M03", label:"Séance entretien cure anti-rides",      type:"package", price:215 },
      { key:"M04", label:"Séance entretien cure fermeté",         type:"package", price:215 },
    ],
  },
  {
    id:"meso_ce", name:"Mésojet — Cernes & Contours des yeux", icon:"◌", color:"#0e7490",
    items:[
      { key:"M05", label:"Cure cernes & poches contours yeux (3 séances)", type:"package", price:267 },
      { key:"M06", label:"Cure cernes & poches contours yeux (6 séances)", type:"package", price:519 },
      { key:"M07", label:"Séance entretien cernes & poches",               type:"package", price: 89 },
      { key:"M08", label:"Cure anti-rides contours des yeux (6 soins)",    type:"package", price:564 },
      { key:"M09", label:"Séance entretien contours des yeux rides",       type:"package", price: 94 },
    ],
  },
  {
    id:"meso_pb", name:"Mésojet — Zone Péribuccale", icon:"◍", color:"#0369a1",
    items:[
      { key:"M10", label:"Cure zone péribuccale (6 soins)",   type:"package", price:504 },
      { key:"M11", label:"Séance entretien zone péribuccale", type:"package", price: 84 },
    ],
  },
  {
    id:"meso_rfv", name:"Mésojet — Radiofréquence Visage", icon:"◑", color:"#155e75",
    items:[
      { key:"M12", label:"Cure RF visage (3 séances)",  type:"package", price:225 },
      { key:"M13", label:"Cure RF visage (6 soins)",    type:"package", price:440 },
      { key:"M14", label:"Séance entretien RF visage",  type:"package", price: 75 },
    ],
  },
  {
    id:"meso_ec", name:"Mésojet — Coup d'Éclat & Hydratation", icon:"✧", color:"#0284c7",
    items:[
      { key:"M15", label:"Séance coup d'éclat premium (unité)",    type:"package", price:185 },
      { key:"M16", label:"3 soins coup d'éclat premium",           type:"package", price:540 },
      { key:"M17", label:"Soin flash hydratation intense (unité)", type:"package", price:179 },
      { key:"M18", label:"3 soins flash hydratation intense",      type:"package", price:522 },
    ],
  },
  {
    id:"meso_c1", name:"Mésojet — RF Corps 1 Zone", icon:"⬤", color:"#0f766e",
    items:[
      { key:"M19", label:"5 séances RF corps 1 zone",        type:"package", price: 450 },
      { key:"M20", label:"10 séances RF corps 1 zone",       type:"package", price: 885 },
      { key:"M21", label:"Séance entretien RF corps 1 zone", type:"package", price:  90 },
    ],
  },
  {
    id:"meso_c2", name:"Mésojet — RF Corps 2 Zones", icon:"⬥", color:"#065f46",
    items:[
      { key:"M22", label:"5 séances RF corps 2 zones",        type:"package", price:  650 },
      { key:"M23", label:"10 séances RF corps 2 zones",       type:"package", price: 1295 },
      { key:"M24", label:"Séance entretien RF corps 2 zones", type:"package", price:  130 },
    ],
  },
  {
    id:"meso_c3", name:"Mésojet — RF Corps 3 Zones", icon:"◆", color:"#166534",
    items:[
      { key:"M25", label:"5 séances RF corps 3 zones",        type:"package", price:  850 },
      { key:"M26", label:"10 séances RF corps 3 zones",       type:"package", price: 1695 },
      { key:"M27", label:"Séance entretien RF corps 3 zones", type:"package", price:  170 },
    ],
  },
  {
    id:"dome", name:"Dôme", icon:"⬡", color:"#059669",
    items:[
      { key:"B38", label:"Dôme (nombre de séances)", type:"session", price:39, tier:"dome" },
    ],
  },
  {
    id:"compl", name:"Compléments alimentaires", icon:"◈", color:"#ea580c",
    items:[
      { key:"B42", label:"BURN — Le Minceur",   type:"session", price:37, tier:"compl" },
      { key:"B43", label:"SOSO — Le Sauveur",   type:"session", price:37, tier:"compl" },
      { key:"B44", label:"SKIN — Le Lifteur",   type:"session", price:37, tier:"compl" },
      { key:"B45", label:"DÉTOX — Le Draineur", type:"session", price:37, tier:"compl" },
    ],
  },
];

function computeTotal(inputs: Record<string, number>): number {
  let total = 0;
  CATEGORIES.forEach(cat => cat.items.forEach(it => { total += (Number(inputs[it.key])||0) * it.price; }));
  return total;
}

function computeInstallments(inputs: Record<string, number>, N: number): number[] {
  const v = (k: string) => Number(inputs[k])||0;
  const total = computeTotal(inputs);
  if (total === 0) return Array(N).fill(0);
  if (N === 1) return [total];

  const payments = Array(N).fill(0);

  payments[0] += v("B6")*19 + v("B7")*60 + (v("B42")+v("B43")+v("B44")+v("B45"))*37;

  [
    { qty: v("B4")+v("B5")+v("B15"), price:49,  tier:"49"  },
    { qty: v("B10"),                  price:60,  tier:"60"  },
    { qty: v("B11"),                  price:99,  tier:"99"  },
    { qty: v("B12"),                  price:110, tier:"110" },
    { qty: v("B18"),                  price:149, tier:"149" },
    { qty: v("B21")+v("B22")+v("B26"), price:85, tier:"85" },
    { qty: v("B23")+v("B24")+v("B25"), price:75, tier:"75" },
    { qty: v("B27"),                  price:55,  tier:"55"  },
  ].forEach(({ qty, price, tier }) => {
    distribute(qty, N, tier).forEach((s, i) => { payments[i] += price*s; });
  });
  distribute(v("B38")*39, N, "dome").forEach((a,i) => { payments[i] += a; });

  ["M01","M02","M03","M04","M05","M06","M07","M08","M09",
   "M10","M11","M12","M13","M14","M15","M16","M17","M18",
   "M19","M20","M21","M22","M23","M24","M25","M26","M27"
  ].forEach(key => {
    const it = CATEGORIES.flatMap(c=>c.items).find(x=>x.key===key);
    if (!it) return;
    distributeAmount((Number(inputs[key])||0)*it.price, N).forEach((a,i) => { payments[i] += a; });
  });

  return payments;
}

const ordinal = ["1ère","2ème","3ème","4ème","5ème","6ème"];
const fmt = (n: number) => n.toLocaleString("fr-FR",{minimumFractionDigits:0,maximumFractionDigits:0})+" €";

interface InstallmentsCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
  onValidate?: (data: { total: number; installments: number[] }) => void;
}

export const InstallmentsCalculator: React.FC<InstallmentsCalculatorProps> = ({ isOpen, onClose, clientName = "", onValidate }) => {
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [nbEch, setNbEch] = useState(3);
  const [client, setClient] = useState(clientName);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ corpo: true });
  const [search, setSearch] = useState("");

  const set = (key: string, val: string | number) => {
    const num = Math.max(0, parseInt(String(val)) || 0);
    setInputs(prev => ({ ...prev, [key]: num }));
  };

  const total = useMemo(() => computeTotal(inputs), [inputs]);
  const payments = useMemo(() => computeInstallments(inputs, nbEch), [inputs, nbEch]);

  const toggleSection = (id: string) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  const reset = () => { setInputs({}); setClient(""); setSearch(""); };

  const activeTreatments = CATEGORIES.flatMap(c =>
    c.items.filter(it => (Number(inputs[it.key])||0) > 0)
           .map(it => ({ label:it.label, qty:inputs[it.key], price:it.price, type:it.type, cat:c }))
  );

  const handleValidate = () => {
    if (onValidate && total > 0) {
      onValidate({ total, installments: payments });
      onClose();
    }
  };

  const sl = search.toLowerCase();
  const filteredCats = sl
    ? CATEGORIES.map(c => ({ ...c, items: c.items.filter(it => it.label.toLowerCase().includes(sl)) })).filter(c=>c.items.length>0)
    : CATEGORIES;

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', maxWidth: '1400px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Raleway:wght@300;400;500;600;700&display=swap');
          .calc-modal * { box-sizing: border-box; margin: 0; padding: 0; }
          .calc-modal .hdr { font-family: 'Cormorant Garamond', serif; }
          .calc-modal input[type=number]::-webkit-inner-spin-button,
          .calc-modal input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
          .calc-modal input[type=number] { -moz-appearance: textfield; }
          .calc-modal .pb { cursor: pointer; transition: all .2s; }
          .calc-modal .pb:hover { transform: translateY(-1px); }
          .calc-modal .ec { transition: all .3s; }
          .calc-modal .ec:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,.12); }
          .calc-modal .cb { cursor: pointer; user-select: none; transition: background .15s; }
          .calc-modal .cb:hover { filter: brightness(.88); }
          .calc-modal .sh { cursor: pointer; transition: all .15s; }
          .calc-modal .sh:hover { filter: brightness(.97); }
          .calc-modal .fi { animation: fi .35s ease; }
          @keyframes fi { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
          .calc-modal .tg { box-shadow: 0 0 0 3px rgba(13,148,136,.15), 0 8px 24px rgba(13,148,136,.2); }
          .calc-modal .tp { display:inline-block; background:#dbeafe; color:#1d4ed8; font-size:10px; font-weight:700; letter-spacing:.06em; padding:2px 7px; border-radius:6px; text-transform:uppercase; margin-left:6px; }
          .calc-modal .ts { display:inline-block; background:#dcfce7; color:#15803d; font-size:10px; font-weight:700; letter-spacing:.06em; padding:2px 7px; border-radius:6px; text-transform:uppercase; margin-left:6px; }
          .calc-modal input::placeholder { color:#c4c4c4; }
          .calc-modal ::-webkit-scrollbar { width:4px; }
          .calc-modal ::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:2px; }
        `}</style>

        <div className="calc-modal" style={{ fontFamily: "'Raleway', sans-serif" }}>
          <header style={{ background: "linear-gradient(135deg,#0d9488 0%,#0891b2 50%,#be185d 100%)", padding: "22px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: '16px 16px 0 0' }}>
            <div>
              <div className="hdr" style={{ color: "white", fontSize: 28, fontWeight: 300, letterSpacing: ".08em" }}>MAbeautyplus</div>
              <div style={{ color: "rgba(255,255,255,.8)", fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", marginTop: 2 }}>Calculateur d'Échéances</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ background: "rgba(255,255,255,.15)", borderRadius: 12, padding: "7px 14px", color: "rgba(255,255,255,.85)", fontSize: 12 }}>
                {activeTreatments.length > 0 ? `${activeTreatments.length} soin${activeTreatments.length>1?"s":""} sélectionné${activeTreatments.length>1?"s":""}` : "Aucun soin sélectionné"}
              </div>
              <button type="button" onClick={reset} style={{ background: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.4)", color: "white", padding: "8px 18px", borderRadius: 20, fontSize: 13, cursor: "pointer", letterSpacing: ".05em", fontFamily: "inherit" }}>Réinitialiser</button>
              <button type="button" onClick={onClose} style={{ background: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.4)", color: "white", padding: "8px 12px", borderRadius: 20, fontSize: 13, cursor: "pointer", display: 'flex', alignItems: 'center', gap: 6 }}>
                <X size={16} /> Fermer
              </button>
            </div>
          </header>

          <div style={{ maxWidth: 1340, margin: "0 auto", padding: "24px 20px", display: "grid", gridTemplateColumns: "1fr 390px", gap: 24, alignItems: "start" }}>

            <div>
              <div style={{ background: "white", borderRadius: 16, padding: "18px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,.06)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#6b7280", marginBottom: 7 }}>Nom du client</label>
                  <input type="text" value={client} onChange={e=>setClient(e.target.value)} placeholder="Ex : Marie Dupont"
                    style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 13px", fontSize: 14, outline: "none", fontFamily: "inherit" }}
                    onFocus={e=>e.currentTarget.style.borderColor="#0d9488"} onBlur={e=>e.currentTarget.style.borderColor="#e5e7eb"} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#6b7280", marginBottom: 7 }}>Rechercher un soin</label>
                  <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ex : mésojet, adipologie…"
                    style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 13px", fontSize: 14, outline: "none", fontFamily: "inherit" }}
                    onFocus={e=>e.currentTarget.style.borderColor="#0891b2"} onBlur={e=>e.currentTarget.style.borderColor="#e5e7eb"} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 12, color: "#6b7280", alignItems: "center", flexWrap: "wrap" }}>
                <span className="tp">Forfait</span><span>Prix fixe (cure ou séance)</span>
                <span style={{marginLeft:6}}></span>
                <span className="ts">Séances</span><span>Prix unitaire × quantité</span>
              </div>

              {filteredCats.map(cat => {
                const isOpen = openSections[cat.id] || !!search;
                const catTotal = cat.items.reduce((s,it) => s+(Number(inputs[it.key])||0)*it.price, 0);
                return (
                  <div key={cat.id} style={{ background: "white", borderRadius: 16, marginBottom: 11, boxShadow: "0 2px 12px rgba(0,0,0,.06)", overflow: "hidden" }}>
                    <div className="sh" onClick={()=>toggleSection(cat.id)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderLeft: `4px solid ${cat.color}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 15, color: cat.color }}>{cat.icon}</span>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "#1f2937" }}>{cat.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {catTotal > 0 && <span style={{ background: cat.color, color: "white", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12 }}>{fmt(catTotal)}</span>}
                        <span style={{ color: "#9ca3af", fontSize: 15, transform: isOpen?"rotate(180deg)":"rotate(0)", transition: "transform .25s", display: "block" }}>▾</span>
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{ padding: "6px 18px 12px" }} className="fi">
                        {cat.items.map(it => {
                          const qty = Number(inputs[it.key])||0;
                          const isPkg = it.type==="package";
                          return (
                            <div key={it.key} onClick={(e)=>e.stopPropagation()} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f3f4f6" }}>
                              <div style={{ flex: 1, paddingRight: 10 }}>
                                <div style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                                  {it.label}
                                  {isPkg ? <span className="tp">Forfait</span> : <span className="ts">Séances</span>}
                                </div>
                                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>
                                  {isPkg ? `${it.price.toLocaleString("fr-FR")} € / forfait` : `${it.price} € / séance`}
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                                <button className="cb" onClick={(e)=>{e.stopPropagation();set(it.key,qty-1);}}
                                  style={{ background: qty>0?"#f3f4f6":"#fafafa", border: "none", width: 32, height: 32, fontSize: 17, color: qty>0?"#374151":"#d1d5db", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                                <input type="number" min="0" value={qty||""} placeholder="0" onChange={e=>set(it.key,e.target.value)}
                                  onClick={(e)=>e.stopPropagation()}
                                  style={{ width: 42, height: 32, textAlign: "center", border: "none", borderLeft: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", fontSize: 14, fontWeight: 700, color: qty>0?cat.color:"#9ca3af", fontFamily: "inherit", background: "white", outline: "none" }} />
                                <button className="cb" onClick={(e)=>{e.stopPropagation();set(it.key,qty+1);}}
                                  style={{ background: "#f3f4f6", border: "none", width: 32, height: 32, fontSize: 17, color: "#374151", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ position: "sticky", top: 20 }}>
              <div style={{ background: "white", borderRadius: 16, padding: "18px", marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#6b7280", marginBottom: 10 }}>Nombre d'échéances</div>
                <div style={{ display: "flex", gap: 7 }}>
                  {[1,2,3,4,5,6].map(n => (
                    <button key={n} className="pb" onClick={()=>setNbEch(n)}
                      style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: "2px solid", borderColor: nbEch===n?"#0d9488":"#e5e7eb", background: nbEch===n?"#0d9488":"white", color: nbEch===n?"white":"#374151", fontWeight: 700, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
                      {n}×
                    </button>
                  ))}
                </div>
              </div>

              {activeTreatments.length > 0 && (
                <div style={{ background: "white", borderRadius: 16, padding: "16px 18px", marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,.06)", maxHeight: 210, overflowY: "auto" }}>
                  <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#6b7280", marginBottom: 8 }}>Soins sélectionnés</div>
                  {activeTreatments.map((t,i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: i<activeTreatments.length-1?"1px solid #f3f4f6":"none", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 9, color: t.cat.color, flexShrink: 0 }}>{t.cat.icon}</span>
                        <span style={{ fontSize: 12, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.label}</span>
                        <span style={{ fontSize: 11, background: "#f3f4f6", color: "#6b7280", padding: "1px 6px", borderRadius: 6, fontWeight: 700, flexShrink: 0 }}>×{t.qty}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", flexShrink: 0 }}>{fmt(t.qty*t.price)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="tg" style={{ background: "linear-gradient(135deg,#0d9488,#0891b2)", borderRadius: 16, padding: "20px 22px", marginBottom: 14, textAlign: "center" }}>
                <div style={{ fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "rgba(255,255,255,.75)", marginBottom: 6 }}>
                  {client ? `Cure de ${client}` : "Total cure"}
                </div>
                <div className="hdr" style={{ fontSize: 42, fontWeight: 300, color: "white" }}>{fmt(total)}</div>
                {nbEch>1 && total>0 && <div style={{ color: "rgba(255,255,255,.7)", fontSize: 12, marginTop: 4 }}>Réparti sur {nbEch} échéances</div>}
                {total > 0 && onValidate && (
                  <button
                    type="button"
                    onClick={handleValidate}
                    style={{
                      marginTop: 16,
                      width: "100%",
                      background: "white",
                      color: "#0d9488",
                      border: "2px solid white",
                      padding: "12px 24px",
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: "pointer",
                      letterSpacing: ".05em",
                      transition: "all .2s ease",
                      fontFamily: "inherit"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,.9)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    ✓ Valider et remplir le formulaire
                  </button>
                )}
              </div>

              {total > 0 ? (
                <div>
                  <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#6b7280", marginBottom: 8 }}>Montant des échéances</div>
                  {payments.map((amt,i) => {
                    const isFirst = i===0;
                    const pct = total>0 ? amt/total*100 : 0;
                    return (
                      <div key={i} className="ec"
                        style={{ background: isFirst?"linear-gradient(135deg,#fdf4ff,#fce7f3)":"white", border: `2px solid ${isFirst?"#f9a8d4":"#f3f4f6"}`, borderRadius: 14, padding: "14px 18px", marginBottom: 9, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,.05)" }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: isFirst?"#be185d":"#6b7280", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 2 }}>{ordinal[i]} échéance</div>
                          {isFirst && <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>Guide, tenue & compléments inclus</div>}
                          <div style={{ marginTop: 7, height: 3, background: "#f3f4f6", borderRadius: 2, width: 90 }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: isFirst?"#be185d":"#0d9488", borderRadius: 2 }} />
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="hdr" style={{ fontSize: 28, fontWeight: 400, color: isFirst?"#be185d":"#0d9488" }}>{fmt(amt)}</div>
                          <div style={{ fontSize: 11, color: "#9ca3af" }}>{pct.toFixed(0)}%</div>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12, padding: "11px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#15803d", fontWeight: 600 }}>✓ Total vérifié</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#15803d" }}>{fmt(payments.reduce((a,b)=>a+b,0))}</span>
                  </div>
                </div>
              ) : (
                <div style={{ background: "white", borderRadius: 16, padding: "40px 20px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                  <div style={{ fontSize: 36, marginBottom: 10, color: "#e5e7eb" }}>✦</div>
                  <div style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.7 }}>Sélectionnez des soins<br />pour calculer les échéances</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
