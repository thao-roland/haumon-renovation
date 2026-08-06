# Photos des chantiers

Déposez ici toutes les photos du site. Ce dossier est versionné : ce que vous
poussez sur GitHub se retrouve en ligne au déploiement suivant.

## Comment nommer les fichiers

Un nom par chantier, en minuscules, sans accent ni espace :

```
carrelage-namur-01-avant.jpg
carrelage-namur-02-apres.jpg
carrelage-namur-03-detail.jpg
toiture-liege-01-avant.jpg
```

Le nom n'a pas d'effet technique — il sert à s'y retrouver. Ce qui compte,
c'est de reporter le chemin exact dans `assets/js/projets.js`.

## Avant de déposer une photo

- **Format** : `.jpg` pour les photos, `.png` uniquement pour un logo.
- **Largeur** : 2000 px suffisent. Au-delà, la page se charge lentement pour
  rien — le site n'affiche jamais plus grand.
- **Poids** : visez moins de 500 ko par image. Si un fichier fait 5 Mo,
  réduisez-le (Aperçu sur Mac, Photos sur Windows, ou squoosh.app).
- **Pas de capture WhatsApp** : la compression y détruit les détails, et c'est
  précisément le détail qui vend un carrelage.
- **Orientation** : vérifiez que la photo n'est pas couchée après l'envoi.

## Puis déclarer le chantier

Une photo déposée ici n'apparaît pas toute seule. Ouvrez
`assets/js/projets.js` et ajoutez le chantier : titre, métier, lieu, année et
la liste de ses photos. La galerie, les filtres et la visionneuse se
construisent automatiquement à partir de ce fichier.

Tant que la liste est vide, la page Réalisations affiche un message d'attente
au lieu d'une grille vide.
