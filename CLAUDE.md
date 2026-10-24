# 🏋️‍♂️ FitTracker - Guided by Olivier

## 📌 Contexte du projet
Application web mobile-first de suivi d'entraînement de musculation sur-mesure.
Elle enregistre les séances, suit la progression sur machines et applique un programme personnalisé conçu par un coach ("Olivier"), avec ses conseils spécifiques pour chaque exercice.

Utilisateur actuel : une seule personne (**Akli**, voir `USER_NAME` dans `lib/config.ts`). Les données sont stockées **sur l'appareil** (localStorage, copie de travail qui marche hors ligne) et, si activée, **synchronisées entre appareils** via Supabase (un compte, e-mail + mot de passe).

## 🛠️ Workflow de développement
1. **Étape 1 (Réalisée) :** maquette UI générée avec **v0.dev**.
2. **Étape 2 (Réalisée) :** logique dynamique avec **Claude** : suivi en direct, chrono de repos, historique, programmes, glossaire, progression, partage au coach, sauvegarde locale.
3. **Étape 3 (En cours) :** dépôt sur **GitHub** + publication **GitHub Pages**, tests réels à la salle, ajustement des contenus d'Olivier.
4. **Étape 4 (Réalisée, à activer) :** synchronisation **Supabase** multi-appareils + glossaire éditable. Activation = étapes du README (clés dans `lib/supabase-config.ts`).
5. **Étape 5 (À venir) :** application mobile (voir « Feuille de route »).

## 🚀 Stack & commandes
- **Framework :** Next.js 16 (App Router), React 19, TypeScript strict
- **Styling :** CSS maison dans `app/globals.css` (classes sémantiques) ; Tailwind v4 est installé et sert de base (`@import 'tailwindcss'`)
- **Icônes :** lucide-react
- **Gestionnaire de paquets :** pnpm
- **Cloud :** Supabase (Auth e-mail/mot de passe + une table `app_state`, voir `supabase/setup.sql`), client `@supabase/supabase-js` chargé à la demande
- **Hébergement :** GitHub Pages via export statique (`output: 'export'` dans `next.config.mjs`) ; déploiement automatique par `.github/workflows/deploy.yml`

```bash
pnpm install
pnpm dev         # http://localhost:3000
pnpm typecheck   # vérification TypeScript (à lancer avant chaque commit)
pnpm build       # export statique dans out/ (échoue si une erreur TypeScript existe)
```

## 🗂️ Architecture
```
app/
  layout.tsx            Layout global (lang="fr", dark, viewport mobile)
  page.tsx              Rend <AppShell />
  globals.css           Tous les styles + variables de thème
  icon.svg              Icône de l'app
components/
  app-shell.tsx         Onglets, semaine, programmes (créer/modifier/supprimer), chrono (point d'entrée client)
  topbar.tsx · bottom-nav.tsx · rest-timer-toast.tsx · exercise-icon.tsx · sync-panel.tsx
  workout/              Séance : workout-view, day-strip, exercise-card, set-row (saisie + boutons +/− sur les reps), share-modal
  program/              program-view (planning hebdo + liste des programmes) · program-form (création/édition, séries/reps, glisser-déposer)
  glossary/             glossary-view (fiches + ajout/modif/suppression) · exercise-form
  progress/progress-view  Stats calculées + export/import de sauvegarde
  ui/button.tsx         Composant shadcn (non utilisé pour l'instant)
hooks/
  use-app-state.ts      État global + chargement/sauvegarde automatique
  use-workout.ts        Séance du jour : saisie, validation, notes, repos, fin
  use-rest-timer.ts     Chrono de repos (horodatage de fin, son, vibration)
  use-sync.ts           Synchronisation cloud (connexion, déclencheurs, fusion)
lib/
  types.ts              Modèle de données
  data.ts               Catalogue des exercices + programmes d'Olivier + planning par défaut
  workout.ts            Logique pure : brouillon de séance, volume, historique, ajout des nouveaux exercices à une séance en cours
  summary.ts            Génère le texte à envoyer au coach
  storage.ts            ⭐ SEUL accès au localStorage + normalisation/migration des sauvegardes
  merge.ts              Fusion de deux états, élément par élément (cœur de la synchro)
  sync.ts               Algorithme de synchro (indépendant de Supabase) + interface SyncClient
  supabase-client.ts    Implémentation Supabase de SyncClient
  supabase-config.ts    URL + clé PUBLIQUE du projet (jamais la clé secret/service_role)
  dates.ts · format.ts · config.ts · utils.ts
```

## 🧠 Modèle de données (`lib/types.ts`)
- `Exercise` : fiche machine (nom, muscles, réglages, `coachTip`, `kind` = `strength` | `cardio`).
- `Program` : liste ordonnée de `PlannedExercise` (séries, reps visées, charge de départ, repos). **L'ordre du tableau `items` = l'ordre des exercices dans la séance.**
- `SessionLog` : séance réalisée un jour donné. Clé = `AAAA-MM-JJ__idProgramme`. Contient, par exercice, les séries `{weight, reps, done}`, la note de ressenti (texte multiligne) et le repos choisi.
- `AppState` : `exercises` (catalogue complet, modifiable, copié depuis `DEFAULT_EXERCISES` au premier lancement), `customPrograms`, `assignments` (7 jours, lundi → dimanche) + `assignmentsUpdatedAt`, `sessions`.
- Les programmes d'Olivier restent dans `lib/data.ts` (non sauvegardés, non modifiables directement). Les exercices, eux, vivent dans l'état : ils sont éditables et synchronisés.
- **Catalogue :** `getExercise(id)` (lib/data.ts) lit un registre mis à jour par `setCatalog(state.exercises)` à chaque rendu de `AppShell`. La logique pure (volume, résumé, historique) l'utilise sans recevoir le catalogue en paramètre.

## 🧩 Programmes (création, modification, ordre)
- **Programmes d'Olivier** (`lib/data.ts`) : lecture seule. Le bouton « Dupliquer pour modifier » en crée une copie (`custom-…`, nom « … (copie) ») qui s'ouvre directement en édition.
- **Programmes personnalisés** (id commençant par `custom-`, voir `isCustomProgram`) : modifiables et supprimables via `ProgramForm`. `AppShell` expose `createProgram`, `updateProgram` (met `updatedAt`) et `deleteProgram` (pierre tombale).
- **`ProgramForm`** sert à créer **et** à modifier. Pour chaque exercice : séries et reps (durée en minutes pour le cardio). Les champs sont gardés en texte pendant la saisie puis bornés à l'enregistrement (séries 1–10, reps 1–100, cardio 1–180 min). Les `startWeight` et `restSeconds` existants sont conservés ; un exercice ajouté prend 3 × 10, repos 60 s (cardio : 1 série, repos 0).
- **Changer l'ordre :** poignée ⠿ (`.drag-handle`) avec *pointer events* (aucune dépendance), donc au doigt et à la souris. Au clavier : flèches haut/bas sur la poignée. La poignée doit garder `touch-action: none`, sinon la page défile au lieu de glisser.
- **Séance du jour déjà commencée :** si on ajoute des exercices au programme, `withNewExercises` (lib/workout.ts) les ajoute à la séance enregistrée. Les modifications de séries/reps ne s'appliquent qu'aux séances suivantes (les séances passées ne changent jamais).
- **Reps d'une nouvelle séance :** `buildDraftSession` (lib/workout.ts) prend **toujours** les reps dans la cible du programme (`item.target`). Seul le **poids** est repris de la séance précédente (sinon `startWeight`). Ne pas réintroduire le pré-remplissage des reps depuis l'historique : il masquait les modifications faites dans le programme.

## 🔄 Règles de synchronisation (à respecter à chaque nouvelle fonctionnalité)
- **Toute modification d'un exercice, programme ou séance doit mettre à jour `updatedAt`** (`Date.now()`), y compris le planning (`assignmentsUpdatedAt`). C'est ce qui décide quelle version gagne à la fusion.
- **Ne jamais retirer un élément d'un tableau pour le supprimer** : on le marque `deleted: true` + `updatedAt` (« pierre tombale »). Sinon l'autre appareil le ressuscite. Les listes affichées filtrent `!deleted` ; l'historique des séances garde l'accès aux exercices supprimés via `getExercise`.
- Fusion par élément : le plus récent gagne, à égalité choix déterministe. `mergeStates` doit rester commutatif et idempotent (testé).
- L'état entier est stocké en un seul JSON dans la table `app_state` (une ligne par utilisateur, numéro de version pour détecter les écritures simultanées). Si les données grossissent trop, passer à une table par type d'élément.
- Déclencheurs : 2 s après une modification (`DEBOUNCE_MS`), retour sur l'app, retour du réseau, et vérification périodique **toutes les 24 h** (`POLL_MS = 86_400_000` dans `hooks/use-sync.ts`, valeur choisie volontairement). La synchro est facultative : sans configuration l'app reste 100 % locale.

## ⚙️ Comportements clés (à ne pas casser)
- **Validation rapide :** bouton ✓ de 44 px. Valider une série lance le chrono avec le repos de l'exercice (préréglages 0:30 / 1:00 / 1:30 / 2:00), **sauf** pour le cardio (repos = 0) et pour la **toute dernière série** de la séance.
- **Saisie des reps :** chaque série a un champ texte (clavier numérique) encadré par deux boutons **−** / **+** (`.stepper` dans `set-row.tsx`). Les boutons partent de la valeur saisie (vide = 0), ne descendent jamais sous 0 et passent par `onChange('reps', …)`, donc par `setField` qui filtre déjà les caractères. Même fonctionnement pour la durée du cardio. La colonne des reps est plus large que celle du poids (`1.7fr`) pour loger les boutons.
- **Note de ressenti :** `<textarea>` (2 lignes minimum, redimensionnable) : Entrée = retour à la ligne. Les retours à la ligne sont conservés dans le résumé envoyé au coach.
- **Enchaînement :** quand un exercice est terminé, le suivant s'ouvre automatiquement.
- **Chrono :** basé sur l'heure de fin (`endsAt`), pas sur un compteur : reste juste si l'écran se verrouille. Boutons −15 s / +15 s / Passer. Fin = vibration + 3 bips.
- **Historique :** « Dernière séance » = meilleure série validée de la séance précédente **du même programme**. Le **poids** est pré-rempli depuis cette séance ; les **reps** viennent de la cible du programme.
- **Brouillon :** une séance n'est enregistrée (et ne compte dans la progression) qu'à partir de la première modification.
- **Partage :** `buildSummary()` produit le texte ; boutons WhatsApp (`wa.me`), partage natif, copie.

## 📏 Conventions
- Interface et textes **en français**. Sentence case.
- **Données :** ne jamais appeler `localStorage` en dehors de `lib/storage.ts`, ni Supabase en dehors de `lib/supabase-client.ts`. Tout nouveau champ de l'état doit être géré dans `normalizeState` (valeur par défaut pour les anciennes sauvegardes) et dans `mergeStates`.
- **React :** les fonctions passées à `setState(fn)` doivent rester pures (pas d'appel à un autre `setState` ni à un callback parent dedans).
- **Hydratation :** l'état local n'est lu qu'après montage (`ready` dans `use-app-state`). Ne pas afficher de dates ou de données locales avant.
- **Mobile à la salle :** cibles tactiles ≥ 44 px de haut (les boutons +/− font 32 px de large pour 44 px de haut, faute de place) ; champs de saisie à **16 px minimum** (sinon iOS zoome) ; `inputMode="decimal"` / `"numeric"`.
- **Styles :** ajouter des classes dans `globals.css` en réutilisant les variables (`--primary`, `--amber`…). Pas de nouvelles dépendances sans en discuter (le glisser-déposer des programmes est fait à la main, sans bibliothèque).
- **Site statique obligatoire :** pas d'API routes, de Server Actions, de middleware ni de rendu dynamique côté serveur (ils casseraient l'export GitHub Pages et le futur Capacitor). Le workflow définit `BASE_PATH=/nom-du-depot` ; en local il est vide. Pour les liens et images, rester sur les composants/chemins Next (le `basePath` est géré automatiquement).
- **Avant de livrer :** `pnpm typecheck` et `pnpm build` doivent passer. `ignoreBuildErrors` a été retiré volontairement.

## 🎨 Directives de style & UI/UX
- **Thème :** dark par défaut (fond `#101211`).
- **Accents :** vert électrique `#c4f34a` pour validation/succès ; ambre `#e3ad54` pour les « Conseils d'Olivier ». Bleu et violet pour distinguer les programmes.
- **UX :** mobile-first, boutons larges utilisables d'une seule main.

## 🔑 Fichiers personnels de l'utilisateur
- `lib/supabase-config.ts` contient l'URL et la clé publique Supabase de l'utilisateur, saisies par lui sur GitHub. **Ne pas le remplacer ni l'inclure dans une mise à jour** (sauf demande explicite) : cela couperait la synchronisation.
- `lib/config.ts` : le prénom est **`USER_NAME = 'Akli'`** (valeur confirmée par l'utilisateur). Ne pas le remplacer ni l'écraser dans une mise à jour.
- `hooks/use-sync.ts` : **`POLL_MS = 86_400_000`** (24 h) est une valeur voulue par l'utilisateur. La conserver lors de toute modification de ce fichier. Le commentaire du fichier et le README indiquent bien « toutes les 24 heures ».

## ✍️ Contenus à remplacer par Olivier
Dans `lib/data.ts` : les **réglages machines**, les **conseils** (`coachTip`) des exercices hors jambes, les **charges de départ** (`startWeight`) et la composition des programmes Push/Pull sont des exemples. À faire valider par Olivier. Le nom du coach est dans `lib/config.ts`.

## 🗺️ Feuille de route
- [ ] Tester à la salle et corriger l'ergonomie (notamment la largeur des boutons +/− sur petit écran).
- [x] Éditer un programme existant (séries, reps, ordre) : fait via `ProgramForm` ; les programmes d'Olivier se dupliquent pour être modifiés.
- [x] Boutons +/− sur les reps (et la durée du cardio), saisie au clavier conservée.
- [x] Note de ressenti sur plusieurs lignes.
- [ ] Boutons +/− sur le poids (pas de 2,5 kg).
- [ ] Modifier la charge de départ et le temps de repos de chaque exercice depuis le formulaire de programme.
- [ ] Courbe de progression par exercice (meilleure charge dans le temps).
- [ ] Empêcher la mise en veille de l'écran pendant une séance (Wake Lock API).
- [ ] Ajouter des tests automatisés (Vitest + Testing Library) ; le flux validation → chrono → sauvegarde → résumé a été vérifié ainsi en local mais les tests ne sont pas dans le dépôt.
- [ ] **Application mobile :**
  1. *PWA* : manifest + icônes PNG 192/512 + service worker → installable depuis le navigateur.
  2. *Capacitor* (si besoin du store ou de notifications) : garder l'app **exportable en statique** (`output: 'export'`), donc pas d'API routes ni de Server Actions côté Next ; notifications locales pour le chrono quand l'app est en arrière-plan (limite actuelle : écran verrouillé = pas de bip).

## ⚠️ Limites connues
- Sans synchronisation, les données restent sur l'appareil : effacer les données du navigateur les supprime. Avec la synchronisation, le cloud sert de copie. L'onglet **Progression** permet aussi d'exporter/restaurer un fichier JSON.
- Synchronisation : pas de temps réel (vérification 2 s après une modification, au retour sur l'app / du réseau, et toutes les 24 h). Supprimer un exercice utilisé dans un programme le fait disparaître de ce programme (les séances passées le gardent). Les projets Supabase gratuits peuvent être mis en pause après une période d'inactivité.
- Modifier un programme ne change pas les séances déjà enregistrées : seuls les exercices ajoutés apparaissent dans une séance du jour déjà commencée (les exercices retirés ou les séries/reps modifiées y restent tels quels). Les reps modifiées ne se voient donc que sur une séance neuve (autre jour, ou séance du jour pas encore touchée).
- Le son et la vibration du chrono ne fonctionnent que si l'app est au premier plan (la vibration n'existe pas sur iOS Safari).
- La semaine affichée est calculée au chargement ; si l'app reste ouverte après minuit, recharger la page.
