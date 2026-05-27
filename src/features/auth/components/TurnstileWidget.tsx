import { useEffect, useRef, useState } from 'react'

const turnstileScriptId = 'cloudflare-turnstile-script'
const turnstileScriptUrl =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

type TurnstileWidgetProps = {
  onTokenChange: (token: string | null) => void
  resetKey: number
  siteKey: string
}

type TurnstileRenderOptions = {
  callback: (token: string) => void
  'error-callback': () => void
  'expired-callback': () => void
  sitekey: string
  theme: 'light'
}

type TurnstileApi = {
  remove: (widgetId: string) => void
  render: (
    container: HTMLElement,
    options: TurnstileRenderOptions,
  ) => string | undefined
  reset: (widgetId?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let turnstileScriptPromise: Promise<TurnstileApi> | null = null

export function TurnstileWidget({
  onTokenChange,
  resetKey,
  siteKey,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function renderWidget() {
      if (!containerRef.current) {
        return
      }

      try {
        const turnstile = await loadTurnstileScript()

        if (!isMounted || !containerRef.current) {
          return
        }

        widgetIdRef.current =
          turnstile.render(containerRef.current, {
            callback: (token) => {
              setError(null)
              onTokenChange(token)
            },
            'error-callback': () => {
              onTokenChange(null)
              setError('La verification anti-spam a echoue.')
            },
            'expired-callback': () => {
              onTokenChange(null)
              setError('La verification anti-spam a expire.')
            },
            sitekey: siteKey,
            theme: 'light',
          }) ?? null
      } catch {
        if (isMounted) {
          onTokenChange(null)
          setError('La verification anti-spam est indisponible.')
        }
      }
    }

    void renderWidget()

    return () => {
      isMounted = false

      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }

      widgetIdRef.current = null
    }
  }, [onTokenChange, siteKey])

  useEffect(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
      onTokenChange(null)
    }
  }, [onTokenChange, resetKey])

  return (
    <div className="grid gap-2">
      <div
        ref={containerRef}
        className="min-h-[65px] overflow-hidden rounded-[0.9rem] border border-stone-200 bg-stone-50 px-3 py-2"
      />
      {error ? (
        <p className="text-sm font-medium text-red-700">{error}</p>
      ) : null}
    </div>
  )
}

function loadTurnstileScript(): Promise<TurnstileApi> {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile)
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(turnstileScriptId)

    if (existingScript) {
      existingScript.addEventListener('load', () => resolveTurnstile(resolve))
      existingScript.addEventListener('error', reject)
      return
    }

    const script = document.createElement('script')
    script.id = turnstileScriptId
    script.async = true
    script.defer = true
    script.src = turnstileScriptUrl
    script.addEventListener('load', () => resolveTurnstile(resolve))
    script.addEventListener('error', reject)

    document.head.appendChild(script)
  })

  return turnstileScriptPromise
}

function resolveTurnstile(resolve: (turnstile: TurnstileApi) => void) {
  if (window.turnstile) {
    resolve(window.turnstile)
  }
}
