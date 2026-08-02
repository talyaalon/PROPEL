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
      <div className="border border-brand-ink/15 bg-brand-deep">
        {/* Chrome */}
        <div className="flex items-center gap-2 border-b border-brand-ink/15 px-4 py-3 sm:px-5">
          <span className="h-2.5 w-2.5 bg-brand-accentDeep/70" />
          <span className="h-2.5 w-2.5 bg-brand-accent/70" />
          <span className="h-2.5 w-2.5 bg-brand-accent/70" />
          <div className="ms-3 h-5 flex-1 border border-brand-ink/10" />
        </div>

        {/* Page skeleton */}
        <div className="space-y-5 p-5 sm:space-y-6 sm:p-7">
          {/* Nav row */}
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 bg-brand-accent" />
            <div className="flex gap-2.5">
              <div className="h-2 w-10 bg-brand-ink/20" />
              <div className="h-2 w-10 bg-brand-ink/20" />
              <div className="h-2 w-10 bg-brand-ink/20" />
            </div>
          </div>

          {/* Headline block */}
          <div className="space-y-2.5 pt-2">
            <div className="h-4 w-4/5 bg-brand-ink/30 sm:h-5" />
            <div className="h-4 w-3/5 bg-brand-ink/30 sm:h-5" />
            <div className="h-2.5 w-2/3 bg-brand-ink/15" />
            <div className="pt-2">
              <div className="h-7 w-28 bg-brand-accent" />
            </div>
          </div>

          {/* Card row */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2 border border-brand-ink/15 p-3">
                <div className="h-5 w-5 border border-brand-ink/20" />
                <div className="h-1.5 w-full bg-brand-ink/15" />
                <div className="h-1.5 w-2/3 bg-brand-ink/15" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Automation flow card ───────────────────────────────── */}
      {/* Overlaps the frame's lower corner — the second half of what we sell */}
      <div className="absolute -bottom-6 end-3 border border-brand-accent bg-brand-void px-4 py-3.5 sm:end-6 sm:px-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <FlowNode icon={<Globe className="h-3.5 w-3.5" />} />
          <Connector />
          <FlowNode icon={<Database className="h-3.5 w-3.5" />} />
          <Connector />
          <FlowNode icon={<MessageCircle className="h-3.5 w-3.5" />} />
          <Connector />
          <span className="flex h-8 w-8 items-center justify-center border border-brand-accent text-brand-accent">
            <Check className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  )
}

function FlowNode({ icon }: { icon: React.ReactNode }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center border border-brand-ink/20 text-brand-lead">
      {icon}
    </span>
  )
}

function Connector() {
  return <span className="h-px w-3 flex-shrink-0 bg-brand-ink/25 sm:w-4" />
}
