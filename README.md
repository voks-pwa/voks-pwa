# Voks PWA - Gamified Mission System

Voks PWA is a progressive web application for managing gamified missions, rewards, and leaderboards with Supabase backend and WordPress integration.

## Features

### 🎯 Mission System
- Complete mission CRUD operations
- Mission statistics tracking
- Status management (active, scheduled, completed)
- WordPress mission updates integration

### 🏆 Reward System  
- Reward catalog management
- Reward redemption history
- Point-based reward system
- User reward tracking

### 📊 Analytics Dashboard
- User, mission, XP, and redemption analytics
- Interactive period filtering (7/30/90 days)
- Bar chart visualizations with recharts
- Loading/error/empty state handling

### 👑 Leaderboard
- Lifetime, weekly, and monthly rankings
- Auto-refresh functionality
- Points and XP tracking

### 📣 Notification System
- Broadcast notifications to all/premium users
- Notification management
- Real-time delivery via Supabase

### ⚙️ Admin Panel
- Analytics dashboard
- Mission management
- Reward catalog
- User management
- Platform settings configuration

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL, Auth, Functions)
- **External API**: WordPress REST API
-(Add missing Vite cache optimization for Swiper integration)

## Recent Updates (2026-07-13)

✅ **Fixed Homepage runtime error** - Resolved "Invalid hook call" issue with Swiper components by:
- Cleared Vite cache (`node_modules/.vite`)
- Added React and Swiper modules to `optimizeDeps.include`
- Fixed unused React import in `HomePage.tsx`

✅ **Enhanced Analytics Module** - Complete analytics dashboard with:
- Full state handling (loading, error, empty, data)
- 6 new analytics components (StatCard, AnalyticsBarChart, PeriodFilter, AnalyticsSkeleton, AnalyticsEmptyState, AnalyticsErrorState)
- Auth verification in edge function
- TypeScript compilation fixes

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Add Supabase and WordPress credentials
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Project Status

✅ Completed modules:
- Mission CRUD operations
- Reward system  
- Leaderboard
- Analytics dashboard
- Notification system
- Admin settings
- Homepage with Swiper integration

⚠️ Known issues: Build errors in Broadcast, Missions, Rewards, Leaderboard modules (pre-existing, not in scope)

## Troubleshooting

If you encounter "Invalid hook call" errors with Swiper:
1. Clear Vite cache: `rm -rf node_modules/.vite`
2. Ensure `optimizeDeps.include` config exists in `vite.config.ts`
3. Check React imports are properly declared

## Expand the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
