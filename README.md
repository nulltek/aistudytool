# Model Trail

Model Trail is an English-language AI learning application inspired by the progression style of Duolingo. Learners follow an animated checkpoint path, complete full-page lessons and quizzes, earn XP and gems, advance through mineral ranks, choose an AI model, and unlock a specialist learning track.

The application is a React single-page app backed by Firebase Authentication and Cloud Firestore. It can be hosted as a static site on Render; a separate Render database service is not required.

## Table of contents

- [Main features](#main-features)
- [Learning structure](#learning-structure)
- [Practice system](#practice-system)
- [Rewards and ranks](#rewards-and-ranks)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Local development](#local-development)
- [Firebase setup](#firebase-setup)
- [Environment variables](#environment-variables)
- [Database model](#database-model)
- [Security model](#security-model)
- [Available commands](#available-commands)
- [Deploying to Render](#deploying-to-render)
- [Editing course content](#editing-course-content)
- [Hackatime setup](#hackatime-setup)
- [Quality checks](#quality-checks)
- [Current limitations](#current-limitations)

## Main features

### Guided learning path

- Animated, cartoon-like checkpoint paths.
- Section gates that unlock after the required lessons are complete.
- Full-page lesson experiences instead of modal windows.
- A progress bar and quit control at the top of every lesson.
- A multiple-choice quiz at the end of every lesson.
- Responsive layouts for desktop, tablet, and mobile screens.
- GSAP-based entrance, scroll, path, and reward animations.

### Adaptive AI model guidance

The model chooser recommends one of five supported AI routes:

- ChatGPT and Codex
- Claude and Claude Code
- Gemini and Gemini CLI
- Llama models through Ollama
- DeepSeek

The learner can accept the recommendation or select another model. Later lessons adapt their titles, instructions, official documentation links, quizzes, skills system, project-memory convention, and extension workflow to that selection.

Examples include:

- Codex Agent Skills, `AGENTS.md`, plugins, and MCP servers.
- Claude Code Agent Skills, `CLAUDE.md`, plugins, and MCP servers.
- Gemini CLI skills, `GEMINI.md`, and Gemini CLI extensions.
- Ollama prompt workflows, `Modelfile` instructions, and API tool calling.
- DeepSeek client-managed workflows, project guides, and API tool calls.

If a chosen model does not provide an official GUI or CLI route, the corresponding setup checkpoint is skipped safely. The learner receives its reward automatically and is not encouraged to install an unofficial replacement.

### Authentication and saved profiles

- Google sign-in through Firebase Authentication.
- Automatic learner-profile creation after the first successful sign-in.
- Realtime synchronization of profile data and completed lessons.
- Saved AI-model choice and specialist-track choice.
- Saved theme, sound, and reduced-motion preferences.
- Reversible profile deactivation. Deactivation signs the learner out but preserves XP, gems, ranks, choices, and lesson history.

### Appearance and accessibility

- Light theme.
- Dark theme.
- System theme that follows the operating-system preference.
- Optional practice sound effects.
- Reduced-motion mode for decorative animations and transitions.
- English interface and course content.

## Learning structure

Model Trail contains 69 lesson definitions across the full course catalog. A learner sees 37 lessons on their active path: 21 shared lessons and 16 lessons from the selected specialist track.

### Shared course

| Section | Lessons | Topics |
| --- | ---: | --- |
| AI basics | 3 | What AI is, AI history, LLMs and models |
| Choose your AI toolkit | 4 | Popular models, model recommendation, GUI setup, CLI setup |
| Prompting fundamentals | 5 | Productive AI use, prompt anatomy, context, examples, verification |
| Reusable skills | 3 | Understanding, creating, and reviewing skills or equivalent workflows |
| Project instructions | 3 | Project-guide files, clear rules, and instruction scope |
| Extensions and tools | 3 | Integration concepts, connecting a tool, and extension security |

The final nine shared lessons are generated for the learner's chosen AI. The app teaches native features where they exist and clearly labels client-managed equivalents where they do not.

### Specialist tracks

After completing the shared AI-usage lessons, the learner selects one of three directions:

- Coding
- Research
- Automation

Each direction contains four sections with four lessons per section.

#### Coding

1. Coding foundations
2. Build features with AI
3. Debug and test
4. Ship code safely

#### Research

1. Research foundations
2. Analyze sources
3. Synthesize findings
4. Publish trustworthy research

#### Automation

1. Automation foundations
2. Build a workflow
3. Make automation reliable
4. Scale automation safely

The selected track is stored in Firestore. Learners can switch tracks without deleting progress already earned in another track.

## Practice system

The Practice page supports two modes.

### Focused section practice

- Every visible section has a deterministic bank of exactly 100 distinct questions.
- Question banks are built from the real lesson slides, concepts, titles, and end-of-lesson quizzes.
- Every eligible lesson in the section is represented in its bank.
- A section becomes available for practice after the learner completes at least one lesson in it.
- Questions are drawn only from lessons that learner has completed.

### General revision

- Combines question banks from all visible sections.
- Includes only completed lessons.
- Produces a mixed review across the learner's completed material.

Every practice session contains five questions selected with browser cryptographic randomness. A session does not repeat a question. The interface gives immediate correct or incorrect feedback, shows an explanation, tracks the score, and allows a fresh randomized retry.

Practice sessions currently do not award XP or gems. Rewards remain tied to first-time lesson quiz completion.

## Rewards and ranks

Rewards use fixed difficulty tiers. They do not increase merely because a lesson appears later in the course.

| Difficulty | XP | Gems |
| --- | ---: | ---: |
| Easy | 50 | 10 |
| Medium | 75 | 15 |
| Hard | 100 | 20 |

XP determines the learner's level. The required total for a level follows this formula:

```text
XP required for level n = 50 × (n - 1) × n
```

There are 40 mineral ranks: eight mineral families with five divisions each.

1. Bronze I–V
2. Silver I–V
3. Gold I–V
4. Platinum I–V
5. Emerald I–V
6. Sapphire I–V
7. Ruby I–V
8. Diamond I–V

## Technology

| Area | Technology |
| --- | --- |
| UI | React 18 and TypeScript |
| Build tool | Vite 6 |
| Authentication | Firebase Authentication with Google sign-in |
| Database | Cloud Firestore |
| Motion | GSAP, ScrollTrigger, and `@gsap/react` |
| Icons | Lucide React |
| Typography | Geist Variable plus the Satoshi and Cabinet Grotesk web families |
| Styling | Custom responsive CSS |
| Linting | ESLint 9 with TypeScript and React rules |
| Hosting | Static-site deployment on Render |

## Project structure

```text
.
├── src/
│   ├── App.tsx             # Routing and all major application screens
│   ├── adaptiveUsage.ts    # Model-specific skills, project-guide, and extension lessons
│   ├── firebase.ts         # Authentication, profile, completion, and preference operations
│   ├── lessonData.ts       # Core lessons, adaptive lesson shells, and specialist tracks
│   ├── main.tsx            # React entry point
│   ├── modelGuide.ts       # Model chooser data and adaptive installation lessons
│   ├── practiceData.ts     # 100-question section banks and five-question selection
│   ├── progression.ts      # XP levels and mineral rank ladder
│   └── styles.css          # Layout, themes, motion, responsive UI, and component styling
├── .env.example            # Required public Firebase web configuration keys
├── .firebaserc             # Default Firebase project alias
├── .wakatime-project       # Hackatime/WakaTime project grouping and exclusions
├── eslint.config.js        # ESLint flat configuration
├── firebase.json           # Firebase Authentication and Firestore configuration
├── firestore.rules         # Firestore authorization and reward validation
├── firestore.indexes.json  # Firestore index configuration
├── package.json            # Dependencies and npm commands
└── vite.config.ts          # Vite configuration
```

The app uses hash-based routes such as `#/practice`, `#/settings`, `#/profile`, and `#/lesson/<lesson-id>`. This allows a static host to serve the application without custom server rewrite rules for each page.

## Local development

### Prerequisites

- Node.js 20 LTS or newer is recommended.
- npm, included with Node.js.
- A Firebase project with a registered web application.
- Firebase CLI if you need to deploy or test Firestore rules.

### Install and start

1. Clone the repository.

   ```bash
   git clone https://github.com/nulltek/aistudytool.git
   cd aistudytool
   ```

2. Install exact dependencies from the lockfile.

   ```bash
   npm ci
   ```

3. Copy the environment template.

   PowerShell:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   macOS or Linux:

   ```bash
   cp .env.example .env.local
   ```

4. Add the Firebase web-app values to `.env.local`.

5. Start Vite.

   ```bash
   npm run dev
   ```

6. Open the URL printed by Vite. The default is usually:

   ```text
   http://127.0.0.1:5173/
   ```

Do not commit `.env.local`. The repository ignores files ending in `.local`.

## Firebase setup

### Create and configure the project

1. Create a Firebase project.
2. Register a web application inside the project.
3. Copy its web configuration values into `.env.local`.
4. Enable Cloud Firestore.
5. Enable Google as a Firebase Authentication sign-in provider.
6. Set the public-facing application name and support email for the Google provider.
7. Add local and production hosts to Firebase Authentication's authorized domains.

For local development, authorize the host you actually use, such as `localhost` or `127.0.0.1`. For production, authorize the Render hostname.

### Connect the Firebase CLI

Install the CLI when needed:

```bash
npm install --global firebase-tools
firebase login
```

This repository currently points to the following default Firebase project in `.firebaserc`:

```text
modeltrail-ai-study-2026
```

To use another project:

```bash
firebase use --add
```

### Deploy Firestore rules

```bash
firebase deploy --only firestore:rules
```

Deploy updated rules whenever lesson IDs, reward tiers, or writable profile fields change.

## Environment variables

All frontend variables use Vite's `VITE_` prefix.

| Variable | Purpose |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage-bucket identifier |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Registered Firebase web-application ID |

Example:

```dotenv
VITE_FIREBASE_API_KEY=your_public_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_web_app_id
```

Firebase web configuration is used by the browser to identify the project. It is not an administrative secret. Security depends on Firebase Authentication, restrictive Firestore rules, and careful control of privileged server credentials. Never place a Firebase Admin private key or service-account JSON in a Vite environment variable.

## Database model

### User profile

```text
users/{uid}
```

Important fields include:

| Field | Description |
| --- | --- |
| `displayName` | Google display name or learner fallback name |
| `email` | Account email; immutable through normal profile updates |
| `photoURL` | Google profile image URL |
| `chosenModel` | Selected AI-model identifier |
| `focusTrack` | `coding`, `research`, or `automation` |
| `preferences.theme` | `light`, `dark`, or `system` |
| `preferences.soundEnabled` | Practice sound preference |
| `preferences.reducedMotion` | Reduced-motion preference |
| `deactivated` | Whether the learner profile is paused |
| `createdAt` / `updatedAt` | Firestore server timestamps |

The profile also contains initial XP, gem, level, rank, and completion-count fields for schema compatibility. The current UI derives authoritative totals from secure completion documents.

### Lesson completion

```text
users/{uid}/completedLessons/{lessonId}
```

Each completion contains:

```text
lessonId
xp
gems
quizScore
completedAt
```

The client watches completion documents in realtime. It calculates total XP, gems, level, rank, and completed-lesson count from the matching lesson definitions. This prevents a normal profile update from directly awarding arbitrary currency or rank.

## Security model

`firestore.rules` applies these important controls:

- A user can read only their own profile and completion documents.
- A new profile must begin at zero XP, zero gems, level 1, Bronze I, and zero completions.
- Normal profile updates can change only approved identity, choice, preference, and deactivation fields.
- Model and specialist-track values must come from explicit allowlists.
- Preference objects accept only approved keys and value types.
- A lesson completion can be created only once.
- Completion rewards must match the server-side lesson-ID and difficulty allowlists.
- A passing completion must have a quiz score of 1 and use a server timestamp.
- Completion documents cannot be updated or deleted by the client.
- Profile documents cannot be deleted by the client.

When adding a new rewarded lesson, update both `src/lessonData.ts` and `firestore.rules`. A lesson missing from the rules allowlist will display correctly but its reward write will be rejected.

## Available commands

| Command | Action |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check the project and create a production build |
| `npm run lint` | Run ESLint across the repository |
| `npm run preview` | Serve the generated `dist/` build locally |

Recommended verification before pushing:

```bash
npm run lint
npm run build
```

## Deploying to Render

Model Trail should be deployed as a Render Static Site.

### Render configuration

| Setting | Value |
| --- | --- |
| Repository | `https://github.com/nulltek/aistudytool` |
| Branch | `main` |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist` |

Add every variable from `.env.example` to the Render service's environment settings. Use the production Firebase web-app values.

After Render assigns a hostname:

1. Add that hostname to Firebase Authentication's authorized domains.
2. Confirm Google sign-in completes on the deployed site.
3. Complete a test lesson and confirm the completion document is created.
4. Test light and dark themes.
5. Open Practice and confirm a section produces five questions.

The production frontend communicates directly with Firebase. Do not create a separate Render database unless the architecture later gains a server-owned backend.

## Editing course content

### Standard lessons

Standard lesson content lives in `src/lessonData.ts`. Every lesson needs:

- A stable, unique `id`.
- A full title and short checkpoint title.
- Description and estimated duration.
- Difficulty and matching reward tier.
- Color and illustration type.
- One or more lesson slides.
- A four-option final quiz with a correct index and explanation.

Do not change a published lesson ID casually. Completion documents use the ID as their document key.

### Adaptive installation lessons

Model options, recommendation weights, GUI availability, CLI availability, setup steps, commands, and official sources live in `src/modelGuide.ts`.

### Adaptive skills and tool lessons

Model-specific skills, project-guide, extension, MCP, and tool-calling content lives in `src/adaptiveUsage.ts`.

When documenting provider features:

- Prefer official documentation.
- Do not claim native support where only a client wrapper provides it.
- Keep security boundaries and permissions explicit.
- Avoid recommending unofficial installers.

### Specialist lessons

Coding, research, and automation section seeds live in `src/lessonData.ts`. Each specialist direction currently contains four sections with four lessons each.

### Practice questions

`src/practiceData.ts` creates section banks from the actual lesson material. The generator must continue to satisfy these invariants:

- Exactly 100 questions per section bank.
- 100 distinct question prompts per full bank.
- Coverage for every eligible lesson in the section.
- Five unique questions per practice session.
- Completed-lesson filtering before a learner begins practice.

After changing lesson content, run the normal lint and build commands and verify representative practice banks.

## Hackatime setup

This repository includes `.wakatime-project` so Hackatime groups activity under `model-trail` and ignores generated or dependency folders.

Ignored activity directories include:

- `node_modules/`
- `dist/`
- `.git/`
- `.agents/`
- `outputs/`
- `work/`

Setup steps:

1. Sign in at [Hackatime](https://hackatime.hackclub.com/).
2. Open the [Hackatime setup page](https://hackatime.hackclub.com/setup).
3. Follow its command to store your private API key in your user-level WakaTime configuration.
4. Install the `hackatime.hackatime-time-tracker` editor extension. The repository recommends it through `.vscode/extensions.json`.
5. Restart the editor.
6. Edit a tracked source file for several minutes.
7. Confirm a heartbeat appears on the Hackatime dashboard under `model-trail`.

Never commit the Hackatime API key. The key belongs in the user's WakaTime configuration, not in this repository or its environment files.

## Quality checks

Before merging a change:

1. Run `npm run lint`.
2. Run `npm run build`.
3. Run `git diff --check`.
4. Test Google sign-in.
5. Test at least one lesson and reward write.
6. Test Practice with completed and locked sections.
7. Test light and dark themes.
8. Test narrow mobile and wide desktop layouts.
9. Deploy Firestore rules if lesson IDs, rewards, or profile fields changed.

The production build may report a large JavaScript chunk warning. The build still succeeds. Route-level code splitting is a future performance improvement.

## Current limitations

- The interface is English-only.
- Practice does not currently award XP or gems.
- Profile deactivation is reversible and does not delete Firebase Authentication or Firestore data.
- Streak display is currently presentational rather than calendar-backed.
- The app uses one client bundle; route-level lazy loading is not implemented yet.
- Email or push study reminders are not implemented.
- The app depends on Firebase availability and project quotas.

## Repository

Source code: [github.com/nulltek/aistudytool](https://github.com/nulltek/aistudytool)
