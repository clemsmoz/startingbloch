# StartingBloch Frontend V2

Interface moderne pour la plateforme de gestion de propriété intellectuelle StartingBloch.

## 🚀 Technologies

- **React 18** + **TypeScript**
- **Vite** (Build tool ultra-rapide)
- **Ant Design** (Composants UI professionnels)
- **Framer Motion** (Animations fluides)
- **React Hook Form** (Gestion formulaires)
- **Chart.js** (Graphiques et statistiques)
- **Zustand** (État global)
- **React Query** (Cache et synchronisation données)

## 🏗️ Architecture

```
src/
├── components/          # Composants React réutilisables
│   ├── common/         # Composants génériques
│   ├── auth/           # Authentification
│   ├── brevets/        # Gestion brevets
│   ├── clients/        # Gestion clients
│   ├── contacts/       # Gestion contacts
│   └── cabinets/       # Gestion cabinets
├── pages/              # Pages principales
├── services/           # Services API
├── hooks/              # Hooks React personnalisés
├── types/              # Types TypeScript
├── utils/              # Fonctions utilitaires
├── store/              # État global
├── styles/             # Styles CSS
├── config/             # Configuration
├── layouts/            # Layouts principaux
└── assets/             # Images, icônes
```

## 🛠️ Installation

```bash
# Cloner le repository
git clone [url]
cd frontend-v2

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Démarrer le serveur de développement
npm run dev
```

## 📜 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualiser le build
npm run lint         # Linter ESLint
npm run type-check   # Vérification TypeScript
npm run format       # Formatage Prettier
```

## 🔧 Configuration

### Variables d'environnement

Copiez `.env.example` vers `.env` et ajustez selon votre environnement :

```env
VITE_API_URL=https://localhost:7001
VITE_APP_VERSION=2.0.0
VITE_APP_ENV=development
```

### Proxy API

Le serveur de développement est configuré pour proxifier les requêtes `/api` vers votre backend .NET.

## 🎨 Thème et UI

L'application utilise Ant Design avec un thème personnalisé pour correspondre à l'identité visuelle de StartingBloch.

### Personnalisation du thème

Modifiez `src/config/index.ts` pour ajuster les couleurs et le style :

```typescript
theme: {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
  }
}
```

## 📊 Fonctionnalités principales

- **Dashboard** avec statistiques brevets
- **Gestion clients** avec CRUD complet
- **Gestion brevets** avec suivi statuts
- **Gestion contacts** avec emails/téléphones
- **Authentification JWT** sécurisée
- **Tables avancées** avec tri/filtres
- **Formulaires validés** en temps réel
- **Notifications** utilisateur
- **Mode responsive** mobile/desktop

## 🔐 Authentification

L'application gère l'authentification via JWT avec :
- Login sécurisé
- Refresh tokens automatique
- Protection des routes
- Gestion des rôles utilisateur

## 📱 Responsive Design

Interface optimisée pour :
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (< 768px)

## 🚀 Déploiement

### Cloudflare Pages (pas à pas)

Checklist rapide:
- Repo GitHub connecté à Cloudflare Pages
- Dossier du projet: `frontend-v2`
- Fichier `public/_redirects` présent (SPA) → déjà ajouté
- Variable d’env: `VITE_API_URL` pointant vers l’URL publique de l’API

Étapes:
1) Créer le projet Pages
  - Sur Cloudflare Pages → Create a project → Connect to Git → choisir le repo.
  - Root directory: `frontend-v2`.
2) Config build
  - Build command: `npm ci && npm run build`
  - Output directory: `dist`
  - Node version: 18+ (par défaut OK)
3) Variables d’environnement (Production)
  - `VITE_API_URL=https://<ton-api>.azurewebsites.net` (ou ton domaine API)
  - `VITE_APP_ENV=production` (optionnel)
4) Déployer
  - Lancer le déploiement; vérifier que l’URL publique s’affiche.
5) Vérifier
  - Ouvre l’app → navigation client-side OK (grâce à `public/_redirects`).
  - Les appels API vont vers `VITE_API_URL`. Assure-toi que le backend autorise l’origine (CORS).

Remarques:
- Si le backend n’est pas encore en ligne, tu peux déployer le front, puis mettre à jour `VITE_API_URL` plus tard dans Pages → Settings → Environment Variables → Re-deploy.
- Cloudflare Pages ne peut pas appeler `localhost`; il faut une API publique.

### Build local de production

```bash
npm run build
npm run preview
```

Le dossier `dist/` contient les fichiers optimisés pour la production.

### Variables d'environnement de production

```env
VITE_API_URL=https://api.startingbloch.com
VITE_APP_ENV=production
```

## 🤝 Développement

### Conventions de code

- **ESLint** + **Prettier** pour la cohérence
- **TypeScript strict** activé
- **Composants fonctionnels** avec hooks
- **CSS Modules** ou **styled-components**

### Structure des composants

```typescript
// Exemple de composant type
interface Props {
  data: Client[];
  onEdit: (client: Client) => void;
}

export const ClientList: React.FC<Props> = ({ data, onEdit }) => {
  // Logic here
  return (
    <div>
      {/* JSX here */}
    </div>
  );
};
```

## 📚 Documentation

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Ant Design](https://ant.design/)
- [Framer Motion](https://www.framer.com/motion/)

## 🐛 Support

Pour toute question ou problème, consultez la documentation ou créez une issue.

---

**StartingBloch** © 2025 - Interface moderne de gestion de propriété intellectuelle
