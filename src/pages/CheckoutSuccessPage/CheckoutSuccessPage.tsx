import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { fetchUserOrderDetails } from '../../features/account/api/accountApi'
import { createEmptyCart, saveCart } from '../../features/cart'
import {
  fetchRelaySelection,
  MondialRelayPicker,
  pendingCheckoutCustomerFirstNameStorageKey,
  pendingCheckoutOrderIdStorageKey,
  selectRelayPoint,
} from '../../features/checkout'
import type {
  MondialRelaySelection,
  RelaySelectionDetails,
} from '../../features/checkout'

type PaymentConfirmationStatus =
  | 'checking'
  | 'missing-order'
  | 'paid'
  | 'unconfirmed'

const maxLegacyPaymentStatusChecks = 10
const legacyPaymentStatusPollingDelayMs = 1000
const relayPaymentRetryDelaysMs = [1000, 2000, 3000, 5000] as const

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [pendingOrderId] = useState<string | null>(() =>
    readPendingCheckoutOrderId(),
  )
  const [customerFirstName] = useState<string | null>(() =>
    readPendingCheckoutCustomerFirstName(),
  )
  const [confirmationStatus, setConfirmationStatus] =
    useState<PaymentConfirmationStatus>(() =>
      pendingOrderId || sessionId ? 'checking' : 'missing-order',
    )
  const [relayDetails, setRelayDetails] =
    useState<RelaySelectionDetails | null>(null)
  const [relayError, setRelayError] = useState<string | null>(null)
  const [relayCheckKey, setRelayCheckKey] = useState(0)
  const [canRetryRelayCheck, setCanRetryRelayCheck] = useState(false)
  const [isSavingRelayPoint, setIsSavingRelayPoint] = useState(false)
  const isSavingRelayPointRef = useRef(false)
  const isMountedRef = useRef(true)
  const isGuestSuccess = !pendingOrderId && Boolean(sessionId)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (sessionId || !pendingOrderId) {
      return undefined
    }

    const orderId = pendingOrderId
    let isCurrentCheck = true
    let timeoutId: number | null = null

    async function checkPaymentStatus(attempt: number) {
      try {
        const order = await fetchUserOrderDetails(orderId)

        if (!isCurrentCheck) {
          return
        }

        if (order.status === 'paid') {
          clearConfirmedCheckoutCart()
          setConfirmationStatus('paid')
          return
        }
      } catch {
        if (!isCurrentCheck) {
          return
        }
      }

      if (attempt >= maxLegacyPaymentStatusChecks) {
        setConfirmationStatus('unconfirmed')
        return
      }

      timeoutId = window.setTimeout(() => {
        void checkPaymentStatus(attempt + 1)
      }, legacyPaymentStatusPollingDelayMs)
    }

    void checkPaymentStatus(1)

    return () => {
      isCurrentCheck = false

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [pendingOrderId, sessionId])

  useEffect(() => {
    if (!sessionId) {
      return undefined
    }

    const checkoutSessionId = sessionId
    let isCurrentCheck = true
    let timeoutId: number | null = null

    async function checkRelaySelection(attempt: number) {
      try {
        const details = await fetchRelaySelection(checkoutSessionId)

        if (!isCurrentCheck) {
          return
        }

        setRelayDetails(details)
        setRelayError(null)

        if (details.paymentStatus === 'paid') {
          clearConfirmedCheckoutCart()
          setConfirmationStatus('paid')
          setCanRetryRelayCheck(false)
          return
        }

        setConfirmationStatus('checking')

        if (attempt >= relayPaymentRetryDelaysMs.length) {
          setConfirmationStatus('unconfirmed')
          setCanRetryRelayCheck(true)
          return
        }

        timeoutId = window.setTimeout(() => {
          void checkRelaySelection(attempt + 1)
        }, relayPaymentRetryDelaysMs[attempt])
      } catch {
        if (!isCurrentCheck) {
          return
        }

        setConfirmationStatus('unconfirmed')
        setCanRetryRelayCheck(true)
        setRelayError(
          'La vérification de votre commande est momentanément indisponible.',
        )
      }
    }

    void checkRelaySelection(0)

    return () => {
      isCurrentCheck = false

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [relayCheckKey, sessionId])

  const retryRelayCheck = () => {
    setConfirmationStatus('checking')
    setCanRetryRelayCheck(false)
    setRelayError(null)
    setRelayCheckKey((key) => key + 1)
  }

  const handleRelaySelection = async (
    selection: MondialRelaySelection,
  ): Promise<void> => {
    if (!sessionId || isSavingRelayPointRef.current) {
      return
    }

    isSavingRelayPointRef.current = true
    setIsSavingRelayPoint(true)
    setRelayError(null)
    let patchError: unknown = null

    try {
      await selectRelayPoint({
        checkoutSessionId: sessionId,
        relayPoint: {
          id: selection.id,
          country: selection.country,
        },
      })
    } catch (error) {
      patchError = error
    }

    try {
      const officialDetails = await fetchRelaySelection(sessionId)

      if (!isMountedRef.current) {
        return
      }

      setRelayDetails(officialDetails)

      if (officialDetails.relaySelectionStatus === 'selected') {
        setRelayError(null)
      } else if (patchError) {
        setRelayError("Le Point Relais n'a pas pu être enregistré.")
      }
    } catch {
      if (isMountedRef.current) {
        setRelayError(
          patchError
            ? "Le Point Relais n'a pas pu être enregistré."
            : 'Le Point Relais a été enregistré, mais sa confirmation officielle n’a pas pu être récupérée.',
        )
        setCanRetryRelayCheck(true)
      }
    } finally {
      isSavingRelayPointRef.current = false

      if (isMountedRef.current) {
        setIsSavingRelayPoint(false)
      }
    }
  }

  const showRelayPicker =
    relayDetails?.paymentStatus === 'paid' &&
    relayDetails.shippingMethod === 'mondial_relay' &&
    relayDetails.relaySelectionStatus === 'pending'
  const showSelectedRelayPoint =
    relayDetails?.paymentStatus === 'paid' &&
    relayDetails.shippingMethod === 'mondial_relay' &&
    relayDetails.relaySelectionStatus === 'selected'

  return (
    <main className="min-h-screen bg-blue-50/55 px-4 py-6 text-blue-950">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-3xl place-items-center">
        <div className="w-full rounded-[1.25rem] border border-emerald-200 bg-white p-5 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.35)]">
          <div className={getStatusPanelClassName(confirmationStatus)}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Paiement
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {getStatusTitle(confirmationStatus, customerFirstName)}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6">
              {getStatusDescription(
                confirmationStatus,
                sessionId,
                isGuestSuccess,
              )}
            </p>
            {canRetryRelayCheck && sessionId ? (
              <button
                type="button"
                onClick={retryRelayCheck}
                className="mt-3 inline-flex min-h-10 items-center justify-center rounded-[0.8rem] border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                Vérifier à nouveau
              </button>
            ) : null}
          </div>

          {relayError ? (
            <p
              role="alert"
              className="mt-4 rounded-[0.9rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
            >
              {relayError}
            </p>
          ) : null}

          {showRelayPicker ? (
            <section className="mt-4 min-w-0 rounded-[1.1rem] border border-blue-100 bg-blue-50/60 p-4">
              <h2 className="text-xl font-semibold tracking-tight">
                Choisissez votre Point Relais
              </h2>
              <p className="mt-1 text-sm leading-6 text-blue-800">
                Sélectionnez le Point Relais ou Locker où vous souhaitez retirer
                votre commande.
              </p>
              <div className="mt-4 min-w-0 max-w-full overflow-x-hidden">
                <MondialRelayPicker
                  disabled={isSavingRelayPoint}
                  onSelect={(selection) => {
                    void handleRelaySelection(selection)
                  }}
                />
              </div>
              {isSavingRelayPoint ? (
                <p
                  role="status"
                  className="mt-3 rounded-[0.8rem] border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-900"
                >
                  Enregistrement du Point Relais…
                </p>
              ) : null}
            </section>
          ) : null}

          {showSelectedRelayPoint ? (
            <SelectedRelayPoint details={relayDetails} />
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={isGuestSuccess ? '/register' : '/account'}
              className="inline-flex min-h-11 items-center justify-center rounded-[1rem] bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              {isGuestSuccess ? 'Créer mon espace client' : 'Voir mes commandes'}
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-11 items-center justify-center rounded-[1rem] border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              Retour au studio
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function SelectedRelayPoint({
  details,
}: {
  details: RelaySelectionDetails
}) {
  const relayPoint = details.relayPoint

  if (!relayPoint) {
    return (
      <p
        role="alert"
        className="mt-4 rounded-[0.9rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
      >
        Le Point Relais sélectionné n’a pas pu être affiché.
      </p>
    )
  }

  return (
    <section className="mt-4 rounded-[1.1rem] border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
      <h2 className="text-xl font-semibold tracking-tight">
        Votre Point Relais
      </h2>
      <address className="mt-3 text-sm not-italic leading-6">
        <strong className="block">{relayPoint.name}</strong>
        <span className="block">{relayPoint.addressLine1}</span>
        {relayPoint.addressLine2 ? (
          <span className="block">{relayPoint.addressLine2}</span>
        ) : null}
        <span className="block">
          {relayPoint.postalCode} {relayPoint.city}
        </span>
      </address>
    </section>
  )
}

function readPendingCheckoutOrderId(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const orderId = window.localStorage.getItem(pendingCheckoutOrderIdStorageKey)

  return orderId && orderId.trim().length > 0 ? orderId : null
}

function readPendingCheckoutCustomerFirstName(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const firstName = window.sessionStorage.getItem(
    pendingCheckoutCustomerFirstNameStorageKey,
  )

  return firstName && firstName.trim().length > 0 ? firstName : null
}

function clearConfirmedCheckoutCart(): void {
  if (typeof window === 'undefined') {
    return
  }

  saveCart(createEmptyCart())
  window.localStorage.removeItem(pendingCheckoutOrderIdStorageKey)
  window.sessionStorage.removeItem(pendingCheckoutCustomerFirstNameStorageKey)
}

function getStatusPanelClassName(status: PaymentConfirmationStatus): string {
  if (status === 'paid') {
    return 'rounded-[1.1rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-900'
  }

  if (status === 'unconfirmed' || status === 'missing-order') {
    return 'rounded-[1.1rem] border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950'
  }

  return 'rounded-[1.1rem] border border-blue-100 bg-blue-50 px-4 py-4 text-blue-950'
}

function getStatusTitle(
  status: PaymentConfirmationStatus,
  customerFirstName: string | null,
): string {
  if (status === 'paid') {
    return customerFirstName
      ? `Merci ${customerFirstName} !`
      : 'Merci pour votre commande !'
  }

  if (status === 'missing-order') {
    return 'Commande à vérifier'
  }

  if (status === 'unconfirmed') {
    return 'Paiement encore en confirmation'
  }

  return 'Confirmation de votre paiement en cours…'
}

function getStatusDescription(
  status: PaymentConfirmationStatus,
  sessionId: string | null,
  isGuestSuccess: boolean,
): string {
  if (status === 'paid') {
    if (isGuestSuccess) {
      return 'Votre commande est confirmée. Vous allez recevoir un email de confirmation dans quelques minutes.'
    }

    return 'Votre paiement est confirmé. Votre panier a été vidé et votre commande est disponible dans votre espace client.'
  }

  if (status === 'missing-order') {
    return "Nous n'avons pas trouvé d'identifiant de commande local à vérifier. Votre panier n'a pas été modifié."
  }

  if (status === 'unconfirmed') {
    return "La confirmation Stripe n'est pas encore disponible. Votre panier n'a pas été modifié."
  }

  return sessionId
    ? 'Merci, Stripe a renvoyé votre session. Nous vérifions maintenant que la commande est bien payée avant de vider le panier.'
    : 'Merci, nous vérifions maintenant que la commande est bien payée avant de vider le panier.'
}
