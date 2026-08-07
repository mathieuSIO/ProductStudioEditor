type ExternalScriptOptions = {
  id: string
  isReady?: () => boolean
  src: string
}

type ExternalStylesheetOptions = {
  href: string
  id: string
}

const scriptPromises = new Map<string, Promise<void>>()
const stylesheetPromises = new Map<string, Promise<void>>()

export function loadExternalScript({
  id,
  isReady,
  src,
}: ExternalScriptOptions): Promise<void> {
  if (isReady?.()) {
    return Promise.resolve()
  }

  const normalizedSrc = normalizeResourceUrl(src)
  const pendingPromise = scriptPromises.get(normalizedSrc)

  if (pendingPromise) {
    return pendingPromise
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existingScript = findScript(normalizedSrc)
    const script = existingScript ?? document.createElement('script')
    const wasCreated = existingScript === null

    const cleanupListeners = () => {
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
    }
    const handleLoad = () => {
      cleanupListeners()
      script.dataset.externalResourceStatus = 'loaded'

      if (isReady && !isReady()) {
        rejectResource(
          new Error(`La ressource ${src} est chargee mais indisponible.`),
        )
        return
      }

      resolve()
    }
    const handleError = () => {
      cleanupListeners()
      rejectResource(new Error(`La ressource ${src} n'a pas pu etre chargee.`))
    }
    const rejectResource = (error: Error) => {
      scriptPromises.delete(normalizedSrc)

      if (wasCreated) {
        script.remove()
      }

      reject(error)
    }

    if (script.dataset.externalResourceStatus === 'loaded') {
      handleLoad()
      return
    }

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })

    if (wasCreated) {
      script.async = true
      script.id = id
      script.src = src
      document.head.appendChild(script)
    }
  })

  scriptPromises.set(normalizedSrc, promise)

  return promise
}

export function loadExternalStylesheet({
  href,
  id,
}: ExternalStylesheetOptions): Promise<void> {
  const normalizedHref = normalizeResourceUrl(href)
  const pendingPromise = stylesheetPromises.get(normalizedHref)

  if (pendingPromise) {
    return pendingPromise
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existingStylesheet = findStylesheet(normalizedHref)
    const stylesheet = existingStylesheet ?? document.createElement('link')
    const wasCreated = existingStylesheet === null

    const cleanupListeners = () => {
      stylesheet.removeEventListener('load', handleLoad)
      stylesheet.removeEventListener('error', handleError)
    }
    const handleLoad = () => {
      cleanupListeners()
      stylesheet.dataset.externalResourceStatus = 'loaded'
      resolve()
    }
    const handleError = () => {
      cleanupListeners()
      stylesheetPromises.delete(normalizedHref)

      if (wasCreated) {
        stylesheet.remove()
      }

      reject(new Error(`La feuille de style ${href} n'a pas pu etre chargee.`))
    }

    if (
      stylesheet.dataset.externalResourceStatus === 'loaded' ||
      stylesheet.sheet !== null
    ) {
      handleLoad()
      return
    }

    stylesheet.addEventListener('load', handleLoad, { once: true })
    stylesheet.addEventListener('error', handleError, { once: true })

    if (wasCreated) {
      stylesheet.id = id
      stylesheet.rel = 'stylesheet'
      stylesheet.href = href
      document.head.appendChild(stylesheet)
    }
  })

  stylesheetPromises.set(normalizedHref, promise)

  return promise
}

function findScript(normalizedSrc: string): HTMLScriptElement | null {
  return (
    Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]')).find(
      (script) => normalizeResourceUrl(script.src) === normalizedSrc,
    ) ?? null
  )
}

function findStylesheet(normalizedHref: string): HTMLLinkElement | null {
  return (
    Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]'),
    ).find(
      (stylesheet) => normalizeResourceUrl(stylesheet.href) === normalizedHref,
    ) ?? null
  )
}

function normalizeResourceUrl(resourceUrl: string): string {
  return new URL(resourceUrl, document.baseURI).href
}
