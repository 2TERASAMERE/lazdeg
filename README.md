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

Tout est enregistré dans le navigateur (localStorage), donc l'app fonctionne même sans connexion. Pour retrouver tes données sur plusieurs appareils (PC, iPhone…), active la **synchronisation** (section suivante). Dans l'onglet **Progression**, tu peux aussi exporter et restaurer une sauvegarde JSON.

## Synchronisation (PC ↔ téléphone)

Facultative. Elle utilise [Supabase](https://supabase.com) (gratuit) : un seul compte, protégé par mot de passe, et tes exercices, programmes et séances sont fusionnés entre tous tes appareils. À faire une seule fois :

1. **Crée un projet** sur supabase.com (« New project »). Note le mot de passe de la base, choisis une région en Europe. Les projets gratuits peuvent être mis en pause après une période d'inactivité (environ une semaine) : un clic dans le tableau de bord suffit à les réactiver, sans perte de données.
2. **Crée la table :** menu **SQL Editor** → **New query** → colle tout le contenu du fichier `supabase/setup.sql` → **Run**.
3. **Crée ton compte :** menu **Authentication → Users → Add user → Create new user**. Renseigne ton e-mail et un mot de passe, et coche **Auto Confirm User**.
4. **Ferme les inscriptions** pour que personne d'autre ne puisse créer de compte : **Authentication → Sign In / Providers → Email** (le nom du menu peut varier un peu) et désactive **Allow new users to sign up**.
5. **Récupère les deux valeurs publiques :** **Project Settings → API Keys**. Copie l'**URL du projet** et la clé **Publishable** (ou, selon ton projet, la clé **anon** de l'onglet « Legacy »). ⛔ Ne copie jamais la clé **secret** ou **service_role**.
6. **Colle-les dans `lib/supabase-config.ts`** (entre les guillemets de `SUPABASE_URL` et `SUPABASE_PUBLIC_KEY`), puis enregistre. Ces deux valeurs peuvent être publiques : tes données sont protégées par ton mot de passe et par les règles de la base.
7. Une fois le site republié, ouvre **Progression → Synchronisation** et connecte-toi avec l'e-mail et le mot de passe de l'étape 3. Fais de même sur chaque appareil.

Ensuite, tout se synchronise automatiquement : quelques secondes après chaque modification, quand tu reviens sur l'app, et toutes les minutes. Si tu modifies des choses différentes sur deux appareils, elles sont fusionnées. Si tu modifies *le même élément* sur les deux, la modification la plus récente l'emporte.

## Personnaliser

- Exercices et conseils d'Olivier : directement dans l'app, onglet **Glossaire** (ajouter, modifier, supprimer). Valeurs de départ : `lib/data.ts`
- Programmes d'Olivier par défaut : `lib/data.ts`
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
