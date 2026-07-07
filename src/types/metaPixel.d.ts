type MetaPixelEventValue =
  | Array<number | string>
  | boolean
  | null
  | number
  | string

type MetaPixelEventPayload = Record<string, MetaPixelEventValue>

type MetaPixelEventOptions = {
  eventID?: string
}

type MetaPixelInitCall = ['init', string]
type MetaPixelTrackCall = [
  'track' | 'trackCustom',
  string,
  MetaPixelEventPayload?,
  MetaPixelEventOptions?,
]
type MetaPixelCall = MetaPixelInitCall | MetaPixelTrackCall

type MetaPixelFunction = {
  (...args: MetaPixelCall): void
  callMethod?: (...args: MetaPixelCall) => void
  loaded: boolean
  push: MetaPixelFunction
  queue: MetaPixelCall[]
  version: string
}

interface Window {
  _fbq?: MetaPixelFunction
  fbq?: MetaPixelFunction
}
