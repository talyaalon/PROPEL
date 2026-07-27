'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { CheckCircle2, MessageCircle } from 'lucide-react'
import { submitContact, type ContactState } from '@/actions/contact'
import { getWhatsAppURL } from '@/lib/whatsapp'
import type { Locale } from '@/lib/i18n'

export type ContactDict = {
  name_label: string
  business_label: string
  phone_label: string
  email_label: string
  budget_label: string
  budget_placeholder: string
  budget_options: string[]
  message_label: string
  message_placeholder: string
  optional: string
  submit: string
  sending: string
  success_title: string
  success_body: string
  error: string
  required_error: string
  email_error: string
  contact_error: string
  privacy_note: string
  privacy_link: string
  or_whatsapp: string
  whatsapp_message: string
}

type Props = {
  lang: Locale
  dict: ContactDict
}

const initialState: ContactState = { status: 'idle' }

export default function ContactForm({ lang, dict }: Props) {
  const [state, formAction] = useActionState(submitContact, initialState)

  if (state.status === 'success') {
    return (
      <div className="rounded-[24px] border border-brand-border bg-white p-8 text-center shadow-soft sm:p-12">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" aria-hidden="true" />
        <h3 className="mt-5 text-[20px] font-bold tracking-[-0.015em] text-brand-charcoal">
          {dict.success_title}
        </h3>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-[1.75] text-brand-steel">
          {dict.success_body}
        </p>
        <a
          href={getWhatsAppURL(dict.whatsapp_message)}
          target="_blank"
          rel="noopener noreferrer"
          data-analytics="whatsapp:contact-success"
          className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-brand-black px-7 py-3.5 text-[14px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(17,17,17,0.28)]"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </a>
      </div>
    )
  }

  const errorMessage =
    state.status === 'error'
      ? {
          required: dict.required_error,
          email: dict.email_error,
          contact: dict.contact_error,
          send: dict.error,
        }[state.reason]
      : null

  return (
    <form
      action={formAction}
      className="rounded-[24px] border border-brand-border bg-white p-6 shadow-soft sm:p-8"
      noValidate
    >
      {errorMessage && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800"
        >
          {errorMessage}
        </p>
      )}

      {/* Honeypot — hidden from people, irresistible to bots */}
      <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" name="name" label={dict.name_label} required autoComplete="name" />
        <Field
          id="business"
          name="business"
          label={dict.business_label}
          hint={dict.optional}
          autoComplete="organization"
        />
        <Field id="phone" name="phone" type="tel" label={dict.phone_label} autoComplete="tel" dir="ltr" />
        <Field id="email" name="email" type="email" label={dict.email_label} autoComplete="email" dir="ltr" />

        <div className="sm:col-span-2">
          <Label htmlFor="budget" text={dict.budget_label} hint={dict.optional} />
          <select
            id="budget"
            name="budget"
            defaultValue=""
            className="w-full rounded-xl border border-brand-border bg-brand-cream px-4 py-3 text-[15px] text-brand-charcoal transition-colors duration-200 focus:border-brand-charcoal focus:bg-white"
          >
            <option value="" disabled>
              {dict.budget_placeholder}
            </option>
            {dict.budget_options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="message" text={dict.message_label} required />
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            placeholder={dict.message_placeholder}
            className="w-full resize-y rounded-xl border border-brand-border bg-brand-cream px-4 py-3 text-[15px] leading-relaxed text-brand-charcoal transition-colors duration-200 placeholder:text-brand-steel/60 focus:border-brand-charcoal focus:bg-white"
          />
        </div>
      </div>

      <SubmitButton dict={dict} />

      <p className="mt-4 text-[12px] leading-relaxed text-brand-steel">
        {dict.privacy_note}{' '}
        <Link href={`/${lang}/privacy`} className="underline underline-offset-2 hover:text-brand-charcoal">
          {dict.privacy_link}
        </Link>
        .
      </p>
    </form>
  )
}

// ── Pieces ────────────────────────────────────────────────────────────────────

function SubmitButton({ dict }: { dict: ContactDict }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      data-analytics="contact:submit"
      className="mt-7 w-full rounded-full bg-brand-black px-8 py-4 text-[15px] font-semibold tracking-wide text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(17,17,17,0.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:w-auto sm:px-12"
    >
      {pending ? dict.sending : dict.submit}
    </button>
  )
}

function Label({
  htmlFor,
  text,
  required,
  hint,
}: {
  htmlFor: string
  text: string
  required?: boolean
  hint?: string
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-brand-charcoal">
      {text}
      {required && (
        <span className="text-red-600" aria-hidden="true">
          {' '}
          *
        </span>
      )}
      {hint && <span className="font-normal text-brand-steel"> ({hint})</span>}
    </label>
  )
}

function Field({
  id,
  name,
  label,
  type = 'text',
  required,
  hint,
  autoComplete,
  dir,
}: {
  id: string
  name: string
  label: string
  type?: string
  required?: boolean
  hint?: string
  autoComplete?: string
  dir?: 'ltr' | 'rtl'
}) {
  return (
    <div>
      <Label htmlFor={id} text={label} required={required} hint={hint} />
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        dir={dir}
        className="w-full rounded-xl border border-brand-border bg-brand-cream px-4 py-3 text-[15px] text-brand-charcoal transition-colors duration-200 placeholder:text-brand-steel/60 focus:border-brand-charcoal focus:bg-white"
      />
    </div>
  )
}
