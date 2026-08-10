import { useEffect, useId, useRef, useState } from 'react'

import { env } from '../../../shared/config/env'
import {
  loadExternalScript,
  loadExternalStylesheet,
} from '../../../shared/utils/loadExternalResource'

const jqueryScriptUrl =
  'https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js'
const leafletScriptUrl = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
const leafletStylesheetUrl =
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const mondialRelayScriptUrl =
  'https://widget.mondialrelay.com/parcelshop-picker/jquery.plugin.mondialrelay.parcelshoppicker.min.js'

export type MondialRelaySelection = {
  id: string
  country: string
}

type MondialRelayPickerProps = {
  disabled?: boolean
  onSelect: (selection: MondialRelaySelection) => void
}

type WidgetLoadStatus = 'error' | 'loading' | 'ready'

export function MondialRelayPicker({
  disabled = false,
  onSelect,
}: MondialRelayPickerProps) {
  const reactId = useId()
  const targetId = `mondial-relay-target-${reactId.replaceAll(':', '')}`
  const containerRef = useRef<HTMLDivElement | null>(null)
  const hasInitializedRef = useRef(false)
  const onSelectRef = useRef(onSelect)
  const disabledRef = useRef(disabled)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [loadStatus, setLoadStatus] = useState<WidgetLoadStatus>('loading')

  onSelectRef.current = onSelect
  disabledRef.current = disabled

  useEffect(() => {
    const rawBrand = env.mondialRelayBrand?.trim()

    const brand =
      rawBrand && rawBrand.length <= 8
        ? rawBrand.padEnd(8, ' ')
        : undefined
    const container = containerRef.current
    let isActive = true
    let widgetHost: HTMLDivElement | null = null

    if (!brand || !container) {
      setLoadStatus('error')
      return undefined
    }

    async function initializeWidget() {
      try {
        setLoadStatus('loading')
        await loadMondialRelayDependencies()

        if (!isActive || !containerRef.current || hasInitializedRef.current) {
          return
        }

        const jquery = window.jQuery

        if (
          !jquery ||
          typeof jquery.fn.MR_ParcelShopPicker !== 'function'
        ) {
          throw new Error('Le plugin Mondial Relay est indisponible.')
        }

        widgetHost = document.createElement('div')
        widgetHost.className = 'min-w-0 max-w-full overflow-x-hidden'
        containerRef.current.replaceChildren(widgetHost)
        hasInitializedRef.current = true

        jquery(widgetHost).MR_ParcelShopPicker({
          Brand: brand,
          Country: 'FR',
          ColLivMod: '24R',
          OnParcelShopSelected: (data) => {
            if (!isActive || disabledRef.current) {
              return
            }

            const id = String(data.ID).trim().padStart(6, '0')
            const country = String(data.Pays).trim().toUpperCase()

            if (!id || !country) {
              return
            }

            onSelectRef.current({ country, id })
          },
          Responsive: true,
          ShowResultsOnMap: true,
          Target: `#${targetId}`,
          Theme: 'mondialrelay',
        })

        if (isActive) {
          setLoadStatus('ready')
        }
      } catch {
        if (isActive) {
          hasInitializedRef.current = false
          setLoadStatus('error')
        }
      }
    }

    void initializeWidget()

    return () => {
      isActive = false
      hasInitializedRef.current = false
      widgetHost?.remove()
    }
  }, [loadAttempt, targetId])

  const retryLoading = () => {
    hasInitializedRef.current = false
    containerRef.current?.replaceChildren()
    setLoadStatus('loading')
    setLoadAttempt((attempt) => attempt + 1)
  }

  return (
    <div className="grid min-w-0 gap-3">
      <input id={targetId} type="hidden" readOnly aria-hidden="true" />
      <div
        ref={containerRef}
        aria-busy={loadStatus === 'loading'}
        className={`min-h-72 min-w-0 max-w-full overflow-x-hidden rounded-[1rem] border border-blue-100 bg-white p-2 sm:p-3 ${disabled ? 'pointer-events-none opacity-60' : ''
          }`}
      />

      {loadStatus === 'loading' ? (
        <p className="text-sm text-blue-800">Chargement de Mondial Relay…</p>
      ) : null}

      {loadStatus === 'error' ? (
        <div className="rounded-[0.9rem] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <p>
            Le module Mondial Relay n’a pas pu être chargé. Réessayez dans
            quelques instants.
          </p>
          {!env.mondialRelayBrand && import.meta.env.DEV ? (
            <p className="mt-1 font-medium">
              Configuration manquante : VITE_MONDIAL_RELAY_BRAND.
            </p>
          ) : null}
          <button
            type="button"
            onClick={retryLoading}
            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-[0.8rem] border border-red-200 bg-white px-3 py-2 font-semibold text-red-800 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            Réessayer
          </button>
        </div>
      ) : null}
    </div>
  )
}

async function loadMondialRelayDependencies(): Promise<void> {
  await loadExternalScript({
    id: 'mondial-relay-jquery-script',
    isReady: () => Boolean(window.jQuery),
    src: jqueryScriptUrl,
  })

  await Promise.all([
    loadExternalStylesheet({
      href: leafletStylesheetUrl,
      id: 'mondial-relay-leaflet-stylesheet',
    }),
    loadExternalScript({
      id: 'mondial-relay-leaflet-script',
      isReady: () => Boolean(window.L),
      src: leafletScriptUrl,
    }),
  ])

  await loadExternalScript({
    id: 'mondial-relay-widget-script',
    isReady: () =>
      typeof window.jQuery?.fn.MR_ParcelShopPicker === 'function',
    src: mondialRelayScriptUrl,
  })
}
