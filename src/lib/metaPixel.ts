const metaPixelId = import.meta.env.VITE_META_PIXEL_ID;
const metaPixelScriptId = 'meta-pixel-script'
const metaPixelScriptSrc = 'https://connect.facebook.net/en_US/fbevents.js'

let isMetaPixelInitialized = false
const trackedPageViews = new Set<string>()

type TrackMetaEventOptions = {
  eventID?: string
}

export type MetaStandardEventName =
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'PageView'
  | 'Purchase'
  | 'ViewContent'

export function initializeMetaPixel(options: { trackPageView?: boolean } = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  const { trackPageView = true } = options

  if (!window.fbq) {
    installMetaPixelQueue()
  }

  if (!document.getElementById(metaPixelScriptId)) {
    const script = document.createElement('script')
    const firstScript = document.getElementsByTagName('script')[0]

    script.async = true
    script.id = metaPixelScriptId
    script.src = metaPixelScriptSrc
    firstScript?.parentNode?.insertBefore(script, firstScript)
  }

  if (!isMetaPixelInitialized) {
    window.fbq?.('init', metaPixelId)
    isMetaPixelInitialized = true
  }

  if (trackPageView) {
    trackMetaPageView()
  }
}

export function trackMetaPageView(pageKey = getCurrentPageKey()): void {
  if (trackedPageViews.has(pageKey)) {
    return
  }

  trackedPageViews.add(pageKey)
  trackMetaEvent('PageView')
}

export function trackMetaEvent(
  eventName: MetaStandardEventName,
  payload?: MetaPixelEventPayload,
  options?: TrackMetaEventOptions,
): void {
  if (typeof window === 'undefined') {
    return
  }

  if (!window.fbq) {
    initializeMetaPixel({ trackPageView: false })
  }

  if (options?.eventID) {
    window.fbq?.('track', eventName, payload, { eventID: options.eventID })
    return
  }

  window.fbq?.('track', eventName, payload)
}

function installMetaPixelQueue(): void {
  const fbq: MetaPixelFunction = (...args: MetaPixelCall) => {
    if (fbq.callMethod) {
      fbq.callMethod(...args)
      return
    }

    fbq.queue.push(args)
  }

  fbq.push = fbq
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.queue = []

  window.fbq = fbq

  if (!window._fbq) {
    window._fbq = fbq
  }
}

function getCurrentPageKey(): string {
  if (typeof window === 'undefined') {
    return '/'
  }

  return `${window.location.pathname}${window.location.search}`
}
