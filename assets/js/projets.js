/* ==========================================================================
   Contenu de la page Réalisations.

   Deux listes, deux niveaux de détail. La page utilise PROJETS s'il contient
   quelque chose, sinon PHOTOS.

     PHOTOS   → une mosaïque. Chaque photo porte son métier et sa légende ;
                les filtres se construisent à partir des métiers présents.
                C'est le mode actuel.

     PROJETS  → des chantiers regroupant plusieurs photos (avant / après /
                détail) avec titre, lieu et année. À privilégier dès que ces
                informations sont connues, chantier par chantier.

   Les deux listes vides : la page affiche un message d'attente.

   Métiers reconnus :
     carrelage · maconnerie · toiture · menuiserie · plafonnage

   Une photo sans métier reste dans la mosaïque, hors filtres.
   ========================================================================== */


/* ── Mosaïque ──────────────────────────────────────────────────────────────
   L'ordre ci-dessous est l'ordre d'affichage. Les légendes décrivent ce que
   montre la photo : ajoutez-y la commune quand elle est connue, par exemple
   « Terrasse en dalles grand format — Namur ».
   ------------------------------------------------------------------------ */

window.PHOTOS = [
  { src: 'assets/images/104.jpg', metier: 'carrelage',
    legende: 'Douche à l’italienne, carrelage effet pierre',
    alt: 'Douche à l’italienne carrelée effet pierre, robinetterie noire et paroi vitrée' },

  { src: 'assets/images/100.jpg', metier: 'carrelage',
    legende: 'Terrasse en dalles grand format',
    alt: 'Terrasse extérieure en dalles grises grand format, joints réguliers' },

  { src: 'assets/images/108.jpg', metier: 'carrelage',
    legende: 'Escalier habillé en carrelage grand format',
    alt: 'Marches et contremarches d’un escalier habillées de carrelage grand format' },

  { src: 'assets/images/102.jpg', metier: 'carrelage',
    legende: 'Terrasse et emmarchement en pierre',
    alt: 'Terrasse carrelée avec marche et garde-corps en inox' },

  { src: 'assets/images/103.jpg', metier: 'carrelage',
    legende: 'Terrasse claire en bordure de baie vitrée',
    alt: 'Terrasse en dalles claires longeant une baie vitrée, pelouse attenante' },

  { src: 'assets/images/106.jpg', metier: 'toiture',
    legende: 'Couverture en bacs acier',
    alt: 'Toiture en bacs acier anthracite vue depuis le faîte' },

  { src: 'assets/images/107.jpg', metier: 'maconnerie',
    legende: 'Allée en pavés béton, compactage en cours',
    alt: 'Allée en pavés béton en cours de compactage à la plaque vibrante' },

  { src: 'assets/images/101.jpg', metier: 'maconnerie',
    legende: 'Chape lissée en pied de façade',
    alt: 'Dalle de béton lissée le long d’une façade en briques' },

  { src: 'assets/images/109.jpg', metier: 'maconnerie',
    legende: 'Ouverture de garage et seuil maçonné',
    alt: 'Façade en briques avec porte de garage sectionnelle et seuil bétonné' },

  { src: 'assets/images/105.jpg', metier: 'menuiserie',
    legende: 'Porte intérieure en chêne clair',
    alt: 'Porte intérieure en chêne clair posée, poignée et paumelles noires' },

  { src: 'assets/images/111.jpg', metier: 'plafonnage',
    legende: 'Pièce plafonnée, prête à peindre',
    alt: 'Pièce aux murs plafonnés et enduits, prêts à recevoir la peinture' },

  { src: 'assets/images/112.jpg', metier: 'plafonnage',
    legende: 'Cloisons et sol carrelé effet bois',
    alt: 'Pièce cloisonnée en plaques de plâtre avec sol carrelé imitation bois' },

  { src: 'assets/images/110.jpg', metier: 'plafonnage',
    legende: 'Plateau de bureaux après cloisonnement',
    alt: 'Plateau de bureaux aménagé, cloisons acoustiques et postes de travail' }
];


/* ── Chantiers détaillés ───────────────────────────────────────────────────
   Dès qu'une entrée est ajoutée ici, elle remplace la mosaïque ci-dessus.
   ------------------------------------------------------------------------ */

window.PROJETS = [

  /* ——— Exemple, à copier puis décommenter ————————————————————————————
  {
    titre: 'Salle de bain complète',
    metier: 'carrelage',
    lieu: 'Namur',
    annee: '2026',
    description: 'Dépose de l’ancienne salle de bain, ragréage, étanchéité et pose ' +
                 'd’un grès cérame grand format au sol et aux murs. Douche à l’italienne.',
    images: [
      { src: 'assets/images/100.jpg', legende: 'Avant', alt: 'Ancienne salle de bain avant travaux' },
      { src: 'assets/images/104.jpg', legende: 'Après', alt: 'Salle de bain rénovée' }
    ]
  },
  ——————————————————————————————————————————————————————————————————— */

];
