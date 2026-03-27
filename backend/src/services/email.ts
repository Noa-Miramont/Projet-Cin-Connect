import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import nodemailer from 'nodemailer'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

type SendPasswordResetEmailInput = {
  to: string
  username: string
  resetLink: string
}

export type SendPasswordResetEmailResult = {
  provider: 'mailgun' | 'ses' | 'gmail' | 'console'
  id?: string
}

const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER ?? 'console').toLowerCase()

// Mailgun
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY ?? ''
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN ?? ''
const MAILGUN_BASE_URL = process.env.MAILGUN_BASE_URL ?? 'https://api.mailgun.net'
const MAILGUN_FROM =
  process.env.MAILGUN_FROM ??
  (MAILGUN_DOMAIN ? `Mailgun Sandbox <postmaster@${MAILGUN_DOMAIN}>` : '')

// AWS SES
const AWS_SES_REGION = process.env.AWS_SES_REGION ?? ''
const AWS_SES_ACCESS_KEY_ID = process.env.AWS_SES_ACCESS_KEY_ID ?? ''
const AWS_SES_SECRET_ACCESS_KEY = process.env.AWS_SES_SECRET_ACCESS_KEY ?? ''
const AWS_SES_FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL ?? ''

// Gmail (Nodemailer)
const EMAIL_USER = process.env.EMAIL_USER ?? ''
const EMAIL_PASS = process.env.EMAIL_PASS ?? ''

function buildPasswordResetEmail(input: SendPasswordResetEmailInput) {
  const subject = 'Réinitialisation du mot de passe'
  const text = [
    `Bonjour ${input.username},`,
    '',
    'Vous avez demandé la réinitialisation de votre mot de passe.',
    'Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :',
    input.resetLink,
    '',
    'Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.'
  ].join('\n')

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin-bottom: 12px;">Réinitialisation du mot de passe</h2>
      <p>Bonjour <strong>${input.username}</strong>,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe CinéConnect.</p>
      <p>
        <a href="${input.resetLink}" style="display:inline-block;padding:10px 16px;background:#111827;color:#fff;text-decoration:none;border-radius:6px;">
          Réinitialiser mon mot de passe
        </a>
      </p>
      <p>Si le bouton ne fonctionne pas, copiez/collez ce lien :</p>
      <p><a href="${input.resetLink}">${input.resetLink}</a></p>
      <p style="margin-top: 24px; color: #6b7280;">Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.</p>
    </div>
  `

  return { subject, text, html }
}

async function sendWithMailgun(
  input: SendPasswordResetEmailInput
): Promise<SendPasswordResetEmailResult> {
  if (!MAILGUN_API_KEY) throw new Error('MAILGUN_API_KEY manquant')
  if (!MAILGUN_DOMAIN) throw new Error('MAILGUN_DOMAIN manquant')

  const mailgun = new Mailgun(FormData)
  const mg = mailgun.client({
    username: 'api',
    key: MAILGUN_API_KEY,
    url: MAILGUN_BASE_URL
  })

  try {
    const { subject, text, html } = buildPasswordResetEmail(input)
    const response = await mg.messages.create(MAILGUN_DOMAIN, {
      from: MAILGUN_FROM,
      to: input.to,
      subject,
      text,
      html
    })

    console.log('[EMAIL:MAILGUN] Email envoyé', {
      to: input.to,
      id: response?.id,
      domain: MAILGUN_DOMAIN
    })
    return { provider: 'mailgun', id: response?.id }
  } catch (error) {
    const err = error as {
      message?: string
      status?: number
      details?: unknown
      response?: { body?: unknown }
    }
    console.error('[EMAIL:MAILGUN] Envoi échoué', {
      to: input.to,
      message: err.message,
      status: err.status,
      details: err.details ?? err.response?.body
    })
    throw new Error('Échec de l’envoi de l’email de réinitialisation')
  }
}

async function sendWithSes(
  input: SendPasswordResetEmailInput
): Promise<SendPasswordResetEmailResult> {
  if (!AWS_SES_REGION) throw new Error('AWS_SES_REGION manquant')
  if (!AWS_SES_FROM_EMAIL) throw new Error('AWS_SES_FROM_EMAIL manquant')

  try {
    const ses = new SESClient({
      region: AWS_SES_REGION,
      credentials:
        AWS_SES_ACCESS_KEY_ID && AWS_SES_SECRET_ACCESS_KEY
          ? {
              accessKeyId: AWS_SES_ACCESS_KEY_ID,
              secretAccessKey: AWS_SES_SECRET_ACCESS_KEY
            }
          : undefined
    })

    const { subject, text, html } = buildPasswordResetEmail(input)
    const response = await ses.send(
      new SendEmailCommand({
        Destination: { ToAddresses: [input.to] },
        Message: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: html, Charset: 'UTF-8' },
            Text: { Data: text, Charset: 'UTF-8' }
          }
        },
        ReplyToAddresses: [AWS_SES_FROM_EMAIL],
        Source: AWS_SES_FROM_EMAIL
      })
    )

    console.info('[EMAIL:SES] Email envoyé', { to: input.to, id: response?.MessageId })
    return { provider: 'ses', id: response?.MessageId }
  } catch (error) {
    const err = error as { message?: string; $metadata?: { httpStatusCode?: number } }
    console.error('[EMAIL:SES] Envoi échoué', {
      to: input.to,
      message: err.message,
      status: err.$metadata?.httpStatusCode
    })
    throw new Error('Échec de l’envoi de l’email de réinitialisation')
  }
}

async function sendWithGmail(
  input: SendPasswordResetEmailInput
): Promise<SendPasswordResetEmailResult> {
  if (!EMAIL_USER) throw new Error('EMAIL_USER manquant')
  if (!EMAIL_PASS) throw new Error('EMAIL_PASS manquant')

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    })

    const { subject, text, html } = buildPasswordResetEmail(input)
    const info = await transporter.sendMail({
      from: EMAIL_USER,
      to: input.to,
      subject,
      text,
      html
    })

    console.info('[EMAIL:GMAIL] Email envoyé', { to: input.to, id: info.messageId })
    return { provider: 'gmail', id: info.messageId }
  } catch (error) {
    const err = error as { message?: string }
    console.error('[EMAIL:GMAIL] Envoi échoué', {
      to: input.to,
      message: err.message
    })
    throw new Error('Échec de l’envoi de l’email de réinitialisation')
  }
}

async function dispatchPasswordResetEmail(
  input: SendPasswordResetEmailInput
): Promise<SendPasswordResetEmailResult> {
  if (EMAIL_PROVIDER === 'mailgun') return sendWithMailgun(input)
  if (EMAIL_PROVIDER === 'ses') return sendWithSes(input)
  if (EMAIL_PROVIDER === 'gmail') return sendWithGmail(input)

  const { subject, text } = buildPasswordResetEmail(input)
  console.log('[EMAIL:CONSOLE]', { to: input.to, subject, text })
  return { provider: 'console' }
}

export const emailService = {
  async sendResetEmail(
    input: SendPasswordResetEmailInput
  ): Promise<SendPasswordResetEmailResult> {
    return dispatchPasswordResetEmail(input)
  },

  async sendPasswordResetEmail(
    input: SendPasswordResetEmailInput
  ): Promise<SendPasswordResetEmailResult> {
    return dispatchPasswordResetEmail(input)
  }
}
