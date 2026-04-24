import type { PropsWithChildren, ReactNode } from 'react'

type AppShellProps = PropsWithChildren<{
  action?: ReactNode
  title: string
  subtitle: string
}>

export function AppShell({ action, children, title, subtitle }: AppShellProps) {
  return (
    <div className="min-h-screen bg-white text-blue-950 sm:bg-blue-50/55">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px] flex-col px-0 py-0 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
        <header className="border-b border-blue-100 bg-white px-3 pb-3 pt-3 shadow-[0_18px_42px_-38px_rgba(15,23,42,0.35)] sm:rounded-[1.35rem] sm:border sm:px-4 sm:py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden ">
                <img
                  src="/logo-mpm.png"
                  alt="Mon Petit Matos"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <h1 className="text-[1.55rem] font-semibold tracking-tight text-blue-950 sm:text-[1.9rem]">
                  {title}
                </h1>
                <p className="mt-1 text-[13px] leading-5 text-blue-800 sm:text-sm">
                  {subtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
              <div className="flex flex-wrap gap-2">
                <TrustBadge label="Made in France 🇫🇷" />
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
