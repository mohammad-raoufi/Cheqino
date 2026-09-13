# Cheqino

🔗 **Live app:** [https://cheqino.ir](https://cheqino.ir)

Cheqino — A modern cheque management and reminder app. Track cheques, due dates, payment status, and important details in one place, with timely reminders to help you stay organized and never miss a cheque. Persian-first, RTL-friendly.

## Structure

```
apps/
  web/            Vite/React PWA (the main app, served at cheqino.ir)
mobile/
  android/        Capacitor Android wrapper around apps/web
packages/
  shared/         Shared types, domain logic, and Firebase/notifications setup
  ui/             Shared UI components (e.g. the Shamsi date picker)
```

`apps/web` and `mobile/android` both depend on `@cheqino/shared` and `@cheqino/ui` via npm workspaces.

## Development

```bash
npm install
npm run dev     # web app, from repo root
```

To build and sync the Android app after web changes:

```bash
cd mobile/android
npm run sync         # builds apps/web and copies it into the Android project
npm run build:debug  # assembles the debug APK
```

Requires JDK 21 for the Android build (pinned via `mobile/android/android/gradle.properties`).

## CI/CD

- `.github/workflows/pwa.yml` — builds and deploys the web app to GitHub Pages, and runs the daily reminder check.
- `.github/workflows/android.yml` — builds the Android debug APK.
- `.github/workflows/ios.yml` — placeholder until an iOS project exists.
