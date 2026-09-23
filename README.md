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

## SEO

- `apps/web/index.html` carries the title/description, Open Graph and Twitter
  card tags (`og-image.png`, 1200×630), and `WebApplication` JSON-LD.
- `apps/web/src/components/SeoSection.tsx` renders the on-page intro copy and
  FAQ (with `FAQPage` JSON-LD) shown at the bottom of the single-page app.
- `apps/web/public/robots.txt` and `apps/web/public/sitemap.xml` — the site
  has no client-side router, so the sitemap lists only the root URL; add a
  new `<url>` entry there if a real route is ever introduced.
- `apps/web/public/BingSiteAuth.xml` — Bing Webmaster Tools site verification
  file, served at `https://cheqino.ir/BingSiteAuth.xml`.

**Do not add an `AggregateRating` schema** unless there is real, verifiable
rating data (e.g. from an app store listing) to back it — fabricated ratings
violate Google's structured data guidelines and can trigger a manual action.

**Verifying structured data:** after deploying, paste
`https://cheqino.ir/` into the
[Google Rich Results Test](https://search.google.com/test/rich-results) to
confirm the `WebApplication` and `FAQPage` items are picked up without
errors.

**Search Console / Bing Webmaster Tools:**
1. Google Search Console → add property `https://cheqino.ir/` → verify via
   the existing DNS/hosting ownership (GitHub Pages) or an HTML meta tag.
2. Bing Webmaster Tools → add site `https://cheqino.ir/` → verify via the
   `BingSiteAuth.xml` file already served at the site root (or import
   directly from Google Search Console).
3. Submit `https://cheqino.ir/sitemap.xml` in both tools.
