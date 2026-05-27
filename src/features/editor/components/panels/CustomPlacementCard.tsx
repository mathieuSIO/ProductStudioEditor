import { useState, type FormEvent } from 'react'

import { useAuth } from '../../../auth'
import { createCustomRequest } from '../../../customRequests/api/customRequestsApi'

type CustomPlacementCardProps = {
  productName: string
  value: string
  onChange: (value: string) => void
}

const suggestionLabels = ['Manche', 'Dos bas', 'Cote coeur', 'Col / nuque']
const customRequestSuccessMessage =
  'Votre demande a bien ete envoyee. Nous reviendrons vers vous rapidement.'

export function CustomPlacementCard({
  productName,
  value,
  onChange,
}: CustomPlacementCardProps) {
  const { isAuthenticated, user } = useAuth()
  const [guestEmail, setGuestEmail] = useState('')
  const [guestFirstName, setGuestFirstName] = useState('')
  const [guestLastName, setGuestLastName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isEmpty = value.trim().length === 0
  const canSubmit = !isEmpty && !isSubmitting

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    const customerEmail = isAuthenticated ? user?.email : guestEmail.trim()

    if (!customerEmail) {
      setErrorMessage('Renseignez votre email pour envoyer la demande.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await createCustomRequest({
        customerEmail,
        customerFirstName: isAuthenticated
          ? user?.firstName ?? null
          : formatNullableValue(guestFirstName),
        customerLastName: isAuthenticated
          ? user?.lastName ?? null
          : formatNullableValue(guestLastName),
        customerPhone: isAuthenticated
          ? user?.phone ?? null
          : formatNullableValue(guestPhone),
        message: value.trim(),
      })

      onChange('')
      setGuestEmail('')
      setGuestFirstName('')
      setGuestLastName('')
      setGuestPhone('')
      setSuccessMessage(customRequestSuccessMessage)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "La demande n'a pas pu etre envoyee.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl items-center justify-center py-2 sm:py-4">
      <div className="w-full rounded-[1.4rem] border border-blue-100 bg-white px-5 py-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.22)] sm:px-6 sm:py-6">
        <div className="flex items-start justify-between gap-3 border-b border-blue-100 pb-4">
          <div className="min-w-0">
            <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
              Demande personnalisee
            </span>
            <h3 className="mt-3 text-[1.15rem] font-semibold tracking-tight text-blue-950 sm:text-[1.25rem]">
              Decrivez votre besoin
            </h3>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-stone-600">
              Indiquez ou et comment vous souhaitez personnaliser votre produit.
            </p>
          </div>

          <div className="hidden rounded-[1rem] border border-blue-100 bg-blue-50 px-3 py-2 text-right sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
              Produit
            </p>
            <p className="mt-1 text-sm font-semibold text-blue-950">
              {productName}
            </p>
          </div>
        </div>

        <form className="mt-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="sr-only">
              Description de la demande personnalisee
            </span>
            <textarea
              value={value}
              onChange={(event) => onChange(event.target.value)}
              rows={7}
              placeholder={`Exemple :\n- logo sur manche gauche\n- impression en bas du dos\n- broderie cote coeur\n- texte sur la nuque`}
              className="min-h-[150px] w-full resize-none rounded-[1.1rem] border border-blue-100 bg-blue-50/45 px-4 py-3 text-sm leading-6 text-blue-950 outline-none transition-colors placeholder:text-blue-400 focus:border-red-400 focus:bg-white"
            />
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            {suggestionLabels.map((label) => (
              <span
                key={label}
                className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-blue-700"
              >
                {label}
              </span>
            ))}
          </div>

          {!isAuthenticated ? (
            <div className="mt-4 grid gap-3 rounded-[1rem] border border-blue-100 bg-blue-50/70 px-4 py-4 sm:grid-cols-2">
              <FormField
                label="Email"
                name="customRequestEmail"
                onChange={setGuestEmail}
                required
                type="email"
                value={guestEmail}
              />
              <FormField
                label="Telephone"
                name="customRequestPhone"
                onChange={setGuestPhone}
                type="tel"
                value={guestPhone}
              />
              <FormField
                label="Prenom"
                name="customRequestFirstName"
                onChange={setGuestFirstName}
                value={guestFirstName}
              />
              <FormField
                label="Nom"
                name="customRequestLastName"
                onChange={setGuestLastName}
                value={guestLastName}
              />
            </div>
          ) : null}

          {isEmpty ? (
            <div className="mt-4 rounded-[1rem] border border-dashed border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
              Donnez un maximum de contexte utile : emplacement souhaite, type
              de marquage, taille approximative ou intention particuliere.
            </div>
          ) : (
            <div className="mt-4 rounded-[1rem] border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              Brief pret. Vous pouvez envoyer cette demande sans creer de
              commande ni modifier votre panier.
            </div>
          )}

          {errorMessage ? (
            <div className="mt-4 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-4 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              {successMessage}
            </div>
          ) : null}

          <button
            type="submit"
            className="mt-4 w-full rounded-[1rem] bg-blue-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-stone-300"
            disabled={!canSubmit}
          >
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
          </button>
        </form>
      </div>
    </div>
  )
}

type FormFieldProps = {
  label: string
  name: string
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
    <label className="grid gap-1.5 text-sm font-semibold text-blue-950">
      {label}
      <input
        className="rounded-[0.85rem] border border-blue-100 bg-white px-3 py-2.5 text-sm font-medium text-blue-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
        name={name}
        onChange={(event) => onChange(event.currentTarget.value)}
        required={required}
        type={type}
        value={value}
      />
    </label>
  )
}

function formatNullableValue(value: string): string | null {
  const formattedValue = value.trim()

  return formattedValue.length > 0 ? formattedValue : null
}
