import type { PropsWithChildren } from 'react'

type AppShellProps = PropsWithChildren<{
  title: string
  subtitle: string
}>

export function AppShell({ children, title, subtitle }: AppShellProps) {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <header className="border-b border-stone-300 pb-4 sm:pb-5">
          {/* <p className="text-sm font-medium uppercase tracking-[0.24em] text-stone-500">
            Base front-end
          </p> */}
          <div className="max-w-3xl">
            <h1 className="text-[2.15rem] font-semibold tracking-tight text-stone-950 sm:text-[2.6rem]">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-600 sm:text-base">
              {subtitle}
            </p>
          </div>
        </header>

        <main className="flex flex-1 flex-col py-4 sm:py-5">{children}</main>
      </div>
    </div>
  )
}
