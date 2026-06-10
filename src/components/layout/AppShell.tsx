import type { PropsWithChildren, ReactNode } from 'react'

type AppShellProps = PropsWithChildren<{
  action?: ReactNode
  secondaryLogo?: AppShellSecondaryLogo
  title: string
  subtitle: string
  onReturnToStudio: () => void
}>

type AppShellSecondaryLogo = {
  alt: string
  src: string
}

export function AppShell({
  action,
  children,
  secondaryLogo,
  title,
  subtitle,
  onReturnToStudio,
}: AppShellProps) {
  const hasHeaderText = title.trim().length > 0 || subtitle.trim().length > 0

  return (
    <div className="min-h-screen bg-white text-blue-950 sm:bg-blue-50/55">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px] flex-col px-0 py-0 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
        <header className="border-b border-blue-100 bg-white px-3 pb-3 pt-3 shadow-[0_18px_42px_-38px_rgba(15,23,42,0.35)] sm:rounded-[1.35rem] sm:border sm:px-4 sm:py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center justify-center gap-2 md:justify-start lg:gap-3">
              <div className="flex w-fit shrink-0 -translate-x-2 items-center justify-center gap-2 sm:gap-3 md:translate-x-0">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden">
                  <img
                    src="/logo-mpm-site-internet.png"
                    alt="Mon Petit Matos"
                    className="h-full w-full cursor-pointer object-contain"
                    onClick={onReturnToStudio}
                  />
                </div>
                {secondaryLogo ? (
                  <div className="flex h-10 min-w-0 shrink items-center justify-center sm:h-14 lg:h-16">
                    <img
                      src={secondaryLogo.src}
                      alt={secondaryLogo.alt}
                      className="h-full max-w-[min(13rem,calc(100vw-6rem))] object-contain sm:max-w-[15rem] lg:max-w-[18rem]"
                    />
                  </div>
                ) : null}
              </div>

              {hasHeaderText ? (
                <div className="min-w-0">
                  <h1 className="text-[1.55rem] font-semibold tracking-tight text-blue-950 sm:text-[1.9rem]">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="mt-1 text-[13px] leading-5 text-blue-800 sm:text-sm">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-center lg:justify-end">
              <div className="flex max-w-full flex-wrap items-center justify-center gap-2 text-center">
                <TrustBadge label="Made in France" />
                <TrustBadge label="Devis rapide" />
                <TrustBadge label="Accompagnement" />
              </div>
              {action ? <div className="shrink-0">{action}</div> : null}
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col px-0 py-3 sm:py-4">{children}</main>
      </div>
    </div>
  )
}

type TrustBadgeProps = {
  label: string
}

function TrustBadge({ label }: TrustBadgeProps) {
  return (
    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900">
      {label}
    </span>
  )
}
