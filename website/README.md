# YW2 LLC Astro Website

Static Astro 6 migration of the YW2 LLC marketing website.

## Requirements

- Node.js 22.12 or newer
- npm 10 or newer

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Astro will print the local development URL, normally `http://localhost:4321`.

## Production build

```bash
npm run check
npm run build
npm run preview
```

The deployable static site is generated in `dist/`.

## Project structure

```text
src/
├── components/    Page sections and their browser behavior
├── layouts/       Shared document metadata, GTM, CSP, and structured data
├── pages/         File-based routes
└── styles/        Global design system and responsive styles
public/            Favicons, social images, robots.txt, sitemap, and host headers
```

## Environment variables

All current variables are public browser/build configuration, not secrets:

- `PUBLIC_CONTACT_API_URL`
- `PUBLIC_HERO_INTRO_VIDEO_URL`
- `PUBLIC_HERO_LOOP_VIDEO_URL`

The contact API must still validate, sanitize, rate-limit, and protect against spam server-side.

## Caching model

- The page is prerendered at build time.
- Astro-generated assets under `/_astro/` are content-hashed and safe to cache immutably.
- The contact-form `POST` explicitly uses `cache: 'no-store'`.
- `public/_headers` provides Cloudflare Pages-compatible cache/security defaults. Other hosts may require equivalent configuration.

## Migration notes

- No React or client framework was added.
- Site-wide JavaScript was divided among the components that own each behavior.
- The hero video no longer starts downloading one file before JavaScript switches to another.
- The malformed generated intro URL was replaced by an explicit configurable URL.
- The broken `#results` hero link now points to the services section.
- The unused OG-image preload was removed.
- OG metadata now points to the real image path and reports its actual dimensions.
- The mislabeled 951 KB `logo.webp` file was omitted; metadata uses the existing PNG and the interface uses SVG.
