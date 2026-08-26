# PROPEL

Bilingual marketing site for a one-person agency. Next.js 15 App Router, fully
static, `/he` (default, RTL) and `/en`. Deeper project knowledge for review
work lives in `.claude/agents/_SHARED.md`.

## Writing rules

**Never use a long dash.** Not the em dash (U+2014), not the en dash (U+2013).
Use a plain ASCII hyphen `-`, or rewrite the sentence so it needs no dash.

This holds everywhere, with no exceptions: site copy in
`src/dictionaries/{he,en}.json`, the MDX articles under `content/blog/`, every
content file under `src/content/`, code comments, commit messages, documents
under `docs/`, and anything written back to the owner in chat. It holds in
Hebrew and in English alike.

The repository was swept clean of both characters in one pass, so
reintroducing one is a regression. Check your own output before writing a
file, and rewrite any proposed fix that carries one. To verify:

```bash
git ls-files -z | xargs -0 grep -lP '\x{2014}|\x{2013}'   # must print nothing
```

This rule is about dashes in prose. The box-drawing character U+2500, used to
rule off comment blocks throughout the codebase, is not a dash and stays.

## Other standing rules

- Reply to the owner in Hebrew. Code, comments and commit messages in English.
- Never invent a performance number, a business metric or a client outcome. A
  figure that has not been supplied is marked `TODO(metric)` in
  `src/content/projects.ts` and stripped by `getProjects()` before it can
  render. Ask rather than estimate.
- `main` is committed to directly and pushed to both remotes in sync: `mine`
  (shlomo435/propel) and `origin` (talyaalon/PROPEL).
- The working copy sits inside OneDrive, which corrupts `.next` mid-build.
  Build and measure from a copy outside the synced tree, and confirm
  `.next/BUILD_ID` matches the served page before trusting any measurement.
