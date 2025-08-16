# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

```bash
# Install dependencies
npm ci

# Frontend development
npm run dev                    # Start Next.js dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Code quality
npm run fmt                    # Check formatting (Biome)
npm run fmt:fix                # Fix formatting (Biome)

# Testing
npm run test:e2e               # Run Playwright tests
npm run test:e2e:update-data   # Update test snapshots

# Firebase Functions (cd functions first)
cd functions && npm ci         # Install function dependencies
npm run build                  # Build functions
npm run build:watch            # Build functions with hot reload
npm run deploy                 # Deploy functions to Firebase

# Firebase Emulators
npm run emulate                # Start all emulators (auth, firestore, functions)
npm run emulate:dry            # Start emulators without data import/export

# Development workflow (3 terminals)
# Terminal 1: cd functions && npm run build:watch
# Terminal 2: npm run emulate
# Terminal 3: npm run dev
```

## Architecture Overview

**FavRec** is a Next.js application for bookmarking and managing favorite web pages with Firebase backend.

### Tech Stack
- **Frontend**: Next.js 15 with static export, React 19, TypeScript
- **UI**: Ant Design + Material-UI, TailwindCSS
- **Backend**: Firebase (Firestore, Auth, Functions, Hosting)
- **Additional**: Algolia search integration, Bluesky posting

### Key Architecture Patterns

**Static Export Configuration**: Next.js configured for static export (`output: 'export'`) to deploy on Firebase Hosting.

**Firebase Functions as API Layer**: Functions handle CORS-restricted operations and server-side logic:
- `recordPageInfo`: Create new favorite records with page metadata
- `updatePageInfo`: Update existing records
- `getCustomToken`: Generate custom Firebase auth tokens
- Algolia and Bluesky integrations

**Provider Pattern**: Multiple context providers wrap the app:
- `FirebaseAuthProvider`: Authentication state
- `SettingsProvider`: User settings management
- `FavConfigProvider`: Theme configuration
- `StyledComponentsRegistry`: Ant Design styling

**Database Structure**:
```
users/{uid}/favs/{recordId} -> FavRecord
users/{uid}/settings -> Settings
users/{uid}/algolia -> AlgoliaIntegration
users/{uid}/bsky -> BskyAccount
```

### Directory Structure
- `src/app/`: Next.js App Router pages
- `src/components/`: React components organized by feature
- `src/lib/`: Shared utilities and providers
- `functions/`: Firebase Cloud Functions
- `firebase/`: Firestore rules and indexes

### Important Configuration Files
- `next.config.js`: Static export configuration
- `firebase.json`: Firebase project configuration with emulator ports
- `biome.json`: Code formatting and linting rules

### Development Notes
- Emulator data persists in `./firebase-emu/` directory
- Functions require build step before emulator use
- Static export means no server-side rendering capabilities
- CORS restrictions handled via Firebase Functions proxy

## Development Tips & Lessons Learned

### Testing and Data Management
- **Test Data Generation**: Use Firebase Admin SDK in `functions/` directory to generate test data for pagination testing:
  ```bash
  cd functions && node -e "/* script to add test records */"
  ```
- **Firestore Emulator**: Always use `process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'` when connecting programmatically
- **Data Cleanup**: Use batch operations for efficient deletion of large datasets
- **UID Discovery**: Check Firebase Emulator UI at `http://localhost:4000` → Authentication tab for user UIDs

### UI/UX Development Patterns
- **Responsive Design**: Use Tailwind's responsive prefixes (`sm:`, `md:`, etc.) for breakpoint-specific layouts
- **Ant Design Limitations**: Pagination component has fixed display limits that cannot be easily overridden
- **Mobile-First Approach**: Design separate layouts for mobile vs desktop rather than trying to force single responsive layout
- **Component State Sync**: Use `current` instead of `defaultCurrent` for controlled Ant Design components

### Common UI Challenges & Solutions
- **Pagination Layout Issues**: 
  - Problem: Text overlap with controls in single-row layout
  - Solution: Separate layouts for mobile (2-row) and desktop (3-column)
- **Center Alignment**: Use `flex justify-center` with `max-w-*` containers for proper centering
- **Responsive Spacing**: Apply different margins/padding for different screen sizes using Tailwind responsive classes

### Code Quality
- **Formatting**: Always run `npm run fmt:fix` before commits
- **Component Organization**: Keep components focused on single responsibility
- **Props Interface**: Use clear TypeScript interfaces for component props
- **State Management**: Minimize state lifting, use contexts for cross-component state

### Commit Guidelines
- **Claude Attribution**: When Claude Code makes commits, it MUST be clearly indicated that Claude made the changes
- **Human-only Commits**: If a commit message does NOT explicitly mention Claude, it indicates NO changes were made by Claude - all changes are human-authored
- **Required Format**: Include "🤖 Generated with [Claude Code](https://claude.ai/code)" and "Co-Authored-By: Claude <noreply@anthropic.com>" in commit messages for Claude-generated changes

### Firebase Specifics
- **Functions Development**: Use `npm run build:watch` for hot reload during development
- **Emulator Setup**: Start emulators before frontend development to avoid connection issues
- **Project ID**: Use consistent project ID (`favrec-4d401`) across environments