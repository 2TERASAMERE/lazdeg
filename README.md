# FitTracker — Guided by Olivier

Carnet d'entraînement de musculation, mobile-first : suivi des séries en direct, chrono de repos, historique, conseils du coach et résumé à envoyer par WhatsApp.

## Démarrer

Prérequis : Node.js 20+ et [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

Ouvre http://localhost:3000. Sur téléphone (même Wi-Fi), utilise l'adresse réseau affichée par `pnpm dev`.

## Scripts

| Commande | Rôle |
| --- | --- |
| `pnpm dev` | Serveur de développement |
| `pnpm typecheck` | Vérifie le TypeScript |
| `pnpm build` | Construit le site statique dans le dossier `out/` |

## Données

Tout est enregistré dans le navigateur (localStorage). Dans l'onglet **Progression**, tu peux exporter et restaurer une sauvegarde JSON.

## Personnaliser

- Exercices, conseils d'Olivier, programmes : `lib/data.ts`
- Prénom, nom du coach, durées de repos : `lib/config.ts`
- Couleurs et styles : `app/globals.css`

Le détail de l'architecture et des conventions est dans [`CLAUDE.md`](./CLAUDE.md).

## Mettre en ligne (GitHub Pages)

Le site est exporté en pages statiques et publié automatiquement par GitHub à chaque envoi sur la branche `main` (fichier `.github/workflows/deploy.yml`).

1. Pousse le dépôt sur GitHub (branche `main`).
2. Sur GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
3. Onglet **Actions** : attends que « Publier sur GitHub Pages » passe au vert (1 à 2 minutes).
4. Le site est disponible sur `https://TON-PSEUDO.github.io/NOM-DU-DEPOT/`.

Chaque `git push` suivant met le site à jour tout seul.

Tu peux aussi importer le dépôt sur [vercel.com](https://vercel.com) : aucun réglage n'est nécessaire.
