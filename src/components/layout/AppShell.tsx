import type { PropsWithChildren } from 'react'

type AppShellProps = PropsWithChildren<{
  title: string
  subtitle: string
}>

export function AppShell({ children, title, subtitle }: AppShellProps) {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px] flex-col px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
        <header className="border-b border-stone-300/85 pb-3 sm:pb-4">
          {/* <p className="text-sm font-medium uppercase tracking-[0.24em] text-stone-500">
            Base front-end
          </p> */}
          <div className="max-w-2xl">
            <h1 className="text-[1.9rem] font-semibold tracking-tight text-stone-950 sm:text-[2.3rem]">
              {title}
            </h1>
            <p className="mt-1.5 max-w-[42rem] text-[13px] leading-5 text-stone-600 sm:text-sm">
              {subtitle}
            </p>
          </div>
        </header>

        <main className="flex flex-1 flex-col py-3 sm:py-4">{children}</main>
      </div>
    </div>
  )
}
