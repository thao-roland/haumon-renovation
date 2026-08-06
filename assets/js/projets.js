/* ==========================================================================
   Contenu de la page Réalisations.

   Deux listes, deux niveaux de détail. La page utilise PROJETS s'il contient
   quelque chose, sinon PHOTOS.

     PHOTOS   → une simple mosaïque. Aucune information à fournir hormis le
                fichier. C'est le mode actuel.

     PROJETS  → des chantiers avec titre, métier, lieu, année et une série de
                photos (avant / après / détail). Filtres par métier en prime.
                À privilégier dès que ces informations sont connues.

   Les deux listes vides : la page affiche un message d'attente.
   ========================================================================== */


/* ── Mosaïque ──────────────────────────────────────────────────────────────
   Les photos déposées dans assets/images/. L'ordre ci-dessous est l'ordre
   d'affichage : déplacez une ligne pour déplacer la photo.
   ------------------------------------------------------------------------ */

window.PHOTOS = [
  { src: 'assets/images/100.jpg' },
  { src: 'assets/images/101.jpg' },
  { src: 'assets/images/102.jpg' },
  { src: 'assets/images/103.jpg' },
  { src: 'assets/images/104.jpg' },
  { src: 'assets/images/105.jpg' },
  { src: 'assets/images/106.jpg' },
  { src: 'assets/images/107.jpg' },
  { src: 'assets/images/108.jpg' },
  { src: 'assets/images/109.jpg' },
  { src: 'assets/images/110.jpg' },
  { src: 'assets/images/111.jpg' },
  { src: 'assets/images/112.jpg' }

  // Une photo peut recevoir une légende, qui s'affiche dans la visionneuse :
  //   { src: 'assets/images/113.jpg', legende: 'Douche à l’italienne, Namur' }
];


/* ── Chantiers détaillés ───────────────────────────────────────────────────
   Dès qu'une entrée est ajoutée ici, elle remplace la mosaïque ci-dessus par
   une grille de chantiers filtrable par métier.

   Métiers reconnus :
     carrelage · maconnerie · toiture · menuiserie · plafonnage
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
      { src: 'assets/images/101.jpg', legende: 'Après', alt: 'Salle de bain rénovée, carrelage grand format' },
      { src: 'assets/images/102.jpg', legende: 'Détail', alt: 'Découpe et jointoiement dans l’angle de la douche' }
    ]
  },
  ——————————————————————————————————————————————————————————————————— */

];
