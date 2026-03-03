# VMA Tracker — Progressive Web App

Application EPS pour le suivi en temps réel de la vitesse en course de durée.

## Fonctionnalités

- Configuration de la séance (piste, plots, séries)
- Profils de 2 coureurs avec VMA et projets de vitesse
- Chronomètre de série avec barre de progression
- Bouton PLOT pour l'observateur (passage devant un plot)
- Bouton MARCHE pour signaler un intervalle de marche
- Tableau des passages en temps réel (colonnes = tranches de 1min30)
- Feedback visuel : DANS LA ZONE / TROP RAPIDE / TROP LENT (±0,5 km/h)
- Alternance coureur 1 / coureur 2 sans perte de données
- Export CSV et Excel (.xls)
- **Fonctionne hors ligne** après la première visite (PWA)

## Arborescence du projet

```
vma-tracker/
├── index.html          ← Application principale
├── manifest.json       ← Manifeste PWA
├── service-worker.js   ← Service Worker (cache offline)
├── icons/
│   ├── icon-192.png    ← Icône 192×192
│   ├── icon-512.png    ← Icône 512×512
│   └── icon-512.svg    ← Icône source SVG
└── README.md           ← Ce fichier
```

## Déploiement sur GitHub Pages

1. Créer un dépôt GitHub (ex: `vma-tracker`)
2. Déposer tous les fichiers à la racine du dépôt
3. Activer GitHub Pages : **Settings → Pages → Source : main branch / root**
4. L'URL sera : `https://votre-compte.github.io/vma-tracker/`

## Installation sur tablette (Android / iOS)

### Android (Chrome)
1. Ouvrir l'URL de l'application dans Chrome
2. Une bannière "Ajouter à l'écran d'accueil" apparaît automatiquement
3. Sinon : Menu (⋮) → "Ajouter à l'écran d'accueil"
4. L'application s'installe comme une app native

### iOS (Safari)
1. Ouvrir l'URL dans Safari
2. Bouton Partager (📤) → "Sur l'écran d'accueil"
3. Confirmer → l'icône VMA Tracker apparaît sur l'écran d'accueil

## Fonctionnement hors ligne

Après la première visite avec connexion internet :
- Tous les fichiers sont mis en cache automatiquement
- L'application fonctionne ensuite **sans connexion**
- Une bannière apparaît quand une mise à jour est disponible

## Mise à jour de l'application

Pour mettre à jour l'app après modification :
1. Modifier `CACHE_NAME` dans `service-worker.js` (ex: `vma-tracker-v2`)
2. Redéployer les fichiers sur GitHub Pages
3. Les utilisateurs verront une bannière de mise à jour

## Notes pédagogiques

- Chaque colonne = 1 minute 30 secondes
- Avec des plots à 25m, chaque clic = 25m parcourus
- La vitesse théorique est calculée par rapport au temps écoulé dans la colonne
- Zone acceptable : ±0,5 km/h par rapport à la vitesse cible
