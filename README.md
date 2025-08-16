# FAVREC 💓

![Lint](https://github.com/smallkirby/favrec/actions/workflows/lint.yml/badge.svg)
![Test](https://github.com/smallkirby/favrec/actions/workflows/test.yml/badge.svg)
![Deploy Hosting](https://github.com/smallkirby/favrec/actions/workflows/firebase-hosting.yml/badge.svg)
![Deploy Functions](https://github.com/smallkirby/favrec/actions/workflows/firebase-functions.yml/badge.svg)

## Development

```sh
# Install dependencies & Build functions with hot-reload (Shell A)
npm ci
cd functions && npm ci && npm run build:watch &

# Start emulators (Shell B)
npm run emulate

# Start server (Shell C)
npm run dev
```

## Architecture

- Hosting: Firebase Hosting with Next.js static export.
- Functions: Proxies site data fetch to avoid CORS restriction.
- Database: Firebase Firestore.

## Emulators

All the three components can be emulated locally using `firebase-tools`.
You can just run `npm run emulate` to start all the emulators.

Data is imported/exported from/to `./emulator-data` directory.

## Deployment

All the three components are deployed to Firebase using GitHub Actions with the service account.

```sh
# functions
npx firebase deploy --only functions
```

## Commit Guidelines

This project includes changes by Claude Code for development assistance.

- **Claude-authored commits**: When Claude Code makes changes, commits MUST include attribution:
  - "🤖 Generated with [Claude Code](https://claude.ai/code)"
  - "Co-Authored-By: Claude <noreply@anthropic.com>"
- **Human-only commits**: If a commit does NOT mention Claude, it indicates NO Claude involvement - all changes are human-authored.

## Notes / Known Issues

- [FirebaseExtended/action-hosting-deploy](https://github.com/FirebaseExtended/action-hosting-deploy) does not support deployment other than Hosting.
- `firebase-tools` somehow invokes permissin error when running `deploy --only functions,firestore`, while `firebase deploy --only firestore,functions` works fine.
- `firebase-functions` module V2 cannot pass appropriate authorization info to `onCall`. [Known issue](https://github.com/firebase/firebase-tools/issues/5210).
