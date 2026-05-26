import React from 'react';
import type { ContractData } from '../../services/contractService';

interface ContractPreviewProps {
  data: ContractData;
  id?: string;
  engagements?: boolean[];
  onEngagementToggle?: (index: number) => void;
}

const PAGE_STYLE: React.CSSProperties = {
  padding: '16mm 18mm 16mm 18mm',
  position: 'relative',
  pageBreakAfter: 'always',
  boxSizing: 'border-box',
};

const SECTION: React.CSSProperties = { marginBottom: '10px' };
const TITLE: React.CSSProperties = { fontWeight: 700, margin: '0 0 4px 0', fontSize: '10pt' };
const P: React.CSSProperties = { margin: '0 0 5px 0' };
const UL: React.CSSProperties = { margin: '0 0 5px 16px', padding: 0 };

const PageFooter: React.FC<{ page: number; total: number }> = ({ page, total }) => (
  <div style={{ marginTop: '12px', textAlign: 'center' }}>
    <span style={{ fontSize: '8pt', color: '#aaa' }}>{page}/{total}</span>
  </div>
);

const ContractPreview: React.FC<ContractPreviewProps> = ({ data, id, engagements, onEngagementToggle }) => {
  return (
    <div
      id={id}
      className="contract-preview bg-white text-gray-900"
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '9.5pt',
        lineHeight: '1.45',
        color: '#1a1a1a',
        maxWidth: '210mm',
        margin: '0 auto',
        padding: '0',
      }}
    >
      {/* ── PAGE 1 ── */}
      <div className="contract-page" style={PAGE_STYLE}>
        <h1 style={{ fontSize: '22pt', fontWeight: 400, color: '#b0b0b0', fontFamily: 'Georgia, serif', marginBottom: '14px', marginTop: 0 }}>
          Contrat de Prestation de Services
        </h1>

        <div style={{ marginBottom: '14px', lineHeight: 1.6 }}>
          <p style={{ margin: 0 }}>Entre les soussignés :</p>
          <p style={{ margin: 0 }}>
            MAbeautyplus Centre de Perte de poids, Minceur et Anti-âge, {data.centerAddress}, {data.centerPostalCode} {data.centerCity.toUpperCase()}
          </p>
          <p style={{ margin: 0 }}>Société exploitante : SAS {data.centerSocietyName}</p>
          <p style={{ margin: 0 }}>Siège social : {data.siegeSocialAddress}, {data.siegeSocialPostalCode} LE GRAU-DU-ROI</p>
          <p style={{ margin: 0 }}>Ci-après dénommé "Le Prestataire",</p>
          <p style={{ margin: '6px 0 0 0' }}>Et :</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '3px', fontSize: '9.5pt' }}>
            <tbody>
              <tr>
                <td style={{ paddingRight: '6px', whiteSpace: 'nowrap' }}>Nom/Prénom :</td>
                <td style={{ borderBottom: '1px solid #888', paddingBottom: '1px', fontWeight: 600 }}>{data.clientLastName} {data.clientFirstName}</td>
                <td style={{ paddingLeft: '10px', paddingRight: '6px', whiteSpace: 'nowrap' }}>Téléphone :</td>
                <td style={{ borderBottom: '1px solid #888', paddingBottom: '1px', fontWeight: 600 }}>{data.clientPhone}</td>
                <td style={{ paddingLeft: '10px', paddingRight: '6px', whiteSpace: 'nowrap' }}>Mail :</td>
                <td style={{ borderBottom: '1px solid #888', paddingBottom: '1px', fontWeight: 600 }}>{data.clientEmail}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: '6px', paddingTop: '5px', whiteSpace: 'nowrap' }}>Adresse :</td>
                <td style={{ borderBottom: '1px solid #888', paddingBottom: '1px', paddingTop: '5px', fontWeight: 600 }}>{data.clientAddress}</td>
                <td style={{ paddingLeft: '10px', paddingRight: '6px', paddingTop: '5px', whiteSpace: 'nowrap' }}>Code postal :</td>
                <td style={{ borderBottom: '1px solid #888', paddingBottom: '1px', paddingTop: '5px', fontWeight: 600 }}>{data.clientPostalCode}</td>
                <td style={{ paddingLeft: '10px', paddingRight: '6px', paddingTop: '5px', whiteSpace: 'nowrap' }}>Ville :</td>
                <td style={{ borderBottom: '1px solid #888', paddingBottom: '1px', paddingTop: '5px', fontWeight: 600 }}>{data.clientCity}</td>
              </tr>
            </tbody>
          </table>
          <p style={{ margin: '5px 0 0 0' }}>Ci-après dénommé "Le Client",</p>
        </div>

        {/* Article 1 */}
        <div style={SECTION}>
          <p style={TITLE}>Article 1 - Objet du contrat</p>
          <p style={P}>Le présent contrat porte sur une cure comprenant la/les prestation(s) suivantes :</p>
          {data.careItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '13px', height: '13px', border: '1.5px solid #555', marginRight: '7px', flexShrink: 0, backgroundColor: item.checked ? '#1a1a1a' : 'transparent' }}>
                {item.checked && <span style={{ color: 'white', fontSize: '9px', fontWeight: 700, lineHeight: 1 }}>✓</span>}
              </span>
              <span>Nombre de séances <strong>{item.checked ? item.sessions : '...........'}</strong> : {item.label}</span>
            </div>
          ))}
          <p style={{ margin: '5px 0 0 0' }}>Les modalités précises de la cure (fréquence, organisation, durée estimée) sont définies lors du bilan préalable.</p>
        </div>

        {/* Article 2 */}
        <div style={SECTION}>
          <p style={TITLE}>Article 2 – Nature de l'obligation</p>
          <p style={{ margin: 0 }}>
            Le Prestataire est tenu à une obligation de moyens. Il s'engage à mettre en œuvre l'ensemble des moyens nécessaires (techniques, humains et matériels) pour accompagner le Client dans son objectif. Le Client est informé que les résultats peuvent varier selon plusieurs facteurs personnels, notamment : hygiène de vie, alimentation, régularité, état de santé, métabolisme. Aucune garantie de résultat ne peut être apportée.
          </p>
        </div>

        {/* Article 3 */}
        <div style={SECTION}>
          <p style={TITLE}>Article 3 – Durée et validité</p>
          <p style={{ margin: 0 }}>
            Le présent contrat prend effet à compter de sa signature. Les séances sont valables pendant une durée de 12 mois à compter de la première séance, sauf accord exceptionnel écrit entre les parties. Au-delà de ce délai, les séances non réalisées pourront être considérées comme expirées. Ce délai est justifié par la nature de la prestation et l'organisation du planning du Prestataire. Toute demande de prolongation pour motif légitime pourra être étudiée au cas par cas.
          </p>
        </div>

        {/* Article 4 */}
        <div style={SECTION}>
          <p style={TITLE}>Article 4 – Conditions financières</p>
          <p style={P}>Le montant total de la cure est dû à la signature du présent contrat et au plus tard à la première séance.</p>
          <p style={P}>
            Ce montant correspond à un forfait global incluant notamment : la réservation des créneaux, l'organisation du planning, la mobilisation des équipes, ainsi que l'accompagnement personnalisé du Client. Cet accompagnement comprend également : les conseils individualisés, les recommandations en hygiène de vie, les supports et documents remis, ainsi que l'accès au savoir-faire et aux méthodes propres au Prestataire. Ces éléments, délivrés dès le démarrage de la cure, constituent une part essentielle de la prestation.
          </p>
          <p style={{ margin: 0 }}>
            Conformément à l'article L221-18 du Code de la consommation, lorsque le contrat est soumis au droit de rétractation, le Client dispose d'un délai légal de 14 jours à compter de la signature du contrat. Le Client est informé que la première séance pourra être programmée avant l'expiration de ce délai. En confirmant ce rendez-vous, le Client reconnaît expressément demander l'exécution anticipée de la prestation. Il est également informé qu'en cas d'exercice de son droit de rétractation après réalisation d'une première séance, le montant correspondant aux prestations réalisées restera dû. Passé ce délais, le Client reconnaît être engagé sur l'ensemble du forfait souscrit.
          </p>
        </div>

        {/* Article 5 */}
        <div style={{ marginBottom: '8px' }}>
          <p style={TITLE}>Article 5 – Modalités de paiement</p>
          <p style={P}>Moyens acceptés : chèques, espèces, carte bancaire, paiement fractionné via organisme partenaire (sous réserve d'acceptation).</p>
          <p style={P}>
            L'éventuel acompte versé lors de la signature du présent contrat correspond à la réservation anticipée du ou des créneaux de séance programmés pour le Client, ainsi qu'au temps consacré à l'organisation administrative du dossier, à la planification du programme personnalisé et à la mobilisation des ressources nécessaires à l'exécution de la prestation. Ces créneaux étant réservés spécifiquement pour le Client et rendus indisponibles pour d'autres réservations, l'acompte sera déduit du montant total du forfait.
          </p>
          <p style={{ margin: 0 }}>
            En cas d'annulation imputable au Client après expiration du délai légal de rétractation, l'acompte restera acquis au Prestataire au titre des frais de réservation, d'organisation et de planification engagés.
          </p>
        </div>

        <PageFooter page={1} total={3} />
      </div>

      {/* PAGE BREAK */}
      <div style={{ borderTop: '2px dashed #ddd', margin: '0' }} />

      {/* ── PAGE 2 ── */}
      <div className="contract-page" style={PAGE_STYLE}>
        {/* Suite Art.5 */}
        <div style={SECTION}>
          <p style={P}>
            Le Client reconnaît que le présent contrat correspond à un forfait global incluant notamment l'organisation du programme, la réservation des créneaux, l'accompagnement personnalisé, les conseils et le savoir-faire du Prestataire. Les éventuelles échéances mises en place constituent uniquement une facilité de paiement accordée par le Prestataire et ne remettent pas en cause l'engagement du Client sur l'ensemble du forfait souscrit.
          </p>
          <p style={P}>
            En cas de règlement en plusieurs échéances directement auprès du Prestataire, les modalités de paiement acceptées sont déterminées au moment de la signature du présent contrat. Le Prestataire se réserve le droit de refuser certains moyens de paiement pour les règlements fractionnés.
          </p>
          <p style={P}>Les échéances deviennent dues selon les modalités convenues entre les parties.</p>
          <p style={{ margin: '0 0 2px 0' }}>En cas :</p>
          <ul style={UL}>
            <li>d'impayé,</li>
            <li>de rejet bancaire,</li>
            <li>d'opposition abusive,</li>
            <li>ou d'incident de paiement,</li>
          </ul>
          <p style={{ margin: '0 0 2px 0' }}>le Prestataire pourra :</p>
          <ul style={UL}>
            <li>suspendre immédiatement les prestations en cours,</li>
            <li>exiger le règlement immédiat des sommes restant dues,</li>
            <li>engager toute démarche utile de recouvrement.</li>
          </ul>
          <p style={{ margin: 0 }}>Les éventuels frais bancaires liés à un incident de paiement pourront être répercutés au Client.</p>
        </div>

        {/* Payment schedule */}
        <div style={{ marginBottom: '12px', border: '1px solid #ccc', padding: '10px', borderRadius: '3px', backgroundColor: '#fafafa' }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: 700, fontSize: '9.5pt' }}>
            Montant total TTC : {data.totalAmount} &nbsp;&nbsp;
            Règlement établi en {data.installmentCount} échéance{data.installmentCount > 1 ? 's' : ''} :
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
            <tbody>
              {data.deposit && (
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '3px 6px 3px 0', fontWeight: 600, whiteSpace: 'nowrap' }}>Acompte :</td>
                  <td style={{ padding: '3px 6px', fontWeight: 600, color: '#1a6b9a' }}>{data.deposit.amount}</td>
                  <td style={{ padding: '3px 6px', whiteSpace: 'nowrap' }}>le {data.deposit.date}</td>
                  <td style={{ padding: '3px 0', whiteSpace: 'nowrap' }}>Par : {data.deposit.method}</td>
                </tr>
              )}
              {data.installments.map((inst, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '3px 6px 3px 0', whiteSpace: 'nowrap' }}>Échéance {i + 1} :</td>
                  <td style={{ padding: '3px 6px', fontWeight: 600, color: '#1a6b9a' }}>{inst.amount}</td>
                  <td style={{ padding: '3px 6px', whiteSpace: 'nowrap' }}>le {inst.date}</td>
                  <td style={{ padding: '3px 0', whiteSpace: 'nowrap' }}>Par : {inst.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Article 6 */}
        <div style={SECTION}>
          <p style={TITLE}>Article 6 – Paiement fractionné via un organisme partenaire</p>
          <p style={P}>En cas de paiement fractionné via un organisme de paiement partenaire :</p>
          <ul style={UL}>
            <li>Le Prestataire est considéré comme payé intégralement à la validation du financement.</li>
            <li>La relation financière est gérée directement entre le Client et l'organisme de financement.</li>
            <li>Toute difficulté de paiement doit être traitée avec cet organisme.</li>
          </ul>
          <p style={{ margin: 0 }}>La résiliation du présent contrat n'entraîne pas automatiquement celle du contrat de financement souscrit auprès de l'organisme partenaire.</p>
        </div>

        {/* Article 7 */}
        <div style={SECTION}>
          <p style={TITLE}>Article 7 – Réservation & annulation</p>
          <p style={{ margin: 0 }}>
            Toute séance doit être préalablement réservée. L'annulation d'une séance doit être communiquée au moins 24 heures à l'avance. À défaut d'annulation dans les délais ou en cas de non-présentation, la séance sera décomptée du forfait et considérée comme due, sauf cas de force majeure dûment justifié (article 1218 du Code civil).
          </p>
        </div>

        {/* Article 8 */}
        <div style={SECTION}>
          <p style={TITLE}>Article 8 – Engagement et adhésion</p>
          <p style={{ margin: 0 }}>La signature du présent contrat vaut engagement du Client pour le forfait de cure, constitué comme un ensemble global incluant l'organisation, la planification et l'accompagnement personnalisé.</p>
        </div>

        {/* Article 9 */}
        <div style={{ marginBottom: '8px' }}>
          <p style={TITLE}>Article 9 – Obligations du client :</p>
          <p style={P}>Le Client s'engage à :</p>
          <ul style={UL}>
            <li>respecter les horaires de rendez-vous. Un retard supérieur à 10 minutes pourra entraîner la reprogrammation de la séance.</li>
            <li>suivre les recommandations transmises,</li>
            <li>informer de tout changement d'état de santé,</li>
            <li>adopter un comportement respectueux.</li>
          </ul>
          <p style={{ margin: 0 }}>
            Tout comportement jugé inapproprié ou contraire aux présentes clauses peut entraîner une suspension immédiate des prestations. Les prestations déjà réalisées ainsi que les sommes encaissées restent acquises au titre des prestations engagées.
          </p>
        </div>

        <PageFooter page={2} total={3} />
      </div>

      {/* PAGE BREAK */}
      <div style={{ borderTop: '2px dashed #ddd', margin: '0' }} />

      {/* ── PAGE 3 ── */}
      <div className="contract-page" style={PAGE_STYLE}>
        {/* Article 10 */}
        <div style={SECTION}>
          <p style={TITLE}>Article 10 – Responsabilité</p>
          <p style={P}>Le Prestataire ne pourra être tenu responsable en cas :</p>
          <ul style={UL}>
            <li>de non-respect des recommandations par le Client,</li>
            <li>d'omission d'informations relatives à son état de santé,</li>
            <li>ou de résultats ne correspondant pas aux attentes du Client.</li>
          </ul>
          <p style={{ margin: 0 }}>Le Client reconnaît avoir été informé de la nature non médicale des prestations proposées.</p>
        </div>

        {/* Article 11 */}
        <div style={SECTION}>
          <p style={TITLE}>Article 11 – Résiliation anticipée</p>
          <p style={P}>Le contrat engage le Client sur l'ensemble du forfait, dans le cadre d'une démarche volontaire et sérieuse. Le Client reconnaît que la réussite du programme repose sur son implication et sa régularité.</p>
          <p style={P}>Toute demande de résiliation anticipée pour convenance personnelle pourra faire l'objet d'un refus ou entraîner l'application des conditions financières prévues au présent contrat, sauf appréciation exceptionnelle du Prestataire.</p>
          <p style={P}>Une résiliation anticipée pourra être étudiée uniquement en cas de motif légitime dûment justifié. En cas de résiliation anticipée sans motif légitime, le Client reste redevable des prestations réalisées ainsi que d'une indemnité correspondant aux frais engagés et à l'organisation du programme, dans une limite proportionnée au préjudice subi par le Prestataire.</p>
          <p style={{ margin: '0 0 2px 0' }}>En cas de résiliation :</p>
          <ul style={UL}>
            <li>les prestations réalisées et les éléments d'accompagnement délivrés restent dus</li>
            <li>les sommes déjà encaissées correspondent aux prestations réalisées, aux éléments d'accompagnement déjà délivrés ainsi qu'aux frais engagés dans le cadre de l'exécution du contrat</li>
            <li>les échéances non encore encaissées pourront être suspendues à compter de la date de résiliation</li>
          </ul>
          <p style={{ margin: 0 }}>Le Prestataire se réserve le droit de résilier le contrat en cas de non-respect des engagements ou de non-paiement.</p>
        </div>

        {/* Article 12 */}
        <div style={SECTION}>
          <p style={TITLE}>Article 12 – Protection des données</p>
          <p style={{ margin: 0 }}>
            Conformément au Règlement Général sur la Protection des Données (RGPD), les données personnelles sont utilisées exclusivement pour le suivi de la cure et ne sont en aucun cas cédées à des tiers. Le client peut exercer ses droits (accès, rectification, suppression) à tout moment par demande écrite à la direction.
          </p>
        </div>

        {/* Article 13 */}
        <div style={{ marginBottom: '14px' }}>
          <p style={TITLE}>Article 13 – Médiation et litiges</p>
          <p style={P}>En cas de litige, une solution amiable sera recherchée en priorité.</p>
          <p style={{ margin: 0 }}>
            Conformément aux articles L.612-1 et suivants du Code de la consommation, le Client est informé qu'il pourra recourir gratuitement à un médiateur de la consommation, dont les coordonnées seront communiquées dès l'adhésion du Prestataire à un dispositif de médiation.
          </p>
        </div>

        {/* Checkboxes */}
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            'Le Client reconnaît avoir pris connaissance du présent contrat et des modalités financières du forfait souscrit.',
            "Le Client reconnaît avoir reçu toutes les informations nécessaires avant la signature du présent contrat et avoir pu poser l'ensemble de ses questions.",
            'Le Client reconnaît avoir été informé de mon droit légal de rétractation de 14 jours conformément aux articles L221-18 et suivants du Code de la consommation.',
            'Le Client reconnaît avoir pris connaissance et accepté les Conditions Générales de Vente remises préalablement à la signature du présent contrat.',
          ].map((text, i) => {
            const checked = engagements?.[i] ?? false;
            return (
              <div
                key={i}
                onClick={() => onEngagementToggle?.(i)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: onEngagementToggle ? 'pointer' : 'default' }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '13px', height: '13px', border: '1.5px solid #555', marginTop: '2px',
                  flexShrink: 0, backgroundColor: checked ? '#1a1a1a' : '#fff',
                }}>
                  {checked && <span style={{ color: 'white', fontSize: '9px', fontWeight: 700, lineHeight: 1 }}>✓</span>}
                </span>
                <span>{text}</span>
              </div>
            );
          })}
        </div>

        {/* Signature zone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <p style={{ margin: '0 0 4px 0', fontStyle: 'italic' }}>Fait en deux exemplaires</p>
            <p style={{ margin: '0 0 4px 0', fontStyle: 'italic' }}>A : <strong>{data.signatureCity}</strong></p>
            <p style={{ margin: 0, fontStyle: 'italic' }}>le : <strong>{data.signatureDate}</strong></p>
          </div>
          <div>
            <p style={{ fontWeight: 700, margin: '0 0 3px 0' }}>CENTRE MAbeautyplus</p>
            <p style={{ margin: '0 0 2px 0' }}>Centre : MAbeautyplus {data.centerName}</p>
            <p style={{ margin: '0 0 2px 0' }}>Société exploitante : SAS {data.centerSocietyName}</p>
            <p style={{ margin: '0 0 2px 0' }}>SIREN : {data.centerSiren}</p>
            <p style={{ margin: '0 0 2px 0' }}>Adresse : {data.siegeSocialAddress}</p>
            <p style={{ margin: '0 0 2px 0' }}>Téléphone : {data.centerPhone}</p>
            <p style={{ margin: '0 0 2px 0' }}>Email : {data.centerEmail}</p>
          </div>
          <div>
            <p style={{ fontStyle: 'italic', margin: '0 0 6px 0' }}>Signature du Client, "Lu et approuvé"</p>
            <div
              id="signature-zone"
              style={{
                width: '100%',
                height: '80px',
                border: '1.5px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#fafafa',
              }}
            />
          </div>
        </div>

        <PageFooter page={3} total={3} />
      </div>
    </div>
  );
};

export default ContractPreview;
