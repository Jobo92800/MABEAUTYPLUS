import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';

const UP = Math.ceil;
const DOWN = Math.floor;

function distribute(qty: number, n: number, type: string): number[] {
  if (qty <= 0) return Array(n).fill(0);
  switch (n) {
    case 1: return [qty];
    case 2: return [UP(qty / 2), DOWN(qty / 2)];
    case 3:
      if (["129", "259", "dome"].includes(type)) {
        const t = UP(qty / 3), u = DOWN(qty / 3);
        return [t, u, qty - t - u];
      }
      const u3 = UP(qty / 3), v3 = DOWN(qty / 3);
      return [qty - u3 - v3, u3, v3];
    case 4: {
      const t = UP(qty / 4), u = DOWN(qty / 4), v = DOWN(qty / 4), w = qty - t - u - v;
      return type === "dome" ? [t, u, v, w] : [t, w, v, u];
    }
    case 5: {
      const u = UP(qty / 5), v = DOWN(qty / 5), w = DOWN(qty / 5), x = UP(qty / 5);
      const t = qty - u - v - w - x;
      return type === "dome" ? [t, u, v, w, x] : [x, u, v, w, t];
    }
    case 6: {
      if (type === "49") {
        const u = UP(qty / 6), v = UP(qty / 6), w = DOWN(qty / 6), x = DOWN(qty / 6), y = DOWN(qty / 6);
        return [qty - u - v - w - x - y, u, v, w, x, y];
      }
      if (["149", "195", "129", "259", "dome"].includes(type)) {
        const u = UP(qty / 6), v = UP(qty / 6), w = UP(qty / 6), x = DOWN(qty / 6), y = DOWN(qty / 6);
        return [qty - u - v - w - x - y, u, v, w, x, y];
      }
      if (type === "65") {
        const u = UP(qty / 6), v = DOWN(qty / 6), w = DOWN(qty / 6), x = DOWN(qty / 6), y = UP(qty / 6);
        return [qty - u - v - w - x - y, u, v, w, x, y];
      }
      const u = UP(qty / 6), v = DOWN(qty / 6), w = DOWN(qty / 6), x = DOWN(qty / 6), y = DOWN(qty / 6);
      return [qty - u - v - w - x - y, u, v, w, x, y];
    }
    default: return [qty];
  }
}

function computeTotal(inputs: Record<string, number>): number {
  const v = (k: string) => Number(inputs[k]) || 0;
  return v("B4")*49 + v("B5")*49 + v("B10")*60 + v("B11")*99 + v("B12")*110
    + v("B15")*49 + v("B18")*149 + v("B30")*99 + v("B31")*149 + v("B32")*195
    + v("B33")*65 + v("B34")*129 + v("B35")*195 + v("B36")*259 + v("B21")*85
    + v("B22")*85 + v("B23")*75 + v("B24")*75 + v("B25")*75 + v("B26")*85
    + v("B27")*55 + v("B6")*19 + v("B7")*60 + v("B42")*37 + v("B43")*37
    + v("B44")*37 + v("B45")*37 + v("B38")*39;
}

function computeInstallments(inputs: Record<string, number>, N: number): number[] {
  const v = (k: string) => Number(inputs[k]) || 0;
  const total = computeTotal(inputs);
  if (total === 0) return Array(N).fill(0);
  if (N === 1) return [total];

  const D6 = v("B6") * 19, D7 = v("B7") * 60;
  const D38 = v("B38") * 39;
  const R132 = (v("B42") + v("B43") + v("B44") + v("B45")) * 37;
  const fixed = D6 + D7 + R132;

  const q49  = v("B4") + v("B5") + v("B15");
  const q60  = v("B10");
  const q99  = v("B11") + v("B30");
  const q110 = v("B12") + v("B42");
  const q149 = v("B18") + v("B31");
  const q85  = v("B21") + v("B22") + v("B26");
  const q75  = v("B23") + v("B24") + v("B25");
  const q55  = v("B27");
  const q195 = v("B32") + v("B35");
  const q65  = v("B33");
  const q129 = v("B34");
  const q259 = v("B36");

  const payments = Array(N).fill(0);
  const cats: [number, number, string][] = [
    [49, q49, "49"], [49, q60, "60"], [99, q99, "99"], [110, q110, "110"],
    [149, q149, "149"], [85, q85, "85"], [75, q75, "75"], [55, q55, "55"],
    [195, q195, "195"], [65, q65, "65"], [129, q129, "129"], [259, q259, "259"],
  ];
  cats.forEach(([price, qty, type]) => {
    distribute(qty, N, type).forEach((s, i) => { payments[i] += price * s; });
  });
  distribute(D38, N, "dome").forEach((amt, i) => { payments[i] += amt; });
  payments[0] += fixed;
  return payments;
}

const CATEGORIES = [
  {
    id: "corpo",
    name: "Advance Beauty — Corps & Minceur",
    icon: "✦",
    color: "#0d9488",
    items: [
      { key: "B4",  label: "Luxothérapie",             price: 49  },
      { key: "B5",  label: "I-shape",                  price: 49  },
      { key: "B15", label: "Bottes Presso-Dynamie",    price: 49  },
      { key: "B10", label: "Cavitation seule",         price: 60  },
      { key: "B11", label: "RF + Cavitation",          price: 99  },
      { key: "B12", label: "Plaques + RF + Cavitation",price: 110 },
    ],
  },
  {
    id: "lift",
    name: "Advance Lift — Visage",
    icon: "◈",
    color: "#be185d",
    items: [
      { key: "B21", label: "Magic Lift",               price: 85  },
      { key: "B22", label: "Firming",                  price: 85  },
      { key: "B23", label: "Contour des yeux",         price: 75  },
      { key: "B24", label: "Contour des lèvres",       price: 75  },
      { key: "B25", label: "Décolleté",                price: 75  },
      { key: "B26", label: "Acno-Lyse",                price: 85  },
    ],
  },
  {
    id: "adipo",
    name: "Adipologie",
    icon: "◉",
    color: "#7c3aed",
    items: [
      { key: "B18", label: "Adipologie",               price: 149 },
    ],
  },
  {
    id: "flash",
    name: "Soins Flash",
    icon: "⚡",
    color: "#d97706",
    items: [
      { key: "B27", label: "Soins Flash",              price: 55  },
    ],
  },
  {
    id: "meso",
    name: "Mésojet",
    icon: "◎",
    color: "#0891b2",
    items: [
      { key: "B30", label: "CORPS Ventre — RF",             price: 99  },
      { key: "B31", label: "JET Visage seul",               price: 149 },
      { key: "B32", label: "JET Visage + Décolleté",        price: 195 },
      { key: "B33", label: "RF seule Visage",               price: 65  },
      { key: "B34", label: "RF seule Visage + Décolleté",   price: 129 },
      { key: "B35", label: "COMBO Visage",                  price: 195 },
      { key: "B36", label: "COMBO Visage + Décolleté",      price: 259 },
    ],
  },
  {
    id: "dome",
    name: "Dôme",
    icon: "⬡",
    color: "#059669",
    items: [
      { key: "B38", label: "Dôme (nombre de séances)",      price: 39  },
    ],
  },
  {
    id: "compl",
    name: "Compléments alimentaires",
    icon: "◆",
    color: "#ea580c",
    items: [
      { key: "B42", label: "BURN — Le Minceur",   price: 37 },
      { key: "B43", label: "SOSO — Le Sauveur",   price: 37 },
      { key: "B44", label: "SKIN — Le Lifteur",   price: 37 },
      { key: "B45", label: "DÉTOX — Le Draineur", price: 37 },
    ],
  },
  {
    id: "extras",
    name: "Accessoires & Services",
    icon: "◇",
    color: "#6366f1",
    items: [
      { key: "B6", label: "Guide rééquilibrage alimentaire", price: 19 },
      { key: "B7", label: "Tenue I-shape",                  price: 60 },
    ],
  },
];

const ordinal = ["1ère", "2ème", "3ème", "4ème", "5ème", "6ème"];
const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " €";

interface InstallmentsCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
}

export const InstallmentsCalculator: React.FC<InstallmentsCalculatorProps> = ({ isOpen, onClose, clientName = "" }) => {
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [nbEch, setNbEch] = useState(3);
  const [client, setClient] = useState(clientName);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ corpo: true });

  const set = (key: string, val: string | number) => {
    const num = Math.max(0, parseInt(String(val)) || 0);
    setInputs(prev => ({ ...prev, [key]: num }));
  };

  const total = useMemo(() => computeTotal(inputs), [inputs]);
  const payments = useMemo(() => computeInstallments(inputs, nbEch), [inputs, nbEch]);

  const toggleSection = (id: string) =>
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  const reset = () => { setInputs({}); setClient(""); };

  const activeTreatments = CATEGORIES.flatMap(c =>
    c.items.filter(it => (Number(inputs[it.key]) || 0) > 0).map(it => ({
      label: it.label, qty: inputs[it.key], price: it.price, cat: c
    }))
  );

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', maxWidth: '1400px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Raleway:wght@300;400;500;600;700&display=swap');
          .calc-modal * { box-sizing: border-box; margin: 0; padding: 0; }
          .calc-modal .hdr-title { font-family: 'Cormorant Garamond', serif; }
          .calc-modal input[type=number]::-webkit-inner-spin-button,
          .calc-modal input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
          .calc-modal input[type=number] { -moz-appearance: textfield; }
          .calc-modal .pill-btn { cursor: pointer; transition: all .2s ease; }
          .calc-modal .pill-btn:hover { transform: translateY(-1px); }
          .calc-modal .ech-card { transition: all .3s ease; }
          .calc-modal .ech-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,.12); }
          .calc-modal .counter-btn { cursor: pointer; user-select: none; transition: background .15s; }
          .calc-modal .counter-btn:hover { filter: brightness(.9); }
          .calc-modal .section-header { cursor: pointer; transition: background .15s; }
          .calc-modal .section-header:hover { filter: brightness(.97); }
          .calc-modal .fade-in { animation: fadeIn .4s ease; }
          @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
          .calc-modal .total-glow { box-shadow: 0 0 0 3px rgba(13,148,136,.15), 0 8px 24px rgba(13,148,136,.2); }
        `}</style>

        <div className="calc-modal" style={{ fontFamily: "'Raleway', sans-serif" }}>
          <header style={{ background: "linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #be185d 100%)", padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: '16px 16px 0 0' }}>
            <div>
              <div className="hdr-title" style={{ color: "white", fontSize: 28, fontWeight: 300, letterSpacing: "0.08em" }}>
                MAbeautyplus
              </div>
              <div style={{ color: "rgba(255,255,255,.8)", fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>
                Calculateur d'Échéances
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={reset} style={{ background: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.4)", color: "white", padding: "8px 18px", borderRadius: 20, fontSize: 13, cursor: "pointer", letterSpacing: ".05em" }}>
                Réinitialiser
              </button>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.4)", color: "white", padding: "8px 12px", borderRadius: 20, fontSize: 13, cursor: "pointer", display: 'flex', alignItems: 'center', gap: 6 }}>
                <X size={16} /> Fermer
              </button>
            </div>
          </header>

          <div style={{ padding: "24px 20px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

            <div>
              <div style={{ background: "white", borderRadius: 16, padding: "20px 24px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                <label style={{ display: "block", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "#6b7280", marginBottom: 8 }}>
                  Nom du client (optionnel)
                </label>
                <input
                  type="text"
                  value={client}
                  onChange={e => setClient(e.target.value)}
                  placeholder="Ex : Marie Dupont"
                  style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", fontSize: 15, outline: "none", fontFamily: "inherit", transition: "border .2s" }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#0d9488"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#e5e7eb"}
                />
              </div>

              {CATEGORIES.map(cat => {
                const isOpenCat = openSections[cat.id];
                const catTotal = cat.items.reduce((s, it) => s + (Number(inputs[it.key]) || 0) * it.price, 0);
                return (
                  <div key={cat.id} style={{ background: "white", borderRadius: 16, marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,.06)", overflow: "hidden" }}>
                    <div
                      className="section-header"
                      onClick={() => toggleSection(cat.id)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "white", borderLeft: `4px solid ${cat.color}` }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 18, color: cat.color }}>{cat.icon}</span>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#1f2937", letterSpacing: ".02em" }}>{cat.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {catTotal > 0 && (
                          <span style={{ background: cat.color, color: "white", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 12 }}>
                            {fmt(catTotal)}
                          </span>
                        )}
                        <span style={{ color: "#9ca3af", fontSize: 18, transform: isOpenCat ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .25s", display: "block" }}>▾</span>
                      </div>
                    </div>

                    {isOpenCat && (
                      <div style={{ padding: "8px 20px 16px" }} className="fade-in">
                        {cat.items.map(it => {
                          const qty = Number(inputs[it.key]) || 0;
                          return (
                            <div key={it.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                              <div>
                                <div style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{it.label}</div>
                                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{it.price} € / séance</div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                                <button
                                  className="counter-btn"
                                  onClick={() => set(it.key, qty - 1)}
                                  style={{ background: qty > 0 ? "#f3f4f6" : "#fafafa", border: "none", width: 36, height: 36, fontSize: 18, color: qty > 0 ? "#374151" : "#d1d5db", display: "flex", alignItems: "center", justifyContent: "center" }}
                                >−</button>
                                <input
                                  type="number"
                                  min="0"
                                  value={qty || ""}
                                  placeholder="0"
                                  onChange={e => set(it.key, e.target.value)}
                                  style={{ width: 52, height: 36, textAlign: "center", border: "none", borderLeft: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", fontSize: 15, fontWeight: 600, color: qty > 0 ? cat.color : "#9ca3af", fontFamily: "inherit", background: "white", outline: "none" }}
                                />
                                <button
                                  className="counter-btn"
                                  onClick={() => set(it.key, qty + 1)}
                                  style={{ background: "#f3f4f6", border: "none", width: 36, height: 36, fontSize: 18, color: "#374151", display: "flex", alignItems: "center", justifyContent: "center" }}
                                >+</button>
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
              <div style={{ background: "white", borderRadius: 16, padding: "20px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "#6b7280", marginBottom: 12 }}>
                  Nombre d'échéances
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <button
                      key={n}
                      className="pill-btn"
                      onClick={() => setNbEch(n)}
                      style={{
                        flex: 1, minWidth: 44, padding: "10px 4px", borderRadius: 10, border: "2px solid",
                        borderColor: nbEch === n ? "#0d9488" : "#e5e7eb",
                        background: nbEch === n ? "#0d9488" : "white",
                        color: nbEch === n ? "white" : "#374151",
                        fontWeight: 700, fontSize: 16, fontFamily: "inherit",
                      }}
                    >
                      {n}×
                    </button>
                  ))}
                </div>
              </div>

              {activeTreatments.length > 0 && (
                <div style={{ background: "white", borderRadius: 16, padding: "18px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                  <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "#6b7280", marginBottom: 10 }}>
                    Soins sélectionnés
                  </div>
                  {activeTreatments.map((t, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: i < activeTreatments.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, color: t.cat.color }}>{t.cat.icon}</span>
                        <span style={{ fontSize: 13, color: "#374151" }}>{t.label}</span>
                        <span style={{ fontSize: 12, background: "#f3f4f6", color: "#6b7280", padding: "1px 7px", borderRadius: 8, fontWeight: 600 }}>×{t.qty}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{fmt(t.qty * t.price)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="total-glow" style={{ background: "linear-gradient(135deg, #0d9488, #0891b2)", borderRadius: 16, padding: "20px 24px", marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "rgba(255,255,255,.75)", marginBottom: 6 }}>
                  {client ? `Cure de ${client}` : "Total cure"}
                </div>
                <div className="hdr-title" style={{ fontSize: 38, fontWeight: 300, color: "white", letterSpacing: "-.01em" }}>
                  {fmt(total)}
                </div>
                {nbEch > 1 && total > 0 && (
                  <div style={{ color: "rgba(255,255,255,.7)", fontSize: 13, marginTop: 6 }}>
                    Réparti sur {nbEch} échéances
                  </div>
                )}
              </div>

              {total > 0 ? (
                <div>
                  <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "#6b7280", marginBottom: 10 }}>
                    Montant des échéances
                  </div>
                  {payments.map((amt, i) => {
                    const isFirst = i === 0;
                    const pct = total > 0 ? (amt / total * 100) : 0;
                    return (
                      <div
                        key={i}
                        className="ech-card"
                        style={{
                          background: isFirst ? "linear-gradient(135deg, #fdf4ff, #fce7f3)" : "white",
                          border: isFirst ? "2px solid #f9a8d4" : "2px solid #f3f4f6",
                          borderRadius: 14, padding: "16px 20px", marginBottom: 10,
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          boxShadow: "0 2px 8px rgba(0,0,0,.05)"
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: isFirst ? "#be185d" : "#6b7280", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 2 }}>
                            {ordinal[i]} échéance
                          </div>
                          {isFirst && (
                            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                              Inclus : services & compléments
                            </div>
                          )}
                          <div style={{ marginTop: 6, height: 4, background: "#f3f4f6", borderRadius: 2, width: 100 }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: isFirst ? "#be185d" : "#0d9488", borderRadius: 2 }} />
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="hdr-title" style={{ fontSize: 26, fontWeight: 400, color: isFirst ? "#be185d" : "#0d9488" }}>
                            {fmt(amt)}
                          </div>
                          <div style={{ fontSize: 11, color: "#9ca3af" }}>{pct.toFixed(0)} %</div>
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12, padding: "12px 16px", marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#15803d", fontWeight: 500 }}>✓ Total vérifié</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#15803d" }}>
                      {fmt(payments.reduce((a, b) => a + b, 0))}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ background: "white", borderRadius: 16, padding: "40px 20px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✦</div>
                  <div style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.6 }}>
                    Sélectionnez des soins<br />pour calculer les échéances
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
