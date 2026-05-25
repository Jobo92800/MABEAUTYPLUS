import React from 'react';

const pageStyle: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '10pt',
  lineHeight: '1.5',
  color: '#1a1a1a',
  maxWidth: '210mm',
  margin: '0 auto',
  padding: '0',
};

const innerPageStyle: React.CSSProperties = {
  padding: '18mm 18mm 14mm 18mm',
  minHeight: '200mm',
  position: 'relative',
};

const titleStyle: React.CSSProperties = {
  fontSize: '24pt',
  fontWeight: 400,
  color: '#b0b0b0',
  fontFamily: 'Georgia, serif',
  marginBottom: '16px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: '10pt',
  margin: '12px 0 4px 0',
};

const paraStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  textAlign: 'justify',
};

const listStyle: React.CSSProperties = {
  margin: '0 0 8px 16px',
  paddingLeft: '4px',
};

const liStyle: React.CSSProperties = {
  margin: '0 0 3px 0',
};

interface HeaderProps {
  title: string;
  clientName: string;
  date: string;
}

const ConsentHeader: React.FC<HeaderProps> = ({ title, clientName, date }) => (
  <>
    <h1 style={titleStyle}>{title}</h1>
    <div style={{ marginBottom: '16px', lineHeight: 1.7 }}>
      <p style={{ margin: 0 }}>Consentement entre l'institut : <strong>MAbeautyplus</strong></p>
      <p style={{ margin: 0 }}><strong>Date :</strong> {date}</p>
      <p style={{ margin: 0 }}>Et le/la client(e) :</p>
      <p style={{ margin: 0 }}>Je soussigné(e) : <strong>{clientName}</strong></p>
    </div>
  </>
);

interface PhotoAuthProps {
  items: string[];
  checked: boolean[];
  onToggle: (index: number) => void;
}

const PhotoAuth: React.FC<PhotoAuthProps> = ({ items, checked, onToggle }) => (
  <div style={{ margin: '12px 0 8px 0' }}>
    <p style={{ ...sectionTitleStyle, margin: '0 0 6px 0' }}>Droit à l'image :</p>
    {items.map((item, i) => (
      <div
        key={i}
        onClick={() => onToggle(i)}
        style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px', cursor: 'pointer' }}
      >
        <div style={{
          flexShrink: 0,
          width: '14px',
          height: '14px',
          border: '1.5px solid #555',
          marginTop: '1px',
          backgroundColor: checked[i] ? '#1a1a1a' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {checked[i] && (
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <p style={{ margin: 0, fontSize: '9pt' }}>{item}</p>
      </div>
    ))}
  </div>
);

// ─── MÉSOJET CORPS ────────────────────────────────────────────────────────────
export const ConsentMesojetCorps: React.FC<{ clientName: string; date: string; photoChecked: boolean[]; onPhotoToggle: (i: number) => void }> = ({ clientName, date, photoChecked, onPhotoToggle }) => (
  <div style={pageStyle} className="bg-white">
    <div style={innerPageStyle}>
      <ConsentHeader title="Consentement mutuel - Mésojet Corps" clientName={clientName} date={date} />
      <p style={paraStyle}>
        Certifie avoir été informé(e) concernant les soins par <strong>Radiofréquence</strong> et <strong>Hydroporation</strong> (Mésojet) auxquels je vais me soumettre dans le but d'un traitement d'amincissement et de raffermissement cutané. La radiofréquence, basée sur l'émission d'ondes radio à haute fréquence induisant une action thermique permet un raffermissement et un lissage de la peau.
      </p>
      <p style={paraStyle}>
        Il est recommandé de réaliser une cure de base de <strong>5 ou 10 séances</strong> afin de garantir les meilleurs résultats. Le nombre de séances est défini en fonction du métabolisme, de la morphologie, de la zone à traiter, du stade de relâchement du tissus et du type de peau. Une séance d'entretien une fois par mois est recommandée pour maintenir les résultats du soin sur le long terme.
      </p>
      <p style={paraStyle}>
        Comme pour toute technique minceur, une bonne hygiène de vie et une activité physique quotidienne sont vivement recommandées afin d'optimiser les résultats. Pour une réussite optimale de la cure, je m'engage à respecter les recommandations et conseils des thérapeutes, ainsi qu'à respecter le rythme des rendez-vous fixés pour les séances.
      </p>
      <p style={paraStyle}>Je suis informé(e) que parfois les résultats sont inférieurs à ceux attendus et cela ne me donne droit à la possibilité d'être remboursé(e) du montant crédité.</p>
      <p style={sectionTitleStyle}>Contre-indications à la RADIOFREQUENCE :</p>
      <ul style={listStyle}>
        {['Maladies/problèmes de peau : enflammée, rougie (coup de soleil), plaie ouverte, écorchures, éruption cutanée, herpès, cicatrices chéloïdes, troubles circulatoires','Peau excessivement sensible, sèche ou délicate, eczema, desquamation, psoriasis','Traitement cutané/cosmétique à l\'alcool au rétinol ou acide glycolique de moins de 24h','Cancer de la peau, radiothérapie en cours','Rasage, épilation sur la zone de moins de 24h','Tatouage de moins de 2 semaines','Maladies générales : épilepsie, problèmes cardiaques et dispositif médical actif (pacemaker, pompe à insuline...), problèmes sanguins','Prothèses, métal, stérilet en cuivre ou implant sur la zone de traitement','Myopathies'].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
      </ul>
      <p style={sectionTitleStyle}>Contre-indications à l'HYDROPORATION :</p>
      <ul style={listStyle}>
        {['Grossesse','Infections et/ou lésion sur la zone','Phlébite sévère ou récidivante','AVC','Hypertension sévère','Allergie éventuelle connue à un produit de diffusion'].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
      </ul>
      <p style={paraStyle}>Selon les cas, un certificat médical écrit pourra être demandé par le centre de soins.</p>
      <p style={sectionTitleStyle}>Conseils indispensables pour préparer le soin :</p>
      <ul style={listStyle}>
        {['Ne pas réaliser de peeling dans les 7 jours avant et après un soin Mésojet','Ne pas utiliser de cosmétiques abrasifs, gommages, exfoliants avant un soin','Ne pas appliquer un produit à base d\'alcool sur la peau avant un soin','Ne raser ou épiler la zone traitée juste avant et après un soin par radiofréquence','Ne pas s\'exposer au soleil avant (coup de soleil) et après le soin','Appliquer un SPF 50 ou 50+ les jours qui suivent un soin'].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
      </ul>
      <PhotoAuth items={['J\'autorise la prise de photographies avant/après et leur utilisation interne, une fois anonymisées, à des fins de présentation par les thérapeutes du centre MAbeautyplus.','J\'autorise la diffusion de ces photographies sur les réseaux sociaux du centre MAbeautyplus.']} checked={photoChecked} onToggle={onPhotoToggle} />
    </div>
  </div>
);

// ─── MÉSOJET VISAGE ───────────────────────────────────────────────────────────
export const ConsentMesojetVisage: React.FC<{ clientName: string; date: string; photoChecked: boolean[]; onPhotoToggle: (i: number) => void }> = ({ clientName, date, photoChecked, onPhotoToggle }) => (
  <div style={pageStyle} className="bg-white">
    <div style={innerPageStyle}>
      <ConsentHeader title="Consentement mutuel - Mésojet Visage" clientName={clientName} date={date} />
      <p style={paraStyle}>
        Certifie avoir été informé(e) concernant le(s) soin(s) par <strong>Hydroporation</strong> et/ou <strong>Radiofréquence</strong> (Mésojet) auxquels je vais me soumettre dans le but d'un traitement du visage. L'hydroporation est une technique de revitalisation 100% naturelle qui permet de traiter la peau en surface et en profondeur afin corriger problématiques cutanées sur le visage, le cou et le décolleté. La radiofréquence permet la stimulation de la sécrétion de collagène, un raffermissement et un lissage de la peau.
      </p>
      <p style={paraStyle}>Il est recommandé de réaliser une cure de base en traitement d'une problématique, puis une séance d'entretien une fois par mois pour maintenir les résultats du soin sur le long terme.</p>
      <p style={paraStyle}>Comme pour tout soin du visage, une bonne hygiène de vie et un entretien quotidien de la peau sont vivement recommandés afin d'optimiser les résultats. Pour une réussite optimale de la cure, je m'engage à respecter les recommandations et conseils des thérapeutes, ainsi qu'à respecter le rythme des rendez-vous fixés pour les séances.</p>
      <p style={paraStyle}>Je suis informé(e) que parfois les résultats sont inférieurs à ceux attendus et cela ne me donne droit à la possibilité d'être remboursé(e) du montant crédité.</p>
      <p style={sectionTitleStyle}>Contre-indications à la RADIOFREQUENCE :</p>
      <ul style={listStyle}>
        {['Maladies/problèmes de peau : enflammée, rougie (coup de soleil), plaie ouverte, écorchures, éruption cutanée, herpès, cicatrices chéloïdes, troubles circulatoires','Peau excessivement sensible, sèche ou délicate, eczema, desquamation, psoriasis','Traitement cutané/cosmétique à l\'alcool au rétinol ou acide glycolique de moins de 24h','Cancer de la peau, radiothérapie en cours','Rasage, épilation sur la zone de moins de 24h','Tatouage de moins de 2 semaines','Maladies générales : épilepsie, problèmes cardiaques et dispositif médical actif, problèmes sanguins','Prothèses, métal, stérilet en cuivre ou implant sur la zone de traitement','Myopathies'].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
      </ul>
      <p style={sectionTitleStyle}>Contre-indications à l'HYDROPORATION :</p>
      <ul style={listStyle}>
        {['Grossesse','Infections et/ou lésion sur la zone','Phlébite sévère ou récidivante','AVC','Hypertension sévère','Allergie éventuelle connue à un produit de diffusion'].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
      </ul>
      <p style={paraStyle}>Selon les cas, un certificat médical écrit pourra être demandé par le centre de soins.</p>
      <p style={sectionTitleStyle}>Conseils indispensables pour préparer le soin :</p>
      <ul style={listStyle}>
        {['Ne pas réaliser de peeling dans les 7 jours avant et après un soin Mésojet','Ne pas utiliser de cosmétiques abrasifs, gommages, exfoliants avant un soin','Ne pas appliquer un produit à base d\'alcool sur la peau avant un soin','Ne raser ou épiler la zone traitée juste avant et après un soin par radiofréquence','Ne pas s\'exposer au soleil avant (coup de soleil) et après le soin','Appliquer un SPF 50 ou 50+ les jours qui suivent un soin','Retirer ses lentilles de contact avant le soin','Respecter un délais d\'un mois après une injection d\'acide hyaluronique ou de Botox'].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
      </ul>
      <PhotoAuth items={['J\'autorise la prise de photographies avant/après et leur utilisation interne, une fois anonymisées, à des fins de présentation par les thérapeutes du centre MAbeautyplus.','J\'autorise la diffusion de ces photographies sur les réseaux sociaux du centre MAbeautyplus.']} checked={photoChecked} onToggle={onPhotoToggle} />
    </div>
  </div>
);

// ─── PRESSODYNAMIE ────────────────────────────────────────────────────────────
export const ConsentPresso: React.FC<{ clientName: string; date: string; photoChecked: boolean[]; onPhotoToggle: (i: number) => void }> = ({ clientName, date, photoChecked, onPhotoToggle }) => (
  <div style={pageStyle} className="bg-white">
    <div style={innerPageStyle}>
      <ConsentHeader title="Consentement mutuel - Pressodynamie" clientName={clientName} date={date} />
      <p style={paraStyle}>Certifie avoir été informé(e) concernant les soins par <strong>Pressodynamie</strong> (PSX Esthetique®) auxquels je vais me soumettre dans le but d'un traitement du corps et des jambes.</p>
      <p style={paraStyle}>La pressothérapie effectue une action mécanique par pression qui améliore le drainage lymphatique, l'élimination des toxines, l'aspect de la peau, la cellulite, la rétention d'eau et la circulation sanguine. Elle diminue l'effet de jambes lourdes et agit sur les tissus musculaires. La pressodynamie est vivement recommandée en complément d'une cure minceur afin d'éliminer les graisses déstockées par la lipolyse.</p>
      <p style={paraStyle}>Une bonne hygiène de vie et une activité physique quotidienne sont recommandées afin d'optimiser les résultats. Pour une réussite optimale de la cure, je m'engage à respecter les recommandations et conseils des thérapeutes, ainsi qu'à respecter le rythme des rendez-vous fixés pour les séances.</p>
      <p style={paraStyle}>Je suis informé(e) que parfois les résultats sont inférieurs à ceux attendus et cela ne me donne droit à la possibilité d'être remboursé(e) du montant crédité.</p>
      <p style={sectionTitleStyle}>Les contre-indications à la Pressodynamie :</p>
      <p style={{ ...paraStyle, margin: '0 0 4px 0' }}>Il est interdit d'effectuer les séances de pressothérapie en cas de :</p>
      <ul style={listStyle}>
        {['Œdèmes lymphatique sévère','Varices œdémateuses','Fragilité capillaire, hémophilie, artériopathie sévère stade 3 et 4 (dépôt de cholestérol)','Thromboses veineuses profondes ou phlébite non traitée (caillot sanguin)','Etat inflammatoire local ou général','Infection de la peau, plaie, dermatose ou problème cutané','Tumeur maligne','Diabète sucré (sang sirupeux), insuffisance rénale','Insuffisance cardiaque non traitée, Pacemaker','Vagotomie (section du nerf vague)','Prothèse récente','Femme enceinte','Pour le traitement du ventre : hernies abdominales, inflammations chroniques du tube digestif'].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
      </ul>
      <p style={paraStyle}>Selon les cas, un certificat médical écrit pourra être demandé par le centre de soins.</p>
      <PhotoAuth items={['J\'autorise la prise de photographies avant/après et leur utilisation interne, une fois anonymisées, à des fins de présentation par les thérapeutes du centre MAbeautyplus.','J\'autorise la diffusion de ces photographies sur les réseaux sociaux du centre MAbeautyplus.']} checked={photoChecked} onToggle={onPhotoToggle} />
    </div>
  </div>
);

// ─── I-SHAPE ──────────────────────────────────────────────────────────────────
export const ConsentIShape: React.FC<{ clientName: string; date: string; photoChecked: boolean[]; onPhotoToggle: (i: number) => void }> = ({ clientName, date, photoChecked, onPhotoToggle }) => (
  <div style={pageStyle} className="bg-white">
    <div style={innerPageStyle}>
      <ConsentHeader title="Consentement mutuel - Electrostimulation" clientName={clientName} date={date} />
      <p style={paraStyle}>Certifie avoir été informé(e) concernant les séances d'<strong>Electrostimulation</strong> (I-Shape®, certifié CE et IECEE) auxquels je vais me soumettre dans le but d'un traitement de tonification, minceur et/ou raffermissement. L'électrostimulation reproduit le message chimique demandé par le cerveau et envoie un signal nerveux au muscle en permettant sa contraction. La stimulation est simplifiée et amplifiée, pour une contraction plus efficace et en profondeur. 20 minutes d'électrostimulation équivalent à 4h de sport.</p>
      <p style={paraStyle}>Il est recommandé de réaliser une cure de base de <strong>12 à 40 séances, 1 à 2 fois/semaine</strong>, renouvelable afin de garantir les meilleurs résultats. Le nombre de séances est défini en fonction de l'objectif physique, du métabolisme, de la morphologie et du bilan d'analyse de composition corporelle.</p>
      <p style={paraStyle}>Comme pour toute méthode de minceur, une bonne hygiène de vie, une alimentation équilibrée et une activité physique quotidienne sont vivement recommandées afin d'optimiser les résultats. Pour une réussite optimale de la cure, je m'engage à respecter les recommandations et conseils des thérapeutes ainsi qu'à respecter le rythme des rendez-vous fixés pour les séances.</p>
      <p style={paraStyle}>Je suis informé(e) que parfois les résultats sont inférieurs à ceux attendus et cela ne me donne droit à la possibilité d'être remboursé(e) du montant crédité.</p>
      <p style={sectionTitleStyle}>Les contre-indications à l'utilisation :</p>
      <p style={{ ...paraStyle, margin: '0 0 4px 0' }}>Il est interdit d'effectuer les séances d'électrostimulation en cas de :</p>
      <ul style={listStyle}>
        {['Pacemaker ou dispositif médical actif','Maladie ou anomalie cardiaque (arythmie, tachycardie, fragilité cardiaque...)','Epilepsie','Présence ou antécédant d\'hernie abdominale ou inguinale (aine), éventration','Phlébites (obstruction d\'une veine par un caillot), thrombose (caillot)','Tumeur ou cancer','Troubles circulatoires graves, hémophilie','Blessure non cicatrisée ou affection cutanée (eczéma, brûlure, irritation...) sur la zone de traitement','Maladie du foie, diabète sucré (sang sirupeux)','Maladie neurologique grave','Enfants, adolescents, femme enceinte'].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
      </ul>
      <p style={paraStyle}>Selon les cas, un certificat médical écrit pourra être demandé par le centre de soins.</p>
      <PhotoAuth items={['J\'autorise la prise de photographies avant/après et leur utilisation interne, une fois anonymisées, à des fins de présentation par les thérapeutes du centre MAbeautyplus.','J\'autorise la diffusion de ces photographies sur les réseaux sociaux du centre MAbeautyplus.']} checked={photoChecked} onToggle={onPhotoToggle} />
    </div>
  </div>
);

// ─── LUXO MÉNOPAUSE ───────────────────────────────────────────────────────────
export const ConsentLuxoMenopause: React.FC<{ clientName: string; date: string }> = ({ clientName, date }) => (
  <div style={pageStyle} className="bg-white">
    <div style={innerPageStyle}>
      <ConsentHeader title="Consentement mutuel - Ménopause" clientName={clientName} date={date} />
      <p style={paraStyle}>Certifie avoir été informée concernant les séances de <strong>Luxothérapie</strong> par <strong>Rayonnements infrarouges</strong> (Luxoscreen®, certifié CE dispositif médical) auxquels je vais me soumettre dans le but d'un traitement des inconforts liés à la ménopause. La luxothérapie stimule les points réflexes du corps et permet de rétablir l'équilibre fonctionnel des organes et des systèmes hormonal, digestif et lymphatique. Elle aide ainsi à diminuer les bouffées de chaleur, la fatigue, réguler l'humeur, la rétention d'eau, la transpiration excessive, les troubles du sommeil et autres problématiques.</p>
      <p style={{ ...paraStyle, margin: '0 0 4px 0' }}>Il est recommandé de réaliser une cure de base de 10 séances, réparties comme tel :</p>
      <ul style={listStyle}>
        {['2 séances la première semaine','1 séance par semaine pendant 5 semaines','1 séance par mois pendant 3 mois'].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
      </ul>
      <p style={paraStyle}>afin de garantir les meilleurs résultats.</p>
      <p style={paraStyle}>Je suis informée que parfois les résultats sont inférieurs à ceux attendus et cela ne me donne droit à la possibilité d'être remboursée du montant crédité.</p>
      <p style={sectionTitleStyle}>Les contre-indications à l'utilisation :</p>
      <p style={{ ...paraStyle, margin: '0 0 4px 0' }}>Il est interdit d'effectuer les séances de luxothérapie en cas de :</p>
      <ul style={listStyle}>
        {['Troubles épileptiques','Maladie grave (nécessitant une prise en charge hospitalière ou de la convalescence)','Pathologie infectieuse ou bactérienne','Pathologie cancéreuse active ou non stabilisée','Femme enceinte'].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
      </ul>
      <p style={paraStyle}>Selon les cas, un certificat médical écrit pourra être demandé par le centre de soins.</p>
    </div>
  </div>
);

// ─── LUXO RELAXATION ──────────────────────────────────────────────────────────
export const ConsentLuxoRelax: React.FC<{ clientName: string; date: string }> = ({ clientName, date }) => (
  <div style={pageStyle} className="bg-white">
    <div style={innerPageStyle}>
      <ConsentHeader title="Consentement mutuel - Relaxation" clientName={clientName} date={date} />
      <p style={paraStyle}>Certifie avoir été informé(e) concernant les séances de <strong>Luxothérapie</strong> par <strong>Rayonnements infrarouges</strong> (Luxoscreen®, certifié CE dispositif médical) auxquels je vais me soumettre dans le but d'un traitement de relaxation et gestion du stress. La luxothérapie stimule les points réflexes du corps et permet de rétablir l'équilibre fonctionnel des organes, des systèmes hormonal, digestif et lymphatique.</p>
      <p style={{ ...paraStyle, margin: '0 0 4px 0' }}>Il est recommandé de réaliser une cure de base de <strong>10 séances</strong>, réparties comme tel :</p>
      <ul style={listStyle}>
        {['2 séances la première semaine','1 séance par semaine pendant 5 semaines','1 séance par mois pendant 3 mois'].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
      </ul>
      <p style={paraStyle}>afin de garantir les meilleurs résultats.</p>
      <p style={paraStyle}>Je suis informé(e) que parfois les résultats sont inférieurs à ceux attendus et cela ne me donne droit à la possibilité d'être remboursé(e) du montant crédité.</p>
      <p style={sectionTitleStyle}>Les contre-indications à l'utilisation :</p>
      <p style={{ ...paraStyle, margin: '0 0 4px 0' }}>Il est interdit d'effectuer les séances de luxothérapie en cas de :</p>
      <ul style={listStyle}>
        {['Troubles épileptiques','Maladie grave (nécessitant une prise en charge hospitalière ou de la convalescence)','Pathologie infectieuse ou bactérienne','Pathologie cancéreuse active ou non stabilisée','Femme enceinte'].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
      </ul>
      <p style={paraStyle}>Selon les cas, un certificat médical écrit pourra être demandé par le centre de soins.</p>
    </div>
  </div>
);

// ─── LUXO PERTE DE POIDS ──────────────────────────────────────────────────────
export const ConsentLuxoPdp: React.FC<{ clientName: string; date: string; photoChecked: boolean[]; onPhotoToggle: (i: number) => void }> = ({ clientName, date, photoChecked, onPhotoToggle }) => (
  <div style={pageStyle} className="bg-white">
    <div style={innerPageStyle}>
      <ConsentHeader title="Consentement mutuel - Perte de poids" clientName={clientName} date={date} />
      <p style={paraStyle}>Certifie avoir été informé(e) concernant les séances de <strong>Luxothérapie</strong> par <strong>Rayonnements infrarouges</strong> (Luxoscreen®, certifié CE dispositif médical) auxquels je vais me soumettre dans le but d'un traitement de perte de poids. La luxothérapie stimule les points réflexes du corps et permet de rétablir l'équilibre fonctionnel des organes, des systèmes hormonal, digestif et lymphatique, de réguler les sensations alimentaires (appétit excessif, compulsions, fringales, envies de sucre ou de gras...), ainsi que d'améliorer la qualité du sommeil et la gestion du stress.</p>
      <p style={paraStyle}>Il est recommandé de réaliser une cure de base de <strong>12 à 20 séances, 2 séances la 1ère semaine, puis 1 séance/semaine</strong> afin de garantir les meilleurs résultats. Le nombre de séances est défini en fonction de l'objectif de poids, du métabolisme, de la morphologie et du bilan d'analyse de composition corporelle.</p>
      <p style={paraStyle}>Comme pour toute méthode de perte de poids, une bonne hygiène de vie et une activité physique quotidienne sont vivement recommandées afin d'optimiser les résultats. Pour une réussite optimale de la cure, je m'engage à respecter les recommandations et conseils des thérapeutes, à suivre le protocole de rééquilibrage alimentaire ainsi qu'à respecter le rythme des rendez-vous fixés pour les séances.</p>
      <p style={paraStyle}>Je suis informé(e) que parfois les résultats sont inférieurs à ceux attendus et cela ne me donne droit à la possibilité d'être remboursé(e) du montant crédité.</p>
      <p style={sectionTitleStyle}>Les contre-indications à l'utilisation :</p>
      <p style={{ ...paraStyle, margin: '0 0 4px 0' }}>Il est interdit d'effectuer les séances de luxothérapie en cas de :</p>
      <ul style={listStyle}>
        {['Troubles épileptiques','Maladie grave (nécessitant une prise en charge hospitalière ou de la convalescence)','Pathologie infectieuse ou bactérienne','Pathologie cancéreuse active ou non stabilisée','Femme enceinte'].map((item, i) => <li key={i} style={liStyle}>{item}</li>)}
      </ul>
      <p style={paraStyle}>Selon les cas, un certificat médical écrit pourra être demandé par le centre de soins.</p>
      <PhotoAuth items={['J\'autorise la prise de photographies avant/après et leur utilisation interne, une fois anonymisées, à des fins de présentation par les thérapeutes du centre MAbeautyplus.','J\'autorise la diffusion de ces photographies sur les réseaux sociaux du centre MAbeautyplus.']} checked={photoChecked} onToggle={onPhotoToggle} />
    </div>
  </div>
);

// ─── DISPATCHER ───────────────────────────────────────────────────────────────

export type ConsentComponent = React.FC<{ clientName: string; date: string; photoChecked: boolean[]; onPhotoToggle: (i: number) => void }>;

// Components without photo auth still need to satisfy the type
const NoopPhotoConsent = (Base: React.FC<{ clientName: string; date: string }>): ConsentComponent =>
  ({ clientName, date }) => <Base clientName={clientName} date={date} />;

export const CONSENT_COMPONENTS: Record<string, ConsentComponent> = {
  'meso-corps':   ConsentMesojetCorps,
  'adipologie':   ConsentMesojetCorps,
  'cavitalyse':   ConsentMesojetCorps,
  'meso-visage':  ConsentMesojetVisage,
  'advance-lift': ConsentMesojetVisage,
  'presso':       ConsentPresso,
  'ishape':       ConsentIShape,
  'luxo-meno':    NoopPhotoConsent(ConsentLuxoMenopause),
  'luxo-relax':   NoopPhotoConsent(ConsentLuxoRelax),
  'luxo-pdp':     ConsentLuxoPdp,
};

const CONSENT_TITLES: Record<string, string> = {
  'meso-corps':   'Mésojet Corps',
  'adipologie':   'Mésojet Corps',
  'cavitalyse':   'Mésojet Corps',
  'meso-visage':  'Mésojet Visage',
  'advance-lift': 'Mésojet Visage',
  'presso':       'Pressodynamie',
  'ishape':       'Electrostimulation',
  'luxo-meno':    'Ménopause',
  'luxo-relax':   'Relaxation',
  'luxo-pdp':     'Perte de poids',
};

const CONSENT_HAS_PHOTO: Record<string, boolean> = {
  'meso-corps': true, 'adipologie': true, 'cavitalyse': true,
  'meso-visage': true, 'advance-lift': true,
  'presso': true, 'ishape': true,
  'luxo-meno': false, 'luxo-relax': false,
  'luxo-pdp': true,
};

export interface ConsentEntry {
  key: string;
  title: string;
  Component: ConsentComponent;
  hasPhotoAuth: boolean;
}

export function getConsentEntries(activeServiceIds: string[]): ConsentEntry[] {
  const seen = new Set<string>();
  const entries: ConsentEntry[] = [];
  for (const id of activeServiceIds) {
    const Component = CONSENT_COMPONENTS[id];
    const title = CONSENT_TITLES[id];
    if (!Component || !title) continue;
    const key = title;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({ key, title, Component, hasPhotoAuth: CONSENT_HAS_PHOTO[id] ?? false });
  }
  return entries;
}
