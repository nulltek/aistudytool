# Model Trail

Model Trail is a playful AI study app with a Duolingo-style learning path. It includes Google authentication, full-page lessons, quizzes, Firebase-backed progress, difficulty-based XP rewards, gems, levels, and a 40-division mineral rank ladder.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add the public Firebase web-app configuration before starting the app.

## Production build

```bash
npm ci
npm run build
```

The static production output is written to `dist/`. Firebase Authentication and Firestore provide the backend, so the deployed frontend does not require a separate Render database.

## Hackatime

This repository includes a `.wakatime-project` file so activity is grouped as `model-trail` and generated files are ignored.

1. Sign in at https://hackatime.hackclub.com.
2. Run the command from https://hackatime.hackclub.com/setup to add your private API key.
3. Install the official **Hackatime Time Tracker** editor extension (`hackatime.hackatime-time-tracker`). The workspace recommends it automatically in VS Code.
4. Restart the editor and edit a file for a few minutes, then verify the heartbeat on the Hackatime dashboard.

Do not commit the private API key. Hackatime stores it in your user-level WakaTime configuration.
