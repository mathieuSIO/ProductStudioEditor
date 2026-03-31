import type { PropsWithChildren, ReactNode } from 'react'

type PanelCardProps = PropsWithChildren<{
  eyebrow?: string
  title: string
  description?: string
  aside?: ReactNode
  className?: string
}>

export function PanelCard({
  children,
  eyebrow,
  title,
  description,
  aside,
  className = '',
}: PanelCardProps) {
  return (
    <section
      className={`rounded-[1.5rem] border border-stone-200/80 bg-white/95 p-3.5 shadow-[0_18px_50px_-30px_rgba(28,25,23,0.22)] backdrop-blur-sm sm:p-4 ${className}`.trim()}
    >
      <header className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1.5 text-base font-semibold tracking-tight text-stone-950 sm:text-[1.05rem]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-stone-500 sm:text-sm">
              {description}
            </p>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </header>

      <div className="mt-3.5 sm:mt-4">{children}</div>
    </section>
  )
}
