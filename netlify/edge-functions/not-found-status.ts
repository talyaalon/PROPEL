/**
 * Turns the soft 404 into a real one.
 *
 * `src/middleware.ts` rewrites every unknown path under a locale to that
 * locale's 404 page, which is what keeps the response a properly localised,
 * styled page with navigation, a footer and the accessibility menu. A rewrite
 * cannot change the status code, so that page answered 200 - a soft 404 that
 * wastes crawl budget and that Google reports as an error.
 *
 * This runs before the Next handler, asks for the response it would have sent,
 * and re-sends it with the right status when the middleware marked it. The
 * body is passed through untouched, so nothing about the page changes.
 *
 * It is deliberately the smallest possible wrapper: one header read, and the
 * origin response handed straight back for every other request.
 *
 * Typed locally rather than against `@netlify/edge-functions`. This file runs
 * on Deno at the edge and is never bundled by Next, but `tsconfig.json`
 * compiles every `.ts` in the repository - so importing that package would
 * mean adding a dependency the application does not use, purely to satisfy a
 * type check. The two shapes below are the whole surface this function needs.
 */

type EdgeContext = {
  /** Runs the rest of the chain - here, the Next.js handler - and returns its response. */
  next: () => Promise<Response>
}

/** Must match `NOT_FOUND_MARKER` in `src/middleware.ts`. */
const MARKER = 'x-propel-notfound'

export default async function notFoundStatus(
  _request: Request,
  context: EdgeContext,
): Promise<Response> {
  const response = await context.next()

  if (response.headers.get(MARKER) !== '1') return response

  const headers = new Headers(response.headers)
  // Internal signalling - it has done its job and does not belong on the wire.
  headers.delete(MARKER)

  return new Response(response.body, {
    status: 404,
    statusText: 'Not Found',
    headers,
  })
}

export const config = {
  /*
   * HTML routes only. Static assets are served straight from the CDN and never
   * carry the marker, so wrapping them would add an edge invocation to every
   * image and script for a header that can never be set on them.
   */
  path: ['/he', '/en', '/he/*', '/en/*'],
  excludedPath: ['/_next/*', '/*.webp', '/*.svg', '/*.png', '/*.ico', '/*.txt', '/*.xml'],
}
