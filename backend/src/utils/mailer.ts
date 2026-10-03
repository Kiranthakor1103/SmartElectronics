import nodemailer from "nodemailer";

export interface SupportTicketMailPayload {
  ticketId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Creates a Nodemailer Transporter based on environment variables or direct MX delivery.
 */
function createTransporter(recipientEmail: string) {
  const host = process.env.SMTP_HOST || "smtp.mailtrap.io";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const isPlaceholder = !user || user.includes("your_mailtrap") || !pass || pass.includes("your_mailtrap");

  // 1. If real authenticated SMTP credentials are provided, use them
  if (!isPlaceholder && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  // 2. If sending to Yopmail (@yopmail.com), deliver directly to Yopmail's inbound MX server
  if (recipientEmail && recipientEmail.toLowerCase().endsWith("@yopmail.com")) {
    return nodemailer.createTransport({
      host: "smtp.yopmail.com",
      port: 25,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return null;
}

/**
 * Sends customer support ticket to the designated Admin Support email.
 */
export async function sendSupportTicketEmail(payload: SupportTicketMailPayload): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
  const adminEmail = process.env.ADMIN_SUPPORT_EMAIL || "supportsmatel23@yopmail.com";
  const fromEmail = process.env.FROM_EMAIL || "support@smartelectronics.com";

  const emailSubject = `[Support Ticket #${payload.ticketId}] ${payload.subject || "New Customer Inquiry"}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #090d16 0%, #312e81 100%); color: #ffffff; padding: 28px 32px; }
          .badge { display: inline-block; padding: 4px 12px; background: rgba(99, 102, 241, 0.25); border: 1px solid #818cf8; border-radius: 20px; font-size: 12px; font-weight: 700; color: #c7d2fe; text-transform: uppercase; margin-bottom: 8px; }
          .title { margin: 0; font-size: 22px; font-weight: 800; }
          .content { padding: 32px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .info-table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
          .info-label { font-weight: 700; color: #64748b; width: 140px; }
          .info-value { color: #0f172a; font-weight: 600; }
          .message-box { background: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 8px; padding: 18px 20px; font-size: 14px; line-height: 1.6; color: #334155; margin-top: 16px; white-space: pre-wrap; }
          .actions { margin-top: 28px; text-align: center; }
          .btn { display: inline-block; padding: 12px 24px; background: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; }
          .footer { background: #f1f5f9; padding: 16px 32px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Support Ticket #${payload.ticketId}</span>
            <h1 class="title">New Customer Support Request</h1>
          </div>
          <div class="content">
            <table class="info-table">
              <tr>
                <td class="info-label">Customer Name</td>
                <td class="info-value">${payload.name}</td>
              </tr>
              <tr>
                <td class="info-label">Customer Email</td>
                <td class="info-value"><a href="mailto:${payload.email}" style="color: #4f46e5;">${payload.email}</a></td>
              </tr>
              <tr>
                <td class="info-label">Inquiry Subject</td>
                <td class="info-value">${payload.subject || "General Inquiry"}</td>
              </tr>
              <tr>
                <td class="info-label">Ticket ID</td>
                <td class="info-value"><strong>${payload.ticketId}</strong></td>
              </tr>
              <tr>
                <td class="info-label">Received At</td>
                <td class="info-value">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td>
              </tr>
            </table>

            <h3 style="margin: 20px 0 8px 0; font-size: 14px; text-transform: uppercase; color: #64748b; font-weight: 800;">Message Content</h3>
            <div class="message-box">${payload.message}</div>

            <div class="actions">
              <a href="mailto:${payload.email}?subject=Re: [Ticket #${payload.ticketId}] ${encodeURIComponent(payload.subject || "Support Inquiry")}" class="btn">
                Reply Directly to Customer
              </a>
            </div>
          </div>
          <div class="footer">
            SmartElectronics Platform Support Dispatch • Automated Notification for ${adminEmail}
          </div>
        </div>
      </body>
    </html>
  `;

  const textBody = `
[SmartElectronics Support Ticket #${payload.ticketId}]
From: ${payload.name} (${payload.email})
Subject: ${payload.subject}
Date: ${new Date().toISOString()}

Message:
${payload.message}

---
To reply directly, send an email to: ${payload.email}
Target Admin: ${adminEmail}
  `;

  try {
    const transporter = createTransporter(adminEmail);

    if (transporter) {
      const info = await transporter.sendMail({
        from: `"SmartElectronics Support" <${fromEmail}>`,
        to: adminEmail,
        replyTo: payload.email,
        subject: emailSubject,
        text: textBody,
        html: htmlBody,
      });

      console.log(`✉️ [Nodemailer] Support ticket #${payload.ticketId} emailed to ${adminEmail}. MessageID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } else {
      // SMTP credentials are not yet configured with real user/password
      console.log(`\n================================================================`);
      console.log(`✉️ [Nodemailer Emulation] Support ticket #${payload.ticketId} dispatched!`);
      console.log(`➡️  Recipient (Admin): ${adminEmail}`);
      console.log(`👤 From Customer:     ${payload.name} <${payload.email}>`);
      console.log(`📌 Subject:           ${emailSubject}`);
      console.log(`💬 Message:           ${payload.message}`);
      console.log(`ℹ️  Note: Add real SMTP_USER and SMTP_PASS in backend/.env for live network delivery.`);
      console.log(`================================================================\n`);
      return { success: true, messageId: `mock_${Date.now()}` };
    }
  } catch (error: any) {
    console.warn(`⚠️ [Nodemailer] Failed to send email to ${adminEmail}:`, error.message);
    return { success: false };
  }
}

/**
 * Sends a welcome confirmation email to a new newsletter subscriber.
 */
export async function sendNewsletterWelcomeEmail(subscriberEmail: string): Promise<{ success: boolean; messageId?: string }> {
  const fromEmail = process.env.FROM_EMAIL || "alerts@smartelectronics.com";
  const emailSubject = "⚡ Welcome to SmartElectronics Tech Drop Alerts!";

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #2563eb 100%); color: #ffffff; padding: 36px 32px; text-align: center; }
          .badge { display: inline-block; padding: 4px 14px; background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; border-radius: 9999px; font-size: 11px; font-weight: 800; color: #bae6fd; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
          .title { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.02em; }
          .subtitle { margin: 8px 0 0; color: #cbd5e1; font-size: 13px; font-weight: 500; }
          .content { padding: 32px; }
          .perks { background: #f8fafc; border-radius: 14px; padding: 20px; border: 1px solid #e2e8f0; margin: 20px 0; }
          .perk-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
          .perk-item:last-child { margin-bottom: 0; }
          .perk-icon { font-size: 18px; line-height: 1; }
          .perk-text { font-size: 13px; color: #334155; }
          .perk-title { font-weight: 700; color: #0f172a; margin-bottom: 2px; }
          .actions { margin-top: 28px; text-align: center; }
          .btn { display: inline-block; padding: 13px 28px; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 13px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35); }
          .footer { background: #0f172a; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">VIP Tech Insider</span>
            <h1 class="title">You're On The List! ⚡</h1>
            <p class="subtitle">Welcome to exclusive SmartElectronics Tech Drop Alerts</p>
          </div>
          <div class="content">
            <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-top: 0;">
              Hi there! Thank you for subscribing. You've officially unlocked priority VIP access to our most anticipated electronics drops.
            </p>

            <div class="perks">
              <div class="perk-item">
                <div class="perk-icon">🚀</div>
                <div class="perk-text">
                  <div class="perk-title">Priority Tech Drops</div>
                  <div>Get notified 30 minutes before high-demand flagship smartphones, GPUs, and consoles launch.</div>
                </div>
              </div>
              <div class="perk-item">
                <div class="perk-icon">🏷️</div>
                <div class="perk-text">
                  <div class="perk-title">Exclusive Subscriber Codes</div>
                  <div>Receive secret promo codes and subscriber-only flash sales straight to your inbox.</div>
                </div>
              </div>
              <div class="perk-item">
                <div class="perk-icon">⚡</div>
                <div class="perk-text">
                  <div class="perk-title">Instant Price Drop Alerts</div>
                  <div>Real-time notifications whenever 4K TVs, laptops, and smart home tech go on sale.</div>
                </div>
              </div>
            </div>

            <div class="actions">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" class="btn">
                Explore Latest Electronics
              </a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} SmartElectronics Retail Pvt Ltd. All rights reserved.<br>
            You received this email because you subscribed to Tech Drop Alerts at SmartElectronics.
          </div>
        </div>
      </body>
    </html>
  `;

  const textBody = `
Welcome to SmartElectronics Tech Drop Alerts! ⚡

You've officially joined our VIP list. Here's what to expect:
- Priority access to limited hardware drops
- Exclusive subscriber promo codes & flash deals
- Instant price-drop notifications on flagship electronics

Visit our store: ${process.env.FRONTEND_URL || 'http://localhost:3000'}

SmartElectronics Retail Pvt Ltd.
  `;

  try {
    const transporter = createTransporter(subscriberEmail);

    if (transporter) {
      const info = await transporter.sendMail({
        from: `"SmartElectronics Alerts" <${fromEmail}>`,
        to: subscriberEmail,
        subject: emailSubject,
        text: textBody,
        html: htmlBody,
      });

      console.log(`✉️ [Nodemailer] Newsletter welcome email sent to ${subscriberEmail}. MessageID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`\n================================================================`);
      console.log(`✉️ [Nodemailer Emulation] Newsletter welcome email dispatched!`);
      console.log(`➡️  Subscriber: ${subscriberEmail}`);
      console.log(`📌 Subject:    ${emailSubject}`);
      console.log(`ℹ️  Note: Add SMTP_USER and SMTP_PASS in backend/.env for live delivery.`);
      console.log(`================================================================\n`);
      return { success: true, messageId: `mock_news_${Date.now()}` };
    }
  } catch (error: any) {
    console.warn(`⚠️ [Nodemailer] Could not dispatch welcome email to ${subscriberEmail}:`, error.message);
    return { success: false };
  }
}

export interface BroadcastMailPayload {
  recipients: string[];
  title: string;
  message: string;
  badge?: string;
  themeColor?: string;
  actionLabel?: string;
  actionUrl?: string;
}

/**
 * Broadcasts an email notification to targeted recipients or admin inbox.
 */
export async function sendBroadcastNotificationEmail(
  payload: BroadcastMailPayload
): Promise<{ success: boolean; sentCount: number; messageId?: string }> {
  const fromEmail = process.env.FROM_EMAIL || "alerts@smartelectronics.com";
  const defaultAdmin = process.env.ADMIN_SUPPORT_EMAIL || "supportsmatel23@yopmail.com";
  const recipientList = payload.recipients.length > 0 ? payload.recipients : [defaultAdmin];

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px; color: #f8fafc; }
          .container { max-width: 580px; margin: 0 auto; background: #0f172a; border-radius: 20px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .header { background: linear-gradient(135deg, #020617 0%, #1e1b4b 60%, #0284c7 100%); color: #ffffff; padding: 32px 28px; text-align: center; }
          .badge { display: inline-block; padding: 4px 14px; background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; border-radius: 9999px; font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
          .title { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.01em; color: #ffffff; }
          .content { padding: 30px 28px; background: #090d16; }
          .message-card { background: #111827; border-radius: 14px; padding: 20px; border: 1px solid #1f2937; margin: 16px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6; }
          .actions { margin-top: 26px; text-align: center; }
          .btn { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #0284c7, #2563eb); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 13px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4); }
          .footer { background: #020617; padding: 18px 28px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">${payload.badge || "ANNOUNCEMENT"}</span>
            <h1 class="title">${payload.title}</h1>
          </div>
          <div class="content">
            <div class="message-card">
              ${payload.message}
            </div>
            ${
              payload.actionUrl
                ? `
              <div class="actions">
                <a href="${payload.actionUrl.startsWith("http") ? payload.actionUrl : `${process.env.FRONTEND_URL || "http://localhost:3000"}${payload.actionUrl}`}" class="btn">
                  ${payload.actionLabel || "View Updates"} &rarr;
                </a>
              </div>
            `
                : ""
            }
          </div>
          <div class="footer">
            SmartElectronics Notification Channel Dispatch &bull; Automated Broadcast
          </div>
        </div>
      </body>
    </html>
  `;

  let sentCount = 0;
  let lastMessageId: string | undefined;

  for (const email of recipientList) {
    try {
      const transporter = createTransporter(email);
      if (transporter) {
        const info = await transporter.sendMail({
          from: `"SmartElectronics" <${fromEmail}>`,
          to: email,
          subject: payload.title,
          text: `${payload.title}\n\n${payload.message}\n\nSmartElectronics`,
          html: htmlBody,
        });
        sentCount++;
        lastMessageId = info.messageId;
        console.log(`✉️ [Nodemailer] Broadcast dispatched to ${email} (MessageID: ${info.messageId})`);
      } else {
        sentCount++;
        lastMessageId = `mock_bcast_${Date.now()}`;
        console.log(`✉️ [Nodemailer Emulation] Broadcast dispatched to ${email}: "${payload.title}"`);
      }
    } catch (err: any) {
      console.warn(`⚠️ [Nodemailer] Could not dispatch broadcast to ${email}:`, err.message);
    }
  }

  return { success: sentCount > 0, sentCount, messageId: lastMessageId };
}

export interface PasswordResetMailPayload {
  to: string;
  name: string;
  resetUrl: string;
  portal?: "customer" | "admin";
}

/**
 * Sends a password reset email with secure token link.
 */
export async function sendPasswordResetEmail(
  payload: PasswordResetMailPayload
): Promise<{ success: boolean; messageId?: string }> {
  const fromEmail = process.env.FROM_EMAIL || "security@smartelectronics.com";
  const portalName = payload.portal === "admin" ? "Admin Console" : "Customer Portal";
  const emailSubject = `🔐 Reset Your SmartElectronics Password (${portalName})`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px; color: #f8fafc; }
          .container { max-width: 580px; margin: 0 auto; background: #0f172a; border-radius: 20px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .header { background: linear-gradient(135deg, #020617 0%, #1e1b4b 60%, #4338ca 100%); color: #ffffff; padding: 36px 32px; text-align: center; }
          .badge { display: inline-block; padding: 4px 14px; background: rgba(99, 102, 241, 0.25); border: 1px solid #6366f1; border-radius: 9999px; font-size: 11px; font-weight: 800; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
          .title { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.01em; color: #ffffff; }
          .content { padding: 32px 28px; background: #090d16; }
          .text { font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 18px 0; }
          .highlight-card { background: #111827; border-radius: 14px; padding: 18px; border: 1px solid #1f2937; margin: 20px 0; border-left: 4px solid #6366f1; }
          .actions { margin: 30px 0; text-align: center; }
          .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); letter-spacing: 0.02em; }
          .security-note { font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 24px; padding-top: 18px; border-top: 1px solid #1e293b; }
          .footer { background: #020617; padding: 20px 28px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Security Alert &bull; ${portalName}</span>
            <h1 class="title">Password Reset Request</h1>
          </div>
          <div class="content">
            <p class="text">Hello <strong>${payload.name || "User"}</strong>,</p>
            <p class="text">
              We received a request to reset your password for your <strong>SmartElectronics</strong> account. Click the button below to establish a new password:
            </p>

            <div class="actions">
              <a href="${payload.resetUrl}" class="btn">
                Reset My Password &rarr;
              </a>
            </div>

            <div class="highlight-card">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 600;">
                ⏱️ <strong>Time Sensitive:</strong> This password reset link is securely encrypted and expires in <strong>1 hour</strong>.
              </p>
            </div>

            <div class="security-note">
              🔒 <strong>Didn't request this change?</strong> You can safely ignore this email. Your current password will remain unchanged and your account stays protected with 256-bit security guards.
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} SmartElectronics Retail Pvt Ltd. All rights reserved.<br>
            Automated Security Dispatch &bull; Please do not reply directly to this email.
          </div>
        </div>
      </body>
    </html>
  `;

  const textBody = `
Password Reset Request - SmartElectronics (${portalName})

Hello ${payload.name || "User"},

We received a request to reset your password. Click the link below to set a new password:
${payload.resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this message.

SmartElectronics Security Team
  `;

  try {
    const transporter = createTransporter(payload.to);
    if (transporter) {
      const info = await transporter.sendMail({
        from: `"SmartElectronics Security" <${fromEmail}>`,
        to: payload.to,
        subject: emailSubject,
        text: textBody,
        html: htmlBody,
      });
      console.log(`✉️ [Nodemailer] Password reset email sent to ${payload.to}. MessageID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`\n================================================================`);
      console.log(`✉️ [Nodemailer Emulation] Password reset email dispatched!`);
      console.log(`➡️  Recipient: ${payload.to}`);
      console.log(`🔗 Reset URL:  ${payload.resetUrl}`);
      console.log(`ℹ️  Note: Add SMTP_USER and SMTP_PASS in backend/.env for live delivery.`);
      console.log(`================================================================\n`);
      return { success: true, messageId: `mock_pwd_${Date.now()}` };
    }
  } catch (err: any) {
    console.warn(`⚠️ [Nodemailer] Could not dispatch password reset email to ${payload.to}:`, err.message);
    return { success: false };
  }
}

