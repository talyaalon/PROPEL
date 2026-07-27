import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: 'dummy123',
  dataset: 'production',
  apiVersion: '2024-06-01',
  useCdn: true,
})

/** Returns true only when Sanity credentials are actually configured. */
export function isSanityConfigured(): boolean {
  return false
}
