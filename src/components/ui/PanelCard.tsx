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
      className={`rounded-[1.35rem] border border-stone-200/85 bg-white/96 p-3 shadow-[0_16px_38px_-28px_rgba(28,25,23,0.18)] backdrop-blur-sm sm:p-3.5 ${className}`.trim()}
    >
      <header className="flex items-start justify-between gap-2.5 border-b border-stone-100 pb-2.5">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1 text-[0.95rem] font-semibold tracking-tight text-stone-950 sm:text-base">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-xl text-[12px] leading-5 text-stone-500 sm:text-[13px]">
              {description}
            </p>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </header>

      <div className="mt-3">{children}</div>
    </section>
  )
}
