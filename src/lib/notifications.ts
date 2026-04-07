import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "nathanagoodman@gmail.com";
const EMAIL_FROM = process.env.EMAIL_FROM || "Pro Spec IQ <noreply@prospeciq.com>";

interface NotifyOptions {
  subject: string;
  html: string;
}

export async function notifyAdmin({ subject, html }: NotifyOptions) {
  // Always log to console as fallback
  console.log(`[ADMIN NOTIFICATION] ${subject}`);

  if (!resend) {
    console.warn("Resend not configured — skipping email notification");
    return;
  }

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send admin notification:", error);
  }
}

// ─── Pre-built notification templates ─────────────────────

export async function notifyWaitlistSignup(data: {
  email: string;
  name?: string | null;
  company?: string | null;
  trade?: string | null;
}) {
  await notifyAdmin({
    subject: `🔔 New Waitlist Signup: ${data.email}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 32px; color: white; margin-bottom: 16px;">
          <h2 style="margin: 0 0 4px; font-size: 20px;">New Waitlist Signup</h2>
          <p style="margin: 0; color: #94a3b8; font-size: 14px;">Someone just joined the Pro Spec IQ waitlist</p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${data.email}</td>
            </tr>
            ${data.name ? `<tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Name</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${data.name}</td></tr>` : ""}
            ${data.company ? `<tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Company</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${data.company}</td></tr>` : ""}
            ${data.trade ? `<tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Trade</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${data.trade}</td></tr>` : ""}
          </table>
        </div>
      </div>
    `,
  });
}

export async function notifyNewSubscription(data: {
  email: string;
  name?: string | null;
  plan: string;
  amount: number;
  trial: boolean;
}) {
  const trialBadge = data.trial
    ? '<span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">7-day trial</span>'
    : "";

  await notifyAdmin({
    subject: `💰 New Subscription: ${data.email} → ${data.plan}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 32px; color: white; margin-bottom: 16px;">
          <h2 style="margin: 0 0 4px; font-size: 20px;">New Subscriber! 🎉</h2>
          <p style="margin: 0; color: #94a3b8; font-size: 14px;">Someone just signed up for a paid plan</p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${data.email}</td>
            </tr>
            ${data.name ? `<tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Name</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${data.name}</td></tr>` : ""}
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Plan</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${data.plan} ${trialBadge}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Amount</td>
              <td style="padding: 8px 0; font-weight: 700; font-size: 18px; color: #16a34a;">$${data.amount}/mo</td>
            </tr>
          </table>
        </div>
      </div>
    `,
  });
}

export async function notifySubscriptionCanceled(data: {
  email: string;
  plan: string;
}) {
  await notifyAdmin({
    subject: `⚠️ Subscription Canceled: ${data.email}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #7f1d1d, #991b1b); border-radius: 16px; padding: 32px; color: white; margin-bottom: 16px;">
          <h2 style="margin: 0 0 4px; font-size: 20px;">Subscription Canceled</h2>
          <p style="margin: 0; color: #fca5a5; font-size: 14px;">A user has canceled their subscription</p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${data.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Plan</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${data.plan}</td>
            </tr>
          </table>
        </div>
      </div>
    `,
  });
}
