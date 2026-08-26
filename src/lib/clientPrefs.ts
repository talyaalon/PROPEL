/**
 * Visitor preferences: the storage keys, and the script that applies them
 * before the browser paints.
 *
 * This module carries no `'use client'` directive, deliberately, and that is
 * the whole reason it exists.
 *
 * `themeInitScript` used to live in ThemeToggle.tsx and `a11yInitScript` in
 * AccessibilityMenu.tsx, both of which are client components. When a server
 * component imports a value out of a `'use client'` module, React does not give
 * it the value - it gives it a client reference. For a plain string constant
 * that reference renders as a stub that throws, so the layout was serving this
 * to every visitor:
 *
 *   <script>function(){throw Error("Attempted to call themeInitScript() from
 *   the server but themeInitScript is on the client...")}</script>
 *
 * Silently. No build error, no console error in the page, and the only symptom
 * was that a returning dark-mode visitor saw a flash of the light site on every
 * navigation - which reads like an unavoidable cost of theming rather than a
 * bug. It had been that way since the theme toggle was written.
 *
 * A shared module with no directive is imported by value on the server and
 * bundled normally on the client, which is what both sides need.
 */

export const THEME_KEY = 'propel-theme'
export const MOTION_KEY = 'propel-motion'
export const A11Y_KEY = 'propel-a11y'

/**
 * Runs before first paint. Inlined into the document, not bundled, so it stays
 * small and dependency-free and every failure mode is swallowed - a visitor
 * with storage disabled gets the default site, not a broken one.
 */
export const prefsInitScript = `
(function(){try{
  var r = document.documentElement;
  if (localStorage.getItem('${THEME_KEY}') === 'dark') r.dataset.theme = 'dark';
  if (localStorage.getItem('${MOTION_KEY}') === 'paused') r.dataset.motion = 'paused';
  var p = JSON.parse(localStorage.getItem('${A11Y_KEY}') || '{}');
  if (p.text && p.text !== 100) r.style.fontSize = p.text + '%';
  if (p.contrast) r.setAttribute('data-a11y-contrast','');
  if (p.links) r.setAttribute('data-a11y-links','');
  if (p.spacing) r.setAttribute('data-a11y-spacing','');
  /*
   * The legacy pause, from when the accessibility menu stored motion inside
   * its own object. Converted to the canonical key rather than merely
   * honoured: the menu now writes back only the four keys it owns, so the
   * first unrelated preference change would otherwise DROP this field and the
   * visitor's pause would vanish on the following load - silently, one
   * navigation later. Migrating here runs before paint on every page, whatever
   * components happen to mount.
   */
  if (p.motion) {
    r.dataset.motion = 'paused';
    localStorage.setItem('${MOTION_KEY}', 'paused');
  }
}catch(e){}})();
`.trim()
