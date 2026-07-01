import { isProd } from '../env.js';

export interface Mail {
  to: string;
  subject: string;
  text: string;
}

/**
 * Minimal mailer. There is no email provider wired up yet, so in development we
 * log the message to the console. Swap this implementation for SMTP / a provider
 * (Resend, SES, Postmark…) in production — the call sites stay the same.
 */
export async function sendMail(mail: Mail): Promise<void> {
  if (!isProd) {
    console.log(`\n📧  [dev mail] to=${mail.to}\n    ${mail.subject}\n    ${mail.text}\n`);
  }
  // TODO: integrate a real email provider for production.
}
