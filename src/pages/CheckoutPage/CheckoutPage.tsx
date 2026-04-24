import { useState } from 'react'

import { type Cart, type CartTotals } from '../../features/cart'
import {
  createCheckoutDraft,
  createOrder,
  type CheckoutFormData,
} from '../../features/checkout'
import { formatEuro } from '../../shared/formatters/formatEuro'

type CheckoutPageProps = {
  cart: Cart
  onReturnToCart: () => void
  totals: CartTotals
}

type SubmitStatus = 'error' | 'idle' | 'loading' | 'success'

const initialFormData: CheckoutFormData = {
  comment: '',
  company: '',
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
}

const reassuranceItems = [
  'Pas de paiement immédiat',
  'Vérification possible avant production',
  'Accompagnement humain',
]

export function CheckoutPage({
  cart,
  onReturnToCart,
  totals,
}: CheckoutPageProps) {
  const [formData, setFormData] = useState<CheckoutFormData>(initialFormData)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isCartEmpty = cart.items.length === 0
  const isSubmitting = submitStatus === 'loading'

  function handleFieldChange(field: keyof CheckoutFormData, value: string) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isCartEmpty || isSubmitting) {
      return
    }

    setSubmitStatus('loading')
    setErrorMessage(null)

    try {
      const checkoutDraft = createCheckoutDraft(cart, formData)

      await createOrder(checkoutDraft)
      setSubmitStatus('success')
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'La commande n’a pas pu être envoyée.',
      )
    }
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
              Finaliser votre demande
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
                value={formData.firstName}
                onChange={(value) => handleFieldChange('firstName', value)}
              />
              <FormField
                label="Nom"
                name="lastName"
                required
                value={formData.lastName}
                onChange={(value) => handleFieldChange('lastName', value)}
              />
              <FormField
                helpText="Nous l’utiliserons uniquement pour vous recontacter."
                label="Email"
                name="email"
                required
                type="email"
                value={formData.email}
                onChange={(value) => handleFieldChange('email', value)}
              />
              <FormField
                helpText="Utile pour confirmer les détails de production."
                label="Téléphone"
                name="phone"
                required
                type="tel"
                value={formData.phone}
                onChange={(value) => handleFieldChange('phone', value)}
              />
            </div>
          </fieldset>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold text-blue-950">
              Votre projet
            </legend>
            <FormField
              label="Entreprise"
              name="company"
              value={formData.company}
              onChange={(value) => handleFieldChange('company', value)}
            />

            <label className="block">
              <span className="text-sm font-semibold text-blue-950">
                Commentaire projet
              </span>
              <textarea
                className="mt-1 min-h-32 w-full rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2.5 text-sm text-blue-950 outline-none transition placeholder:text-blue-400 focus:border-red-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-blue-50/60"
                disabled={isSubmitting}
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
                  Pas de paiement immédiat
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
            disabled={isCartEmpty || isSubmitting}
          >
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande →'}
          </button>

          {submitStatus === 'success' ? (
            <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
              <p className="font-semibold">Commande reçue</p>
              <p className="mt-1 leading-5">
                Nous vous recontactons rapidement pour valider les détails.
              </p>
            </div>
          ) : null}

          {submitStatus === 'error' && errorMessage ? (
            <div className="rounded-[1rem] border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
              <p className="font-semibold">Envoi impossible</p>
              <p className="mt-1 leading-5">{errorMessage}</p>
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
          <SummaryRow label="Sous-total" value={formatEuro(totals.subtotal)} />
          <SummaryRow label="Options" value={formatEuro(totals.optionsTotal)} />
        </div>

        <div className="mt-4 rounded-[1.05rem] border border-blue-950 bg-blue-950 px-4 py-4 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100">
            Total final
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">
            {formatEuro(totals.total)}
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
  helpText?: string
  label: string
  name: keyof CheckoutFormData
  onChange: (value: string) => void
  required?: boolean
  type?: 'email' | 'tel' | 'text'
  value: string
}

function FormField({
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

type SummaryRowProps = {
  label: string
  value: string
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[0.95rem] border border-blue-100 bg-white px-3 py-2.5 text-sm">
      <span className="font-medium text-blue-700">{label}</span>
      <span className="font-semibold text-blue-950">{value}</span>
    </div>
  )
}
