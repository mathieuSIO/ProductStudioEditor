import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { PanelCard } from '../../../components/ui/PanelCard'
import type {
  RelayPoint,
  RelayPointSelection,
  RelaySelectionDetails,
} from '../../../shared/types/relay'
import { MondialRelayPicker } from '../../checkout'
import { AccountApiError } from '../api/accountApi'
import {
  fetchMyOrderRelaySelection,
  selectMyOrderRelayPoint,
} from '../api/accountRelaySelectionApi'

type LoadError = 'not_found' | 'temporary'

export function AccountOrderRelaySelectionPage() {
  const { orderId: rawOrderId } = useParams<{ orderId: string }>()
  const orderId = parseOrderId(rawOrderId)
  const [details, setDetails] = useState<RelaySelectionDetails | null>(null)
  const [pendingRelaySelection, setPendingRelaySelection] =
    useState<RelayPointSelection | null>(null)
  const [isLoading, setIsLoading] = useState(orderId !== null)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState<LoadError | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const isMountedRef = useRef(true)
  const isSavingRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (orderId === null) {
      setIsLoading(false)
      return undefined
    }

    let isCurrentRequest = true
    setIsLoading(true)
    setLoadError(null)
    setSaveError(null)

    void fetchMyOrderRelaySelection(orderId)
      .then((officialDetails) => {
        if (!isCurrentRequest) {
          return
        }

        setDetails(officialDetails)

        if (officialDetails.relaySelectionStatus === 'selected') {
          setPendingRelaySelection(null)
        }
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return
        }

        setDetails(null)
        setLoadError(
          error instanceof AccountApiError && error.status === 404
            ? 'not_found'
            : 'temporary',
        )
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrentRequest = false
    }
  }, [orderId, reloadKey])

  const confirmRelaySelection = async (): Promise<void> => {
    if (
      orderId === null ||
      !pendingRelaySelection ||
      isSavingRef.current
    ) {
      return
    }

    const selection = pendingRelaySelection
    isSavingRef.current = true
    setIsSaving(true)
    setSaveError(null)
    let patchFailed = false

    try {
      await selectMyOrderRelayPoint(orderId, {
        country: selection.country,
        id: selection.id,
      })
    } catch {
      patchFailed = true
    }

    try {
      const officialDetails = await fetchMyOrderRelaySelection(orderId)

      if (!isMountedRef.current) {
        return
      }

      setDetails(officialDetails)
      setLoadError(null)

      if (
        officialDetails.relaySelectionStatus === 'selected' &&
        officialDetails.relayPoint
      ) {
        setPendingRelaySelection(null)
        setSaveError(null)
      } else if (patchFailed) {
        setSaveError(
          'Votre Point Relais n’a pas pu être enregistré. Veuillez réessayer.',
        )
      }
    } catch (error: unknown) {
      if (!isMountedRef.current) {
        return
      }

      if (patchFailed) {
        setSaveError(
          'Votre Point Relais n’a pas pu être enregistré. Veuillez réessayer.',
        )
      } else {
        setLoadError(
          error instanceof AccountApiError && error.status === 404
            ? 'not_found'
            : 'temporary',
        )
      }
    } finally {
      isSavingRef.current = false

      if (isMountedRef.current) {
        setIsSaving(false)
      }
    }
  }

  const retryLoading = () => {
    setReloadKey((key) => key + 1)
  }

  const isPendingRelaySelection =
    details?.orderStatus === 'paid' &&
    details.shippingMethod === 'mondial_relay' &&
    details.relaySelectionStatus === 'pending'

  return (
    <main className="min-h-screen bg-blue-50/55 px-4 py-6 text-blue-950 sm:px-6">
      <div className="mx-auto grid w-full max-w-4xl gap-4">
        <header className="rounded-[1.25rem] border border-stone-200 bg-white px-4 py-5 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.28)] sm:px-5">
          <Link
            to="/account"
            className="text-sm font-semibold text-emerald-800 transition hover:text-blue-950"
          >
            ← Retour à mes commandes
          </Link>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Livraison
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {orderId === null ? 'Commande introuvable' : `Commande #${orderId}`}
          </h1>
        </header>

        {orderId === null ? (
          <StatusCard
            title="Cette commande est introuvable."
            description="Vérifiez le lien utilisé ou retournez à la liste de vos commandes."
          />
        ) : isLoading ? (
          <StatusCard
            title="Chargement de votre livraison…"
            description="Nous récupérons les informations officielles de votre commande."
          />
        ) : loadError === 'not_found' ? (
          <StatusCard
            title="Cette commande est introuvable."
            description="Elle n’existe pas ou n’est pas accessible depuis votre compte."
          />
        ) : loadError === 'temporary' ? (
          <StatusCard
            title="Impossible de charger les informations de livraison."
            description="Le service est momentanément indisponible."
            actionLabel="Réessayer"
            onAction={retryLoading}
          />
        ) : details?.relaySelectionStatus === 'selected' &&
          details.relayPoint ? (
          <SelectedRelayPoint relayPoint={details.relayPoint} />
        ) : details?.orderStatus !== 'paid' ? (
          <StatusCard
            title="Paiement en attente"
            description="La sélection du Point Relais sera disponible une fois le paiement confirmé."
          />
        ) : details.relaySelectionStatus === 'not_required' ||
          details.shippingMethod !== 'mondial_relay' ? (
          <StatusCard
            title="Aucune sélection nécessaire"
            description="Aucune sélection de Point Relais n’est nécessaire pour cette commande."
          />
        ) : isPendingRelaySelection ? (
          <PanelCard
            eyebrow="Mondial Relay"
            title="Choisissez votre Point Relais"
            description="Sélectionnez le Point Relais ou Locker dans lequel vous souhaitez recevoir votre commande."
          >
            <div className="min-w-0 max-w-full overflow-x-hidden">
              <MondialRelayPicker
                disabled={isSaving}
                onSelect={(selection) => {
                  if (isSavingRef.current) {
                    return
                  }

                  setPendingRelaySelection({
                    country: selection.country,
                    id: selection.id,
                  })
                  setSaveError(null)
                }}
              />
            </div>

            {pendingRelaySelection ? (
              <p className="mt-3 text-sm font-medium text-blue-900">
                Un Point Relais a été sélectionné. Validez votre choix pour
                continuer.
              </p>
            ) : null}

            <button
              type="button"
              disabled={!pendingRelaySelection || isSaving}
              onClick={() => {
                void confirmRelaySelection()
              }}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-[0.9rem] bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600 sm:w-auto"
            >
              Valider ce Point Relais
            </button>

            {isSaving ? (
              <p
                role="status"
                className="mt-3 rounded-[0.8rem] border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900"
              >
                Enregistrement du Point Relais…
              </p>
            ) : null}

            {saveError ? (
              <p
                role="alert"
                className="mt-3 rounded-[0.8rem] border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800"
              >
                {saveError}
              </p>
            ) : null}
          </PanelCard>
        ) : (
          <StatusCard
            title="Aucune sélection nécessaire"
            description="Aucune sélection de Point Relais n’est nécessaire pour cette commande."
          />
        )}
      </div>
    </main>
  )
}

type StatusCardProps = {
  actionLabel?: string
  description: string
  onAction?: () => void
  title: string
}

function StatusCard({
  actionLabel,
  description,
  onAction,
  title,
}: StatusCardProps) {
  return (
    <section className="rounded-[1.25rem] border border-stone-200 bg-white px-4 py-10 text-center shadow-[0_18px_42px_-36px_rgba(15,23,42,0.22)]">
      <h2 className="text-lg font-semibold text-blue-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-600">
        {description}
      </p>
      {actionLabel && onAction ? (
        <button
          type="button"
          className="mt-4 rounded-[0.95rem] bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
      <Link
        to="/account"
        className="mx-auto mt-4 block w-fit text-sm font-semibold text-emerald-800 transition hover:text-blue-950"
      >
        Retour à mes commandes
      </Link>
    </section>
  )
}

function SelectedRelayPoint({ relayPoint }: { relayPoint: RelayPoint }) {
  return (
    <PanelCard
      eyebrow="Livraison confirmée"
      title="Votre Point Relais"
      description="Les informations ci-dessous ont été confirmées par le serveur."
    >
      <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-blue-950">
        <p className="font-semibold">{relayPoint.name}</p>
        <address className="mt-2 not-italic leading-6 text-stone-700">
          <span className="block">{relayPoint.addressLine1}</span>
          {relayPoint.addressLine2 ? (
            <span className="block">{relayPoint.addressLine2}</span>
          ) : null}
          <span className="block">
            {relayPoint.postalCode} {relayPoint.city}
          </span>
        </address>
      </div>
      <Link
        to="/account"
        className="mt-4 inline-flex min-h-10 items-center justify-center rounded-[0.85rem] bg-blue-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
      >
        Retour à mes commandes
      </Link>
    </PanelCard>
  )
}

function parseOrderId(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) {
    return null
  }

  const orderId = Number(value)

  return Number.isSafeInteger(orderId) && orderId > 0 ? orderId : null
}
