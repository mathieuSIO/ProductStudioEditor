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
    <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form
        className="rounded-[1rem] border border-stone-200 bg-white p-3 shadow-[0_16px_38px_-30px_rgba(28,25,23,0.2)] sm:p-4"
        onSubmit={handleSubmit}
      >
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
              Validation
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-stone-950">
              Informations client
            </h1>
          </div>
          <button
            type="button"
            className="rounded-[0.9rem] border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
            onClick={onReturnToCart}
          >
            Retour au panier
          </button>
        </div>

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
            label="Email"
            name="email"
            required
            type="email"
            value={formData.email}
            onChange={(value) => handleFieldChange('email', value)}
          />
          <FormField
            label="Téléphone"
            name="phone"
            required
            type="tel"
            value={formData.phone}
            onChange={(value) => handleFieldChange('phone', value)}
          />
          <FormField
            label="Entreprise"
            name="company"
            value={formData.company}
            onChange={(value) => handleFieldChange('company', value)}
          />
        </div>

        <label className="mt-3 block">
          <span className="text-sm font-semibold text-stone-800">
            Commentaire projet
          </span>
          <textarea
            className="mt-1 min-h-28 w-full rounded-[0.9rem] border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-stone-100"
            disabled={isSubmitting}
            name="comment"
            value={formData.comment}
            onChange={(event) =>
              handleFieldChange('comment', event.currentTarget.value)
            }
          />
        </label>

        <button
          type="submit"
          className="mt-4 rounded-[0.95rem] bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:border disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400"
          disabled={isCartEmpty || isSubmitting}
        >
          {isSubmitting ? 'Envoi en cours...' : 'Valider la demande'}
        </button>

        {submitStatus === 'success' ? (
          <p className="mt-3 rounded-[0.9rem] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            Commande reçue
          </p>
        ) : null}

        {submitStatus === 'error' && errorMessage ? (
          <p className="mt-3 rounded-[0.9rem] border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {errorMessage}
          </p>
        ) : null}
      </form>

      <aside className="rounded-[1rem] border border-stone-200 bg-white p-3 shadow-[0_16px_38px_-30px_rgba(28,25,23,0.2)] sm:p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
          Récapitulatif
        </p>
        <h2 className="mt-1 text-base font-semibold tracking-tight text-stone-950">
          Panier
        </h2>

        <div className="mt-4 grid gap-2">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="rounded-[0.9rem] border border-stone-200 bg-stone-50 px-3 py-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    {item.product.name}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {item.pricing.totalQuantity} pièces · {item.color.label}
                  </p>
                </div>
                <p className="text-sm font-semibold text-stone-900">
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

        <div className="mt-3 rounded-[0.95rem] border border-stone-900 bg-stone-900 px-3 py-3 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-300">
            Total
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight">
            {formatEuro(totals.total)}
          </p>
        </div>
      </aside>
    </section>
  )
}

type FormFieldProps = {
  label: string
  name: keyof CheckoutFormData
  onChange: (value: string) => void
  required?: boolean
  type?: 'email' | 'tel' | 'text'
  value: string
}

function FormField({
  label,
  name,
  onChange,
  required = false,
  type = 'text',
  value,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-stone-800">{label}</span>
      <input
        className="mt-1 w-full rounded-[0.9rem] border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-stone-100"
        name={name}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  )
}

type SummaryRowProps = {
  label: string
  value: string
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[0.85rem] border border-stone-200 bg-stone-50 px-3 py-2 text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="font-semibold text-stone-900">{value}</span>
    </div>
  )
}
