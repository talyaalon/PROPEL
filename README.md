# PROPEL

Bilingual (Hebrew/English) marketing site for PROPEL — web development and
business automation. Next.js App Router, fully statically generated, no CMS and
no database.

```bash
npm install
cp .env.example .env.local     # fill in at least the two REQUIRED values
npm run dev                    # http://localhost:3000 → redirects to /he
```

## How it is put together

| | |
|---|---|
| Rendering | Every route is static. `src/app/[lang]/layout.tsx` is the only root layout — it renders `<html>` directly rather than reading the locale from a request header, which would opt the whole site into per-request rendering. |
| Locales | `he` (default) and `en`. `src/middleware.ts` redirects `/` to a locale using `Accept-Language`. **The middleware must stay inside `src/`** — with the app under `src/app`, Next silently ignores it at the project root. |
| Content | Plain TypeScript under `src/content`. Translated UI strings live in `src/dictionaries/{he,en}.json`; both files must keep the same shape. |
| Styling | Tailwind. Brand tokens are in `tailwind.config.ts`. |
| Contact form | A server action (`src/actions/contact.ts`) that posts to Resend's REST API. No SDK dependency. |

## Configuration

Everything externally visible comes from the environment through
`src/lib/config.ts`. See `.env.example` for the full list.

Two values are required, and a **production** deploy will refuse to build
without them — a dead WhatsApp link is worse than a failed deploy:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WHATSAPP_PHONE`

Local builds and deploy previews only warn, so development is never blocked.
"Production" is detected per host (`CONTEXT` on Netlify, `VERCEL_ENV` on Vercel,
or `PROPEL_PRODUCTION=1` anywhere else) rather than through `NODE_ENV`, because
`npm run build` locally also sets `NODE_ENV=production`.

## Adding content

**Projects** — `src/content/projects.ts`. Every entry ships with `draft: true`
and drafts are hidden from production deploys, so nothing half-written can go
live. Fill in every `‹…›` placeholder, then set `draft: false`.

Give each project at least one entry in `results`. A case study without a number
is a description; with a number it is evidence, and it is what closes B2B deals.

If no project is published the portfolio section does not render at all, and the
navigation and footer drop their portfolio links automatically.

**Testimonials** — `src/content/testimonials.ts`. Needs a real name and company;
an anonymous quote is worth close to nothing. Empty by default, and the section
hides itself.

**Client logos** — `src/content/clients.ts`. Renders the strip under the hero.
Ask permission before using a client's mark.

**Legal pages** — `src/content/legal.ts`. The accessibility statement is a legal
requirement for Israeli business sites (IS 5568) and must name an accessibility
coordinator; set `NEXT_PUBLIC_A11Y_CONTACT_NAME`. Review both pages with the
business owner before launch.

## Deploying

`netlify.toml` is committed and configures the Next.js runtime, security headers
and long-term caching for hashed assets. The runtime is not optional: without it
the middleware does not run and there is no locale redirect.

Connect the GitHub repository in the Netlify UI rather than uploading builds, so
every push deploys and pull requests get previews. Set the environment variables
in the Netlify project settings — `.env.local` is gitignored and never deployed.

Current project: `propel-agency` (Netlify team `talyaalon`).

### The contributor gate

Netlify's free plan allows only one Git contributor on a **private** repository,
and it identifies the contributor by **who pushed** — not by the commit author.
A push from any other GitHub account is rejected before the build starts with
"Build blocked: Unrecognized Git contributor", regardless of what the commit
metadata says. Rewriting commit authorship does not work around it.

This repository is public, which removes the restriction entirely. If it is ever
made private again, every push must come from the GitHub account linked under
Netlify → Members → Git Contributors, or builds will stop.

## Conventions worth keeping

- Every call to action carries a `data-analytics="event:location"` attribute.
  `src/components/Analytics.tsx` forwards those clicks to whichever analytics
  provider is on the page and no-ops when there is none. Keep new CTAs labelled,
  or you lose the ability to tell which part of the page produces leads.
- Sections below the fold are wrapped in `<Reveal>`. The hidden state is
  server-rendered, with a `<noscript>` rule and a `prefers-reduced-motion` rule
  both forcing it visible — content must never be trapped behind JavaScript.
- The logo is HTML text in Raleway (`src/components/Logo.tsx`), not an image. An
  SVG loaded through `<img>` cannot reach the page's webfonts. If you swap in a
  designed logo, change that one component.
- Tailwind opacity modifiers only exist on the theme scale (multiples of 5).
  `border-white/8` generates nothing at all — use `/10` or `/[0.08]`.

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint
```
