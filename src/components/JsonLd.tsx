import type { Json } from '@/lib/schema'

/** Renders a structured-data object as a script tag. */
export default function JsonLd({ schema }: { schema: Json }) {
  return (
    <script
      type="application/ld+json"
      // Schema objects are built from our own typed content, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
