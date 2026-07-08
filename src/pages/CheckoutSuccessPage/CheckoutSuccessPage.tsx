import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { fetchUserOrderDetails } from '../../features/account/api/accountApi'
import { createEmptyCart, saveCart } from '../../features/cart'
import {
  pendingCheckoutCustomerFirstNameStorageKey,
  pendingCheckoutOrderIdStorageKey,
} from '../../features/checkout'

type PaymentConfirmationStatus =
  | 'checking'
  | 'missing-order'
  | 'paid'
  | 'unconfirmed'

const maxPaymentStatusChecks = 10
const paymentStatusPollingDelayMs = 1000

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
      pendingOrderId ? 'checking' : sessionId ? 'paid' : 'missing-order',
    )
  const isGuestSuccess = !pendingOrderId && Boolean(sessionId)

  useEffect(() => {
    if (!pendingOrderId && sessionId) {
      clearConfirmedCheckoutCart()
      return undefined
    }

    if (!pendingOrderId) {
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

      if (attempt >= maxPaymentStatusChecks) {
        setConfirmationStatus('unconfirmed')
        return
      }

      timeoutId = window.setTimeout(() => {
        void checkPaymentStatus(attempt + 1)
      }, paymentStatusPollingDelayMs)
    }

    void checkPaymentStatus(1)

    return () => {
      isCurrentCheck = false

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [pendingOrderId, sessionId])

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
              {getStatusDescription(confirmationStatus, sessionId, isGuestSuccess)}
            </p>
          </div>

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
    return 'Commande a verifier'
  }

  if (status === 'unconfirmed') {
    return 'Paiement encore en confirmation'
  }

  return 'Paiement en cours de confirmation'
}

function getStatusDescription(
  status: PaymentConfirmationStatus,
  sessionId: string | null,
  isGuestSuccess: boolean,
): string {
  if (status === 'paid') {
    if (isGuestSuccess) {
      return 'Votre commande est confirmee. Vous allez recevoir un email de confirmation dans quelques minutes.'
    }

    return 'Votre paiement est confirme. Votre panier a ete vide et votre commande est disponible dans votre espace client.'
  }

  if (status === 'missing-order') {
    return "Nous n'avons pas trouve d'identifiant de commande local a verifier. Votre panier n'a pas ete modifie."
  }

  if (status === 'unconfirmed') {
    return "La confirmation Stripe n'est pas encore visible cote espace client. Votre panier n'a pas ete modifie."
  }

  return sessionId
    ? 'Merci, Stripe a renvoye votre session. Nous verifions maintenant que la commande est bien payee avant de vider le panier.'
    : 'Merci, nous verifions maintenant que la commande est bien payee avant de vider le panier.'
}
