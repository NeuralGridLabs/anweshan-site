# Anweshan — Website

The official website for **Anweshan**, a Lalitpur-based Clinical Research
Organization and think tank working across development research, information
technology, and communications.

This is a full rebuild of www.anweshan.org, built with real scraped content
from the original site (projects, clients, team, services).

## Tech stack

- Next.js 16 (App Router, React 19, Turbopack)
- Tailwind CSS v4 (CSS-first `@theme` configuration in `globals.css`)
- TypeScript
- lucide-react / react-icons for iconography

## Getting started

Prerequisites: Node.js 22.12+ and npm. This is enforced by `engines` in
package.json and by `NODE_VERSION` in netlify.toml, because `sanity@6` requires
`>=22.12` and `next@16` requires `>=20.9` - a build on an older image fails on
resolution rather than on anything to do with this site.

```bash
# install dependencies
npm install

# configure the environment
cp .env.example .env.local
# then fill in NEXT_PUBLIC_SANITY_PROJECT_ID at minimum - the build throws
# without it rather than prerendering an empty site

# run the dev server
npm run dev
```

The site runs at http://localhost:3000

### Environment variables

`.env.example` is the full list and is committed; `.env.local` is gitignored and
is what you copy it to. The variable that governs every absolute URL on the site
is `NEXT_PUBLIC_SITE_URL`, which must be set in the **hosting dashboard** (not
just in a local `.env`) for the production context:

| Variable | Where | Value in production |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | hosting dashboard | `https://www.anweshan.org` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | hosting dashboard | your Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | hosting dashboard | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | optional | `2024-01-01` |
| `SANITY_API_READ_TOKEN` | hosting dashboard, secret | only if the dataset is private |
| `BLOCK_INDEXING` | optional | leave unset |

`NEXT_PUBLIC_SITE_URL` drives canonical tags, `og:url`, `/sitemap.xml` and the
`Sitemap:` line in `/robots.txt`. It is `NEXT_PUBLIC_`-prefixed, so it is inlined
at build time - changing it requires a rebuild, not just a restart.

If it is missing from a production build, nothing fails and the site does not
publish localhost URLs: `src/lib/seo.ts` falls back to the hard-coded
`PRODUCTION_SITE_URL` (`https://www.anweshan.org`), which is exported from that
same file and is the single place to change if the domain ever moves.

Local development needs none of this. With `NODE_ENV=development` the origin
falls back to `http://localhost:3000` and `robots.txt` disallows everything, so
a dev server is never crawled. Netlify deploy previews and branch deploys are
also blocked automatically via `CONTEXT`, and Vercel previews via `VERCEL_ENV`.
Set `BLOCK_INDEXING=true` to take a live deploy out of the index without
undeploying it.

### Other scripts

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint across the repo
```

`next lint` was removed in Next 16 and `next build` no longer lints, so
`npm run lint` is not run for you by anything. Run it yourself before pushing.

## Project structure

```
src/
  app/                  # App Router routes (one folder per page)
    page.tsx            # home
    about/page.tsx      # about + objectives
    services/page.tsx   # service offerings
    projects/page.tsx   # featured work carousel
    projects/[slug]/    # individual project detail pages
    clients/page.tsx    # trusted-by marquee + client cards
    team/page.tsx       # team grid
    career/page.tsx     # open vacancies
    contact/page.tsx    # contact details
    globals.css         # Tailwind v4 theme, palette, keyframes, type scale
    layout.tsx          # root layout, fonts, metadata
  components/           # shared UI
    Navbar, NavLinks, TopBar, Footer
    PageHeader, Hero, About, Explore, Projects
    ClientMarquee, Cutouts, Counter, Reveal
  lib/
    projects.ts         # shared project data (feeds home + /projects)
public/images/          # logos and artwork (logo.png, logo-light.png, clients/*)
```

Path alias: `@/*` maps to `src/*` (e.g. `import PageHeader from "@/components/PageHeader"`).

Remote images (Unsplash, YouTube) are allow-listed in `next.config.ts`.

## Design system

The palette is a fixed set of twelve supplied colours plus black and white.
There is exactly **one dark** — `forest #132A13` — which is the single colour
used for all text, the navbar, and the footer. Every other surface is a pale
or saturated ground from the supplied set.

Palette tokens (defined in `globals.css` `@theme`):

| Token     | Hex       | Role                         |
|-----------|-----------|------------------------------|
| forest    | #132A13   | the only dark: text + chrome |
| snow      | #FEFCFB   | lightest ground              |
| ivory     | #FDF8E1   | ground                       |
| sage      | #E9F5DB   | ground                       |
| cream     | #FCEFB4   | ground                       |
| butter    | #FFF566   | accent                       |
| neon      | #FFFF3F   | accent                       |
| gold      | #FDC500   | accent                       |
| mint      | #7AE582   | accent / ground              |
| jade      | #7BE0AD   | accent / ground              |
| aqua      | #4ECDC4   | accent / ground              |
| teal      | #17BEBB   | accent / ground              |

Black and white are registered as `--color-black` / `--color-white` so
`text-black` / `text-white` work as normal utilities.

### Important conventions (read before editing styles)

1. **Never use teal/blue as text.** Teal/aqua are allowed as backgrounds and
   accents only. All body and heading text is `forest` (or black/white on dark
   surfaces). This is a hard rule carried over from the design brief.
2. **Every colour must be a registered `--color-*` token.** In Tailwind v4 an
   undefined colour utility emits NO CSS, so the class silently does nothing.
   Do not use arbitrary `text-[#hex]` values unless a token genuinely cannot
   cover it.
3. **Do not name a colour alias like a built-in utility.** A previous bug:
   `--color-base: #FEFCFB` collided with Tailwind's built-in `text-base`
   font-size utility, so at the `md:` breakpoint `text-base` injected
   `color: var(--color-base)` (near-white) and overrode real text colours.
   Keep colour token names distinct from utility names (`text-*`, `bg-*`,
   `border-*`, `size-*`, etc.).
4. **Type scale** is defined as `@utility` classes in `globals.css`
   (`h1-page`, `h2-section`, `h3-card`, `eyebrow`, `meta-label`, `body-lg`,
   `body-sm`). They inherit colour and carry no hardcoded colour of their own.

## Notes

- Client and project content is real, sourced from the original anweshan.org.
- Client logos in `public/images/clients/` are real marks sourced from
  Wikimedia Commons; organisations without a logo file fall back to a styled
  wordmark in the marquee.
- The site is light-dominant by design: pale grounds carry the pages, forest
  is the single dark anchor.

## Repository

https://github.com/NeuralGridLabs/anweshan-site
