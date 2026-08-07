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
| `index.html` | Hero plein écran (toiture), chiffres clés animés, **bento 3 colonnes** des trois engagements, **bande photo pleine largeur** (jardin) en parallaxe, métiers, méthode en 4 étapes, témoignage, **test d'éligibilité** interactif |
| `services.html` | Les quatre métiers en détail (ancres `#toiture`, `#facade`, `#exterieurs`, `#interieur`), bandeau de marques défilant, FAQ en accordéon |
| `realisations.html` | Galerie construite depuis `assets/js/projets.js` : filtres par métier et visionneuse avant/après. Message d'attente tant que la liste est vide |
| `entreprise.html` | Histoire, principes, chronologie 2006 → 2025, garanties et assurances |
| `contact.html` | Formulaire de devis validé côté client, coordonnées, horaires, zone d'intervention |

## JavaScript (`assets/js/main.js`)

Modules indépendants, chacun inactif si son point d'ancrage est absent de la page :

- **Révélations au défilement** — `IntersectionObserver`, cascade réglée par `data-reveal-stagger`
- **Titres ligne par ligne** (`data-split`) — le texte est découpé en mots, la mise en
  page décide où tombent les lignes, chaque ligne est réenveloppée dans un masque puis
  remonte avec 90 ms de décalage. Le découpage se refait au changement de largeur et une
  fois la police chargée, les lignes ne tombant plus au même endroit. Un titre contenant
  des balises internes est laissé intact plutôt que découpé de travers, et un filet de
  sécurité compare les caractères avant/après : au moindre écart, le titre d'origine est
  restauré.
- **Ouverture en volet** (`data-reveal="clip"`) — la photo se déroule du bas vers le haut
  sur sa plaque dégradée. Le `clip-path` porte sur l'image et jamais sur l'élément
  observé : clippé à hauteur nulle, il n'entrerait jamais « à l'écran » et ne serait donc
  jamais révélé.
- **Compteurs** — animation `easeOutExpo` déclenchée à 50 % de visibilité
- **Parallaxe** — dérive verticale de la photo de jardin, limitée par `requestAnimationFrame`
- **Navigation** — état givré au défilement, panneau mobile, fermeture à `Échap`
- **Test d'éligibilité** — 3 questions → fourchette budgétaire, durée et taux de TVA
  (6 % au-delà de 10 ans, 21 % en deçà). Le calcul reste dans le navigateur ; le
  résultat est repris automatiquement dans le formulaire de devis via `sessionStorage`
- **Formulaire** — validation par champ (au `blur` puis en direct), messages en français
- **Accordéon**, **filtres de galerie**, **année du copyright**

`prefers-reduced-motion` neutralise toutes les animations. Sans JavaScript, la page
reste entièrement lisible : les révélations sont conditionnées par la classe `.js`.

## Galerie et logo

Tout se joue dans **`assets/images/`** (les fichiers) et **`assets/js/projets.js`**
(ce qui est affiché). Le HTML n'est jamais à toucher.

`projets.js` expose deux listes :

- **`PHOTOS`** — une mosaïque de photos, sans autre information que le fichier.
  C'est le mode actuel : 13 photos, visionneuse au clic.
- **`PROJETS`** — des chantiers avec titre, métier, lieu, année et une série
  avant / après / détail. Dès qu'une entrée y figure, elle remplace la mosaïque
  par une grille filtrable par métier. Les filtres n'affichent que les métiers réellement présents et n'apparaissent qu'à
partir de deux métiers différents. Les deux listes vides : la page montre un
message d'attente plutôt qu'une grille vide.

Le logo sert de favicon, d'en-tête, de pied de page et d'aperçu au partage. Le site
pointe sur `logo-haumont-web.png`, version détourée de `logo-hau.png` : le fichier
d'origine porte un fond noir incrusté qui, sur le charcoal de la page, formait un
rectangle plus sombre. S'il est absent, le nom écrit prend le relais.

`scripts/build.mjs` copie `assets/images/` dans `dist/`, en laissant le README du
dossier hors du site publié.

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

- **Formulaire de contact** — sans serveur, `initForms()` compose un lien `mailto:` et
  ouvre la messagerie du visiteur avec objet et corps pré-remplis. Pour un envoi direct
  sans quitter le site, remplacer ce bloc par un `fetch()` vers un point d'entrée
  (Formspree, Netlify Forms, API interne).
- **Coordonnées** — téléphone, e-mail, adresse, numéro de TVA et numéro de police
  d'assurance sont des valeurs de démonstration, à remplacer partout (pied de page,
  navigation, page contact).
- **Chiffres et témoignages** — contenus de démonstration crédibles, à confirmer.
- **Carte** — la zone d'intervention est illustrée par une photographie ; y substituer
  une carte interactive si souhaité.
