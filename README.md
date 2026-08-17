# PROPEL

Bilingual (Hebrew/English) marketing site for PROPEL — web development and
business automation. Next.js App Router, fully statically generated, no CMS and
no database.

```bash
npm install
cp .env.example .env.local     # NEXT_PUBLIC_SITE_URL is the only required one
npm run dev                    # http://localhost:3000 → redirects to /he
```

## How it is put together

| | |
|---|---|
| Rendering | Every route is static. `src/app/[lang]/layout.tsx` is the only root layout — it renders `<html>` directly rather than reading the locale from a request header, which would opt the whole site into per-request rendering. |
| Locales | `he` (default) and `en`. `src/middleware.ts` redirects `/` to a locale using `Accept-Language`. **The middleware must stay inside `src/`** — with the app under `src/app`, Next silently ignores it at the project root. |
| Content | Plain TypeScript under `src/content`. Translated UI strings live in `src/dictionaries/{he,en}.json`; both files must keep the same shape. |
| Styling | Tailwind. Brand tokens are in `tailwind.config.ts`. |
| Contact form | Posts to Netlify Forms. `public/__forms.html` is the detection file; its field names must match `ContactForm` exactly. The Resend server action it replaced is gone. |

## Configuration

Externally visible values live in `src/lib/config.ts`. See `.env.example` for
what is still environment-driven.

**The phone number is not.** It is committed as `PHONE_RAW`, and the displayed,
dialled and WhatsApp forms are all derived from it. To change the number, edit
that line — that is the whole procedure.

It used to be two environment variables, `NEXT_PUBLIC_PHONE_DISPLAY` and
`NEXT_PUBLIC_WHATSAPP_PHONE`, and they drifted: the live site spent three
deploys dialling one number and messaging another. Both are now ignored by the
code. `npm run check:contact` runs after every build and fails if any other
Israeli mobile number reaches the output.

One value is required, and a **production** deploy will refuse to build without
it, because canonical URLs and OG tags would otherwise point at a domain we do
not own:

- `NEXT_PUBLIC_SITE_URL`

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

Current project: `subtle-begonia-d730cc`, deploying from `main` on
`shlomo435/propel`. Live at https://propel.co.il.

The repository moved. Netlify installs its GitHub App at the repository level and
that needs **admin**, which we do not have on `talyaalon/PROPEL` - push access is
not enough. `shlomo435/propel` is the deploy source; both remotes are kept in
sync by pushing to each.

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
- **Tailwind opacity modifiers do not work on brand tokens at all.** The colour
  tokens are bare `var(--x)` with no `<alpha-value>` channel, so `bg-brand-ink/40`
  compiles to nothing — silently, with no error and no warning. This has shipped
  three separate times. A translucent value needs its own token. Check any
  suspicious class with `npm run audit -- css <class>`.

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint

npm run check:contact   # fails if a phone number that is not ours is in the build
                        # (runs automatically as postbuild)

npm run audit -- gaps      # vertical rhythm and dead space, both locales
npm run audit -- contrast  # WCAG AA on every text role, both themes
npm run audit -- tab       # keyboard order and focus visibility
npm run audit -- headings  # heading outline per route
npm run audit -- css <cls> # whether a Tailwind class compiles to anything
```

The audit harness drives a real browser against a production build and refuses
to run against an unstyled page — measuring a page whose CSS failed to load
produces numbers that look excellent and mean the opposite.
