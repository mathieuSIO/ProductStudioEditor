import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../features/auth'
import { type Cart, type CartTotals } from '../../features/cart'
import {
  createCheckoutSession,
  createCheckoutDraft,
  createOrder,
  createOrderPayloadFromCheckoutDraft,
  type CheckoutFormData,
  type ProductionOption,
} from '../../features/checkout'
import { formatEuro } from '../../shared/formatters/formatEuro'

type CheckoutPageProps = {
  cart: Cart
  onOrderSuccess: () => void
  onReturnToCart: () => void
  onReturnToStudio: () => void
  totals: CartTotals
}

type SubmitStatus =
  | 'creating-order'
  | 'error'
  | 'idle'
  | 'redirecting-payment'

const initialFormData: CheckoutFormData = {
  comment: '',
  company: '',
  email: '',
  firstName: '',
  lastName: '',
  pays: 'France',
  ville: '',
  codePostal: '',
  adresse: '',
  phone: '',
}

const reassuranceItems = [
  'Paiement securise Stripe',
  'Commande verifiee avant production',
  'Accompagnement humain',
]

const authRequiredMessage = 'Connectez-vous pour finaliser votre commande.'
const stripeSessionErrorMessage =
  "La session de paiement Stripe n'a pas pu etre creee."

const productionOptions = [
  {
    deliveryLabel: '7 à 10 jours ouvrés',
    id: 'standard',
    label: 'Standard',
    percentage: 0,
  },
  {
    deliveryLabel: '4 à 6 jours ouvrés',
    id: 'rapide',
    label: 'Rapide',
    percentage: 0.15,
  },
  {
    deliveryLabel: '2 à 3 jours ouvrés',
    id: 'premium',
    label: 'Premium',
    percentage: 0.3,
  },
] satisfies ProductionOptionDetails[]

export function CheckoutPage({
  cart,
  onOrderSuccess,
  onReturnToCart,
  totals,
}: CheckoutPageProps) {
  const { isAuthenticated } = useAuth()
  const [formData, setFormData] = useState<CheckoutFormData>(initialFormData)
  const [productionOption, setProductionOption] =
    useState<ProductionOption>('standard')
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isCartEmpty = cart.items.length === 0
  const isSubmitting =
    submitStatus === 'creating-order' || submitStatus === 'redirecting-payment'
  const isRedirectingPayment = submitStatus === 'redirecting-payment'
  const shouldShowLoginAction = errorMessage === authRequiredMessage
  const canRetryPaymentRedirect =
    submitStatus === 'error' &&
    createdOrderId !== null &&
    errorMessage === stripeSessionErrorMessage
  const selectedProductionOption = getProductionOptionDetails(productionOption)
  const productionSupplement = totals.total * selectedProductionOption.percentage
  const estimatedTotal = totals.total + productionSupplement

  function handleFieldChange(field: keyof CheckoutFormData, value: string) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isCartEmpty || isSubmitting || createdOrderId !== null) {
      return
    }

    if (!isAuthenticated) {
      setSubmitStatus('error')
      setErrorMessage(authRequiredMessage)
      return
    }

    setSubmitStatus('creating-order')
    setCreatedOrderId(null)
    setErrorMessage(null)

    try {
      const checkoutDraft = createCheckoutDraft(cart, formData, productionOption)
      const orderPayload = createOrderPayloadFromCheckoutDraft(checkoutDraft)

      const createdOrder = await createOrder(orderPayload)

      setCreatedOrderId(createdOrder.orderId)
      onOrderSuccess()
      await redirectToStripeCheckout(createdOrder.orderId)
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'La commande n’a pas pu être envoyée.',
      )
    }
  }

  async function redirectToStripeCheckout(orderId: number) {
    setSubmitStatus('redirecting-payment')
    setErrorMessage(null)

    try {
      const checkoutSession = await createCheckoutSession(orderId)

      window.location.assign(checkoutSession.checkoutUrl)
    } catch {
      setSubmitStatus('error')
      setErrorMessage(stripeSessionErrorMessage)
    }
  }

  async function handleRetryPaymentRedirect() {
    if (createdOrderId === null || isSubmitting) {
      return
    }

    await redirectToStripeCheckout(createdOrderId)
  }
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <form
        className="overflow-hidden rounded-[1.25rem] border border-blue-100 bg-white shadow-[0_18px_42px_-34px_rgba(15,23,42,0.35)]"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-3 border-b border-blue-100 bg-blue-50 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">
              Validation
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-blue-950">
              Finaliser votre commande
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-blue-800">
              Renseignez vos informations, nous vous recontactons rapidement
              pour valider les détails.
            </p>
          </div>
          <button
            type="button"
            className="rounded-[0.95rem] border border-blue-100 bg-white px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-red-200 hover:text-red-600"
            onClick={onReturnToCart}
          >
            Retour au panier
          </button>
        </div>

        <div className="grid gap-5 p-4">
          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold text-blue-950">
              Vos coordonnées
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                label="Prénom"
                name="firstName"
                required
                disabled={isSubmitting || createdOrderId !== null}
                value={formData.firstName}
                onChange={(value) => handleFieldChange('firstName', value)}
              />
              <FormField
                label="Nom"
                name="lastName"
                required
                disabled={isSubmitting || createdOrderId !== null}
                value={formData.lastName}
                onChange={(value) => handleFieldChange('lastName', value)}
              />
              <FormField
                helpText="Nous l’utiliserons uniquement pour vous recontacter."
                label="Email"
                name="email"
                required
                disabled={isSubmitting || createdOrderId !== null}
                type="email"
                value={formData.email}
                onChange={(value) => handleFieldChange('email', value)}
              />
              <FormField
                helpText="Utile pour la livraison"
                label="Téléphone"
                name="phone"
                required
                disabled={isSubmitting || createdOrderId !== null}
                type="tel"
                value={formData.phone}
                onChange={(value) => handleFieldChange('phone', value)}
              />
              <FormField
                label="Pays"
                name="pays"
                required
                disabled={isSubmitting || createdOrderId !== null}
                type="text"
                value={formData.pays}
                onChange={(value) => handleFieldChange('pays', value)}
              />
              <FormField
                label="Ville"
                name="ville"
                required
                disabled={isSubmitting || createdOrderId !== null}
                value={formData.ville}
                onChange={(value) => handleFieldChange('ville', value)}
              />
              <FormField
                label="Code Postal"
                name="codePostal"
                required
                disabled={isSubmitting || createdOrderId !== null}
                value={formData.codePostal}
                onChange={(value) => handleFieldChange('codePostal', value)}
              />
            </div>
            <FormField
              label="Numero et nom de rue"
              name="adresse"
              disabled={isSubmitting || createdOrderId !== null}
              value={formData.adresse}
              onChange={(value) => handleFieldChange('adresse', value)}
            />
          </fieldset>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold text-blue-950">
              Délai de production
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {productionOptions.map((option) => {
                const isSelected = option.id === productionOption

                return (
                  <label
                    key={option.id}
                    className={`grid cursor-pointer gap-2 rounded-[1rem] border px-3 py-3 transition ${
                      isSelected
                        ? 'border-red-300 bg-red-50 text-blue-950'
                        : 'border-blue-100 bg-blue-50 text-blue-900 hover:border-red-200 hover:bg-white'
                    }`}
                  >
                    <input
                      checked={isSelected}
                      className="sr-only"
                      disabled={isSubmitting || createdOrderId !== null}
                      name="productionOption"
                      type="radio"
                      value={option.id}
                      onChange={() => setProductionOption(option.id)}
                    />
                    <span className="text-sm font-semibold">
                      {option.label}
                    </span>
                    <span className="text-xs font-medium leading-5 text-blue-700">
                      {option.deliveryLabel}
                    </span>
                    <span className="text-xs font-semibold text-red-600">
                      {formatProductionPercentage(option.percentage)}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>


          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold text-blue-950">
              Votre projet
            </legend>
            <FormField
              label="Entreprise"
              name="company"
              disabled={isSubmitting || createdOrderId !== null}
              value={formData.company}
              onChange={(value) => handleFieldChange('company', value)}
            />

            <label className="block">
              <span className="text-sm font-semibold text-blue-950">
                Commentaire projet
              </span>
              <textarea
                className="mt-1 min-h-32 w-full rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2.5 text-sm text-blue-950 outline-none transition placeholder:text-blue-400 focus:border-red-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-blue-50/60"
                disabled={isSubmitting || createdOrderId !== null}
                name="comment"
                value={formData.comment}
                onChange={(event) =>
                  handleFieldChange('comment', event.currentTarget.value)
                }
              />
              <span className="mt-1 block text-xs leading-5 text-blue-700">
                Précisez délai, usage, contrainte technique ou demande de
                conseil.
              </span>
            </label>
          </fieldset>

          <div className="rounded-[1rem] border border-blue-100 bg-blue-50 px-3 py-3">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-red-600">
                ✓
              </span>
              <div>
                <p className="text-sm font-semibold text-blue-950">
                  Paiement securise
                </p>
                <p className="mt-1 text-sm leading-5 text-blue-800">
                  Votre demande sert à valider les détails avant toute
                  production.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="rounded-[1rem] bg-red-600 px-4 py-3.5 text-base font-semibold text-white shadow-[0_18px_38px_-28px_rgba(220,38,38,0.75)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:border disabled:border-blue-100 disabled:bg-blue-50 disabled:text-blue-300 disabled:shadow-none"
            disabled={isCartEmpty || isSubmitting || createdOrderId !== null}
          >
            {getSubmitButtonLabel(submitStatus)}
          </button>

          {isSubmitting ? (
            <div className="rounded-[1rem] border border-blue-100 bg-blue-50 px-3 py-3 text-sm text-blue-800">
              <p className="font-semibold text-blue-950">
                {isRedirectingPayment
                  ? 'Redirection vers Stripe'
                  : 'Creation de la commande'}
              </p>
              <p className="mt-1 leading-5">
                {isRedirectingPayment
                  ? 'La commande est enregistree. Ouverture du paiement securise...'
                  : 'Nous enregistrons votre commande avant de preparer le paiement.'}
              </p>
            </div>
          ) : null}

          {submitStatus === 'error' && errorMessage ? (
            <div className="rounded-[1rem] border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
              <p className="font-semibold">Action impossible</p>
              <p className="mt-1 leading-5">{errorMessage}</p>
              {shouldShowLoginAction ? (
                <Link
                  to="/login"
                  state={{ from: '/' }}
                  className="mt-3 inline-flex min-h-10 items-center justify-center rounded-[0.9rem] bg-blue-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  Se connecter
                </Link>
              ) : null}
              {canRetryPaymentRedirect ? (
                <button
                  type="button"
                  className="mt-3 inline-flex min-h-10 items-center justify-center rounded-[0.9rem] bg-blue-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  onClick={handleRetryPaymentRedirect}
                >
                  Reessayer le paiement
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </form>

      <aside className="h-fit rounded-[1.25rem] border border-blue-100 bg-white p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.4)] lg:sticky lg:top-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">
          Récapitulatif
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-blue-950">
          Votre panier
        </h2>

        <div className="mt-4 grid gap-2">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-blue-950">
                    {item.product.name}
                  </p>
                  <p className="mt-1 text-xs font-medium text-blue-700">
                    {item.pricing.totalQuantity} pièces · {item.color.label}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-blue-950">
                  {formatEuro(item.pricing.grandTotal)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2">
          <SummaryRow
            label="Sous-total articles"
            value={formatEuro(totals.subtotal)}
          />
          <SummaryRow label="Options" value={formatEuro(totals.optionsTotal)} />
          <SummaryRow
            label={`Production ${selectedProductionOption.label}`}
            value={formatEuro(productionSupplement)}
          />
        </div>

        <div className="mt-4 rounded-[1.05rem] border border-blue-950 bg-blue-950 px-4 py-4 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100">
            Total estimé
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">
            {formatEuro(estimatedTotal)}
          </p>
          <p className="mt-2 text-xs leading-5 text-blue-100">
            Indicatif : le backend recalcule le total final.
          </p>
        </div>

        <div className="mt-4 grid gap-2 rounded-[1rem] border border-blue-100 bg-blue-50 px-3 py-3">
          {reassuranceItems.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-red-600">
                ✓
              </span>
              <span className="text-sm font-medium text-blue-950">{item}</span>
            </div>
          ))}
        </div>
      </aside>
    </section>
  )
}

type FormFieldProps = {
  disabled?: boolean
  helpText?: string
  label: string
  name: keyof CheckoutFormData
  onChange: (value: string) => void
  required?: boolean
  type?: 'email' | 'tel' | 'text'
  value: string
}

function FormField({
  disabled = false,
  helpText,
  label,
  name,
  onChange,
  required = false,
  type = 'text',
  value,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-blue-950">{label}</span>
      <input
        className="mt-1 w-full rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2.5 text-sm text-blue-950 outline-none transition focus:border-red-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-blue-50/60"
        disabled={disabled}
        name={name}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      {helpText ? (
        <span className="mt-1 block text-xs leading-5 text-blue-700">
          {helpText}
        </span>
      ) : null}
    </label>
  )
}

function getSubmitButtonLabel(submitStatus: SubmitStatus): string {
  if (submitStatus === 'creating-order') {
    return 'Creation de la commande...'
  }

  if (submitStatus === 'redirecting-payment') {
    return 'Redirection vers Stripe...'
  }

  return 'Payer ma commande'
}

type SummaryRowProps = {
  label: string
  value: string
}

type ProductionOptionDetails = {
  deliveryLabel: string
  id: ProductionOption
  label: string
  percentage: number
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[0.95rem] border border-blue-100 bg-white px-3 py-2.5 text-sm">
      <span className="font-medium text-blue-700">{label}</span>
      <span className="font-semibold text-blue-950">{value}</span>
    </div>
  )
}

function getProductionOptionDetails(
  productionOption: ProductionOption,
): ProductionOptionDetails {
  return (
    productionOptions.find((option) => option.id === productionOption) ??
    productionOptions[0]
  )
}

function formatProductionPercentage(percentage: number): string {
  return percentage === 0 ? '+0 %' : `+${Math.round(percentage * 100)} %`
}
