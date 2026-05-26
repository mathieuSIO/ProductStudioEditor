import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { PanelCard } from '../../../components/ui/PanelCard'
import { useAuth } from '../../auth'
import {
  AccountApiError,
  fetchAccountProfile,
  updateAccountPassword,
  updateAccountProfile,
} from '../api/accountApi'
import { AccountSidebar } from '../components/AccountSidebar'
import type {
  AccountProfile,
  UpdateAccountPasswordPayload,
  UpdateAccountProfilePayload,
} from '../types/account.types'

type ProfileFormData = {
  addressLine1: string
  addressLine2: string
  city: string
  country: string
  firstName: string
  lastName: string
  phone: string
  postalCode: string
}

type PasswordFormData = {
  currentPassword: string
  newPassword: string
  newPasswordConfirmation: string
}

const emptyProfileFormData: ProfileFormData = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  country: 'France',
  firstName: '',
  lastName: '',
  phone: '',
  postalCode: '',
}

const emptyPasswordFormData: PasswordFormData = {
  currentPassword: '',
  newPassword: '',
  newPasswordConfirmation: '',
}

export function AccountPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [profileFormData, setProfileFormData] =
    useState<ProfileFormData>(emptyProfileFormData)
  const [passwordFormData, setPasswordFormData] =
    useState<PasswordFormData>(emptyPasswordFormData)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadErrorStatus, setLoadErrorStatus] = useState<number | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      setIsLoading(true)
      setLoadError(null)
      setLoadErrorStatus(null)

      try {
        const loadedProfile = await fetchAccountProfile()

        if (!isMounted) {
          return
        }

        setProfile(loadedProfile)
        setProfileFormData(createProfileFormData(loadedProfile))
      } catch (error) {
        if (!isMounted) {
          return
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : 'Le profil est indisponible.',
        )
        setLoadErrorStatus(
          error instanceof AccountApiError ? error.status : null,
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  function handleReturnToStudio() {
    navigate('/')
  }

  function handleLogin() {
    navigate('/login')
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function updateProfileField(field: keyof ProfileFormData, value: string) {
    setProfileFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }))
  }

  function updatePasswordField(field: keyof PasswordFormData, value: string) {
    setPasswordFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }))
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProfileError(null)
    setProfileSuccess(null)
    setIsSavingProfile(true)

    try {
      const updatedProfile = await updateAccountProfile(
        createUpdateProfilePayload(profileFormData),
      )

      setProfile(updatedProfile)
      setProfileFormData(createProfileFormData(updatedProfile))
      setProfileSuccess('Vos informations ont ete mises a jour.')
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Les informations n'ont pas pu etre mises a jour.",
      )
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    const payload = createUpdatePasswordPayload(passwordFormData)

    if (!payload) {
      return
    }

    setIsSavingPassword(true)

    try {
      await updateAccountPassword(payload)
      setPasswordFormData(emptyPasswordFormData)
      setPasswordSuccess('Votre mot de passe a ete mis a jour.')
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Le mot de passe n'a pas pu etre mis a jour.",
      )
    } finally {
      setIsSavingPassword(false)
    }
  }

  function createUpdatePasswordPayload(
    formData: PasswordFormData,
  ): UpdateAccountPasswordPayload | null {
    if (formData.newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caracteres.')
      return null
    }

    if (formData.newPassword !== formData.newPasswordConfirmation) {
      setPasswordError('La confirmation du nouveau mot de passe ne correspond pas.')
      return null
    }

    return {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]">
      <AccountSidebar
        onLogout={handleLogout}
        onReturnToStudio={handleReturnToStudio}
        userName={formatUserName(profile, user)}
      />

      <div className="min-w-0">
        <div className="mb-4 rounded-[1.25rem] border border-stone-200 bg-white px-4 py-5 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.28)] sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Mon compte
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
            Mes informations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Consultez et mettez a jour vos coordonnees pour faciliter le suivi
            de vos commandes textile.
          </p>
        </div>

        {isLoading ? (
          <StateMessage
            title="Chargement du profil"
            description="Nous recuperons vos informations de compte."
          />
        ) : loadError ? (
          <StateMessage
            title="Profil indisponible"
            description={loadError}
            tone="error"
            actionLabel={
              loadErrorStatus === 401 ? 'Se reconnecter' : 'Retour au studio'
            }
            onAction={loadErrorStatus === 401 ? handleLogin : handleReturnToStudio}
          />
        ) : (
          <div className="grid min-w-0 gap-4">
            <PanelCard
              eyebrow="Profil"
              title="Informations personnelles"
              description="Ces informations sont utilisees pour vos commandes et le suivi client."
            >
              <form className="grid gap-4" onSubmit={handleProfileSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Prenom"
                    name="firstName"
                    onChange={(value) => updateProfileField('firstName', value)}
                    required
                    value={profileFormData.firstName}
                  />
                  <FormField
                    label="Nom"
                    name="lastName"
                    onChange={(value) => updateProfileField('lastName', value)}
                    required
                    value={profileFormData.lastName}
                  />
                  <ReadOnlyField label="Email" value={profile?.email ?? ''} />
                  <FormField
                    label="Telephone"
                    name="phone"
                    onChange={(value) => updateProfileField('phone', value)}
                    type="tel"
                    value={profileFormData.phone}
                  />
                </div>

                <div className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-4">
                  <p className="text-sm font-semibold text-blue-950">
                    Adresse
                  </p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <FormField
                      label="Adresse"
                      name="addressLine1"
                      onChange={(value) =>
                        updateProfileField('addressLine1', value)
                      }
                      value={profileFormData.addressLine1}
                    />
                    <FormField
                      label="Complement"
                      name="addressLine2"
                      onChange={(value) =>
                        updateProfileField('addressLine2', value)
                      }
                      value={profileFormData.addressLine2}
                    />
                    <FormField
                      label="Code postal"
                      name="postalCode"
                      onChange={(value) => updateProfileField('postalCode', value)}
                      value={profileFormData.postalCode}
                    />
                    <FormField
                      label="Ville"
                      name="city"
                      onChange={(value) => updateProfileField('city', value)}
                      value={profileFormData.city}
                    />
                    <FormField
                      label="Pays"
                      name="country"
                      onChange={(value) => updateProfileField('country', value)}
                      required
                      value={profileFormData.country}
                    />
                  </div>
                </div>

                <FormFeedback error={profileError} success={profileSuccess} />
                <SubmitButton
                  isLoading={isSavingProfile}
                  label="Enregistrer les informations"
                />
              </form>
            </PanelCard>

            <PanelCard
              eyebrow="Securite"
              title="Changer le mot de passe"
              description="Utilisez un mot de passe d'au moins 8 caracteres."
            >
              <form className="grid gap-4" onSubmit={handlePasswordSubmit}>
                <FormField
                  autoComplete="current-password"
                  label="Mot de passe actuel"
                  name="currentPassword"
                  onChange={(value) =>
                    updatePasswordField('currentPassword', value)
                  }
                  required
                  type="password"
                  value={passwordFormData.currentPassword}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    autoComplete="new-password"
                    label="Nouveau mot de passe"
                    name="newPassword"
                    onChange={(value) =>
                      updatePasswordField('newPassword', value)
                    }
                    required
                    type="password"
                    value={passwordFormData.newPassword}
                  />
                  <FormField
                    autoComplete="new-password"
                    label="Confirmer le nouveau mot de passe"
                    name="newPasswordConfirmation"
                    onChange={(value) =>
                      updatePasswordField('newPasswordConfirmation', value)
                    }
                    required
                    type="password"
                    value={passwordFormData.newPasswordConfirmation}
                  />
                </div>

                <FormFeedback error={passwordError} success={passwordSuccess} />
                <SubmitButton
                  isLoading={isSavingPassword}
                  label="Mettre a jour le mot de passe"
                />
              </form>
            </PanelCard>
          </div>
        )}
      </div>
    </section>
  )
}

type FormFieldProps = {
  autoComplete?: string
  label: string
  name: string
  onChange: (value: string) => void
  required?: boolean
  type?: 'password' | 'tel' | 'text'
  value: string
}

function FormField({
  autoComplete,
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
        autoComplete={autoComplete}
        className="rounded-[0.9rem] border border-stone-200 bg-white px-3 py-3 text-sm font-medium text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </label>
  )
}

type ReadOnlyFieldProps = {
  label: string
  value: string
}

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div className="grid gap-1.5 text-sm font-semibold text-blue-950">
      {label}
      <div className="rounded-[0.9rem] border border-stone-200 bg-stone-100 px-3 py-3 text-sm font-medium text-stone-600">
        {value}
      </div>
    </div>
  )
}

type FormFeedbackProps = {
  error: string | null
  success: string | null
}

function FormFeedback({ error, success }: FormFeedbackProps) {
  if (error) {
    return (
      <div className="rounded-[1rem] border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
        {error}
      </div>
    )
  }

  if (success) {
    return (
      <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">
        {success}
      </div>
    )
  }

  return null
}

type SubmitButtonProps = {
  isLoading: boolean
  label: string
}

function SubmitButton({ isLoading, label }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className="w-fit rounded-[0.95rem] bg-blue-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-400"
      disabled={isLoading}
    >
      {isLoading ? 'Enregistrement...' : label}
    </button>
  )
}

type StateMessageProps = {
  actionLabel?: string
  description: string
  onAction?: () => void
  title: string
  tone?: 'default' | 'error'
}

function StateMessage({
  actionLabel,
  description,
  onAction,
  title,
  tone = 'default',
}: StateMessageProps) {
  const className =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-stone-200 bg-stone-50 text-stone-600'

  return (
    <div
      className={`rounded-[1.25rem] border bg-white px-4 py-10 text-center shadow-[0_18px_42px_-36px_rgba(15,23,42,0.22)] ${className}`}
    >
      <p className="text-base font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          className="mt-4 rounded-[0.95rem] bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

function createProfileFormData(profile: AccountProfile): ProfileFormData {
  return {
    addressLine1: profile.addressLine1 ?? '',
    addressLine2: profile.addressLine2 ?? '',
    city: profile.city ?? '',
    country: profile.country,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone ?? '',
    postalCode: profile.postalCode ?? '',
  }
}

function createUpdateProfilePayload(
  formData: ProfileFormData,
): UpdateAccountProfilePayload {
  return {
    addressLine1: formatNullableValue(formData.addressLine1),
    addressLine2: formatNullableValue(formData.addressLine2),
    city: formatNullableValue(formData.city),
    country: formData.country.trim() || 'France',
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    phone: formatNullableValue(formData.phone),
    postalCode: formatNullableValue(formData.postalCode),
  }
}

function formatNullableValue(value: string): string | null {
  const formattedValue = value.trim()

  return formattedValue.length > 0 ? formattedValue : null
}

function formatUserName(
  profile: AccountProfile | null,
  user: { firstName: string; lastName: string } | null,
): string | undefined {
  const firstName = profile?.firstName ?? user?.firstName
  const lastName = profile?.lastName ?? user?.lastName
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  return fullName.length > 0 ? fullName : undefined
}
