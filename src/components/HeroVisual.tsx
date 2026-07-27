import { Globe, Database, MessageCircle, Check } from 'lucide-react'

/**
 * The hero visual, built in code rather than shipped as a photograph.
 *
 * Two reasons: the previous `/hero.jpg` did not exist in the repo at all, and
 * an agency that sells websites is better served by a hero that demonstrates
 * craft than by a stock image. It is entirely geometric — no text — so it needs
 * no translation and works identically in RTL and LTR.
 */
export default function HeroVisual() {
  return (
    <div className="relative" aria-hidden="true">
      {/* ── Browser frame ──────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[24px] border border-brand-border bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06),0_24px_64px_rgba(0,0,0,0.08)] sm:rounded-[32px]">

        {/* Chrome */}
        <div className="flex items-center gap-2 border-b border-brand-border bg-brand-cream px-4 py-3 sm:px-5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-border" />
          <div className="ms-3 h-5 flex-1 rounded-full bg-white/80 ring-1 ring-inset ring-brand-border" />
        </div>

        {/* Page skeleton */}
        <div className="space-y-5 p-5 sm:space-y-6 sm:p-7">
          {/* Nav row */}
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 rounded-full bg-brand-charcoal/80" />
            <div className="flex gap-2.5">
              <div className="h-2 w-10 rounded-full bg-brand-border" />
              <div className="h-2 w-10 rounded-full bg-brand-border" />
              <div className="h-2 w-10 rounded-full bg-brand-border" />
            </div>
          </div>

          {/* Headline block */}
          <div className="space-y-2.5 pt-2">
            <div className="h-4 w-4/5 rounded-full bg-brand-charcoal/15 sm:h-5" />
            <div className="h-4 w-3/5 rounded-full bg-brand-charcoal/15 sm:h-5" />
            <div className="h-2.5 w-2/3 rounded-full bg-brand-border" />
            <div className="pt-2">
              <div className="h-7 w-28 rounded-full bg-brand-charcoal" />
            </div>
          </div>

          {/* Card row */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="space-y-2 rounded-xl border border-brand-border bg-brand-cream p-3"
              >
                <div className="h-5 w-5 rounded-md bg-white shadow-soft" />
                <div className="h-1.5 w-full rounded-full bg-brand-border" />
                <div className="h-1.5 w-2/3 rounded-full bg-brand-border" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Automation flow card ───────────────────────────────── */}
      {/* Overlaps the frame's lower corner — the second half of what we sell */}
      <div className="absolute -bottom-6 end-3 rounded-[18px] border border-brand-border bg-white/95 px-4 py-3.5 shadow-card backdrop-blur-sm sm:end-6 sm:px-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <FlowNode icon={<Globe className="h-3.5 w-3.5" />} />
          <Connector />
          <FlowNode icon={<Database className="h-3.5 w-3.5" />} />
          <Connector />
          <FlowNode icon={<MessageCircle className="h-3.5 w-3.5" />} />
          <Connector />
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
            <Check className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  )
}

function FlowNode({ icon }: { icon: React.ReactNode }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-cream text-brand-charcoal ring-1 ring-inset ring-brand-border">
      {icon}
    </span>
  )
}

function Connector() {
  return <span className="h-px w-3 flex-shrink-0 bg-brand-border sm:w-4" />
}
