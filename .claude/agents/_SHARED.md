# Shared context for PROPEL review agents

This file is not an agent. It is the block of project knowledge that every
reviewer agent embeds, kept in one place so it is corrected once.

## The project

PROPEL is a bilingual marketing site for a one-person agency.

- Next.js 15 App Router, React 19, TypeScript strict, Tailwind 3.4
- Fully static. `src/app/[lang]/layout.tsx` is the only root layout - reading
  `headers()` or `cookies()` anywhere in it opts the entire site into
  per-request rendering. Treat any such call as a finding.
- `src/middleware.ts` must stay inside `src/`. Next silently ignores it at the
  project root when the app lives at `src/app`, and the site then serves no
  locale redirect at all.
- Locales: `/he` (default, `dir="rtl"`) and `/en` (`dir="ltr"`). Copy lives in
  `src/dictionaries/{he,en}.json` and nowhere else.
- Colour, spacing and type all resolve through CSS custom properties declared
  twice in `src/app/globals.css`: `:root` and `:root[data-theme='dark']`. A
  hardcoded hex in a component is a finding; so is a token that only one theme
  defines.
- `borderRadius` is collapsed to `0px` at Tailwind `theme` level, deliberately.
  A `rounded-*` class in a component is dead code, not a rounded corner.
- Israeli standard IS 5568 applies, which is WCAG 2.1 AA.

## Rules of engagement

**Prove it before you report it.** An earlier ad-hoc run of these reviews
produced two findings that did not survive checking: "text falls back to a
system font" (it was only `<title>` and `<script>`, which render nothing) and
"10 form inputs have no accessible name" (four were Next's own hidden
server-action fields; every real control was labelled). Both cost real time.

So: every finding must carry evidence you actually obtained, not evidence you
expect to exist. `file.tsx:41` and the line itself, or a measured number and
the command that produced it. If you could not verify it, either drop it or
label it `UNVERIFIED` and say precisely what would settle it.

**A class in the source is not a class in the build.** Tailwind drops a utility
it cannot generate, with no error and no warning. The colour tokens here are
bare `var(--x)` with no `<alpha-value>` placeholder, so *every* opacity
modifier on them compiles to nothing: `border-brand-accent/40` and
`placeholder:text-brand-slate/60` both shipped, both did nothing, and both
elements fell through to a hardcoded preflight grey that looks deliberate and
does not flip with the theme. One measured 12.2:1 where every sibling measured
1.26:1; the other put placeholder text at 2.33:1.

Before reporting what a class does - or concluding an element is styled as
written - check it exists: `npm run audit -- css <the-class>`.

**Check whether a fix became the defect.** The empty grid cell in the portfolio
was a 420px hole; the card added to fill it stretched to 662px around 178px of
content and became a 483px hole. When reviewing a recent change, measure the
thing it claims to have fixed rather than accepting the commit message.

**Say when the working tree differs from the build.** Other agents and the main
session edit files while you audit. If a file you are reporting on has
uncommitted changes, `git diff` it and say whether they change your finding -
a fix already in the tree but not in the build is not a finding, and a fix that
makes something worse is the most valuable thing you can report.

**Do not re-report what is already fixed.** Before you begin:

```
git log --oneline main..HEAD
git log main..HEAD          # the bodies say exactly what changed and why
```

The commit bodies are written to be read. A finding that a commit body already
describes as fixed is noise.

**Use the shared harness.** `npm run audit` measures gaps, contrast, tab order
and heading outlines, with the traps below already handled:

```
npm run audit -- gaps            dead space between sections, page length
npm run audit -- contrast        every text role, both themes
npm run audit -- tab             the real tab order, with visibility flags
npm run audit -- headings        outline per page, flagging skipped levels
npm run audit -- css <class>     did this Tailwind utility actually compile?
```

Options: `--origin`, `--locale he|en`, `--theme light|dark`.

Read `scripts/audit.mjs` before writing your own version of any of this. Three
reviewers independently rewrote the gap measurement and got three different
numbers for the same boundary; that is why it lives in one place now. Extend it
if it is missing something - a permanent improvement beats a temp script.

**Measure on the built site, not the dev server.** Dev serves unminified CSS
and no static optimisation, so spacing and performance numbers taken there are
not the numbers users get.

```
npm run build
npm run start -- -p 4455
```

**Confirm the CSS actually loaded before trusting a single number.** A stale
server left holding the port serves HTML whose asset hashes no longer resolve,
and the page renders unstyled. It does not error - it produces numbers that
look excellent and mean the opposite: gaps collapse to ~16px, the page shortens
by a third, and every contrast pair reads exactly 21:1 because it is black on
white. Two runs were wasted on this. Check first:

```
CSS=$(curl -s $ORIGIN/he | grep -o '_next/static/css/[a-z0-9]*\.css' | head -1)
curl -s -o /dev/null -w '%{http_code}\n' "$ORIGIN/$CSS"    # must be 200
```

If contrast comes back 21:1 in *both* themes, stop - that is impossible, and
you are measuring an unstyled page.

Then drive it with `playwright-core`, which is already installed, against the
Chromium already on the machine - do not download a browser:

```js
import { chromium } from 'playwright-core'
const browser = await chromium.launch({
  executablePath: join(process.env.LOCALAPPDATA, 'ms-playwright/chromium-1223/chrome-win64/chrome.exe'),
})
```

Scripts that import `playwright-core` or `sharp` must sit inside the project
directory to resolve. A scratchpad path will fail with ERR_MODULE_NOT_FOUND.

Force `.reveal` elements visible before measuring layout, or you will measure a
page whose content is still translated 22px down and transparent:

```js
await page.evaluate(() => document.querySelectorAll('.reveal').forEach(e => e.classList.add('is-visible')))
```

Check both `/he` and `/en`, and both themes. Set the theme with
`document.documentElement.setAttribute('data-theme', 'dark')`. A very large
number of this project's defects have appeared in exactly one of the four
combinations.

**Do not change files.** You review. Findings go back as text.

## Output

Ordered by severity, worst first. Per finding:

```
SEVERITY  one-line claim
  where     file.tsx:41
  evidence  the line, or the measurement and how you took it
  impact    what a real visitor or crawler experiences
  fix       the smallest change that resolves it
```

Severity: `BROKEN` (a visitor hits it today) · `HIGH` · `MEDIUM` · `LOW`.

End with what you checked and found clean. A short list of ruled-out
hypotheses is worth more than a long list of speculative ones.
