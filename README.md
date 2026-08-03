# Haumont Rénovation SRL — site vitrine

Site vitrine multi-pages pour une entreprise générale de rénovation (toiture, façade,
extérieurs, intérieur) à Bruxelles et en Brabant wallon.

**HTML5 · Tailwind CSS 3 · JavaScript natif.** Aucun framework, aucune dépendance
runtime : le site publié n'est composé que de fichiers statiques.

## Direction artistique

| | |
|---|---|
| Fond | Charcoal profond `#0F1115`, nuancé par deux halos radiaux (sage + argent) |
| Accent | Sage `#9BB48B` — traits fins, lueurs, états actifs |
| Neutres | Argent givré `#C9D0D9` → `#5F6874` pour le texte secondaire et les filets |
| Typographie | Plus Jakarta Sans (200–700), blanc pur, graisses légères et interlettrage serré |
| Texture | Grain SVG à 2,8 % d'opacité, pour éviter l'aplat numérique sur les grandes surfaces |

Les icônes sont des SVG tracés à la main, `stroke-width: 1`, sans remplissage.

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Hero scindé (typographie à gauche, photo de toiture à droite), ticker des garanties, **bento asymétrique** (3 engagements + tuile chiffres + tuile citation), **bande photo pleine largeur épinglée** (jardin), **test d'éligibilité** remonté juste après, métiers en liste éditoriale à panneau collant, méthode en deux colonnes collantes |
| `services.html` | Les quatre métiers en détail (ancres `#toiture`, `#facade`, `#exterieurs`, `#interieur`), bandeau de marques défilant, FAQ en accordéon |
| `realisations.html` | Galerie de 9 chantiers filtrable par métier, statistiques, témoignages |
| `entreprise.html` | Histoire, principes, chronologie 2006 → 2025, garanties et assurances |
| `contact.html` | Formulaire de devis validé côté client, coordonnées, horaires, zone d'intervention |

## JavaScript (`assets/js/main.js`)

Modules indépendants, chacun inactif si son point d'ancrage est absent de la page :

- **Révélations au défilement** — `IntersectionObserver`, cascade réglée par `data-reveal-stagger`
- **Compteurs** — animation `easeOutExpo` déclenchée à 50 % de visibilité
- **Liste éditoriale des métiers** — le panneau collant suit la ligne survolée ou
  focalisée au clavier ; masqué sous `lg`, où les lignes se suffisent à elles-mêmes
- **Parallaxe** — dérive verticale disponible via `data-parallax`, limitée par `requestAnimationFrame`
- **Navigation** — état givré au défilement, panneau mobile, fermeture à `Échap`
- **Test d'éligibilité** — 3 questions → fourchette budgétaire, durée et taux de TVA
  (6 % au-delà de 10 ans, 21 % en deçà). Le calcul reste dans le navigateur ; le
  résultat est repris automatiquement dans le formulaire de devis via `sessionStorage`
- **Formulaire** — validation par champ (au `blur` puis en direct), messages en français
- **Accordéon**, **filtres de galerie**, **année du copyright**

`prefers-reduced-motion` neutralise toutes les animations. Sans JavaScript, la page
reste entièrement lisible : les révélations sont conditionnées par la classe `.js`.

## Images

Photographies Unsplash chargées par URL (`images.unsplash.com`), en `srcset` pour le
hero et la bande jardin, `loading="lazy"` partout ailleurs.

Chaque `<figure class="media">` porte un dégradé qui sert à la fois de fond de
chargement et de repli : si une URL devient indisponible, l'image est retirée du flux
et la plaque dégradée reste — aucune icône d'image cassée n'apparaît jamais.

> Pour un déploiement en production, remplacer ces URL par les photographies réelles
> des chantiers, hébergées sur le même domaine.

## Développement

```bash
npm install        # tailwindcss (seule dépendance, en devDependency)
npm run dev        # recompile assets/css/site.css à chaque modification
npm run serve      # http://localhost:8000
npm run build      # produit dist/ (build de production)
npm run preview    # http://localhost:8001 — sert dist/
```

`assets/css/site.css` est **versionné** : le site s'ouvre et se publie tel quel, sans
étape de build. `npm run build` sert au déploiement (voir ci-dessous).

### Structure

```
index.html  services.html  realisations.html  entreprise.html  contact.html
assets/
  css/
    main.css     ← design system écrit à la main (variables, composants, animations)
    src.css      ← point d'entrée Tailwind (base → main.css → utilities)
    site.css     ← feuille compilée, référencée par les pages
  js/
    main.js
scripts/build.mjs   ← génère dist/
tailwind.config.js
vercel.json
```

L'ordre d'import dans `src.css` place `main.css` entre les composants et les
utilitaires Tailwind : à spécificité égale, une classe utilitaire l'emporte toujours
sur une classe du design system.

## Déploiement (Vercel)

`npm run build` génère `dist/` avec **uniquement** ce qui doit être servi : les cinq
pages, `main.js` et la feuille Tailwind compilée. Les sources (`main.css`, `src.css`,
`tailwind.config.js`, `node_modules`, ce README) restent hors du dossier publié.

`vercel.json` est déjà configuré : `buildCommand`, `outputDirectory: dist`, en-têtes de
sécurité et cache des assets.

### Option A — import depuis GitHub (recommandé)

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → `thao-roland/haumon-renovation`
2. Vercel lit `vercel.json` : ne rien changer dans « Build & Output Settings ».
3. **Settings → Git → Production Branch** : choisir la branche à publier
   (le dépôt n'a pour l'instant que `claude/haumont-renovation-website-mw0g24` ;
   sinon, fusionner d'abord cette branche dans `main`).
4. **Deploy**.

### Option B — en ligne de commande

```bash
npx vercel login
npx vercel        # préproduction
npx vercel --prod # production
```

### URL propres (optionnel)

Les liens internes pointent vers `services.html`, `contact.html`… — le site reste donc
ouvrable directement depuis le disque. Pour des URL sans extension (`/services`),
ajouter `"cleanUrls": true` dans `vercel.json` **et** retirer les `.html` des liens
internes des cinq pages.

## À brancher avant mise en ligne

- **Formulaire de contact** — `initForms()` simule l'envoi (`setTimeout`). Remplacer ce
  bloc par un `fetch()` vers le point d'entrée retenu (Formspree, Netlify Forms, API interne).
- **Coordonnées** — téléphone, e-mail, adresse, numéro de TVA et numéro de police
  d'assurance sont des valeurs de démonstration, à remplacer partout (pied de page,
  navigation, page contact).
- **Chiffres et témoignages** — contenus de démonstration crédibles, à confirmer.
- **Carte** — la zone d'intervention est illustrée par une photographie ; y substituer
  une carte interactive si souhaité.
