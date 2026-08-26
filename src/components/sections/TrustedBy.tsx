import Image from 'next/image'
import { clients } from '@/content/clients'

/**
 * Client logo strip. Renders nothing until there are real logos - an empty
 * "trusted by" row is worse than none at all.
 */
export default function TrustedBy({ label }: { label: string }) {
  if (clients.length === 0) return null

  return (
    <section aria-label={label} className="border-y border-brand-line bg-brand-panel">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <p className="mb-8 text-center text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-brand-slate">
          {label}
        </p>

        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-14">
          {clients.map((client) => {
            // Muted monochrome keeps a row of clashing brand palettes from
            // pulling attention off the headline above it.
            const logo = (
              <Image
                src={client.logo}
                alt={client.name}
                width={120}
                height={40}
                className="h-7 w-auto opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 sm:h-8"
              />
            )

            return (
              <li key={client.name}>
                {client.url ? (
                  <a href={client.url} target="_blank" rel="noopener noreferrer">
                    {logo}
                  </a>
                ) : (
                  logo
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
