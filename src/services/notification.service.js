const nodemailer = require("nodemailer");
const dns = require("dns");
const { Resend } = require("resend");

// Force global DNS default to IPv4
dns.setDefaultResultOrder("ipv4first");

// Custom lookup function that strictly filters for IPv4 addresses
const strictIpv4Lookup = (hostname, options, callback) => {
  dns.lookup(hostname, { family: 4, all: false }, (err, address, family) => {
    if (err) return callback(err);
    callback(null, address, 4);
  });
};

// Check if ANY valid transport strategy is available
const canSend = () => {
  const hasSmtp = Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  return hasSmtp || hasResend;
};

// Primary SMTP Transporter
const getPrimaryTransporter = () => {
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure = process.env.EMAIL_SECURE === "true";

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: "TLSv1.2",
    },
    family: 4,
    lookup: strictIpv4Lookup,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });
};

// Send via Resend HTTP API (Bypasses port blocking)
const sendViaResend = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || "Roshan Poultry <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }

  return { success: true, messageId: data?.id, usedHttpApi: true };
};

const send = async ({ to, subject, html }) => {
  if (!to || !canSend()) {
    console.warn("[EMAIL] Skipped - missing environment configuration or recipient:", { to });
    return { skipped: true };
  }

  // Strategy 1: Resend HTTP API (Recommended for Cloud Environments)
  if (process.env.RESEND_API_KEY) {
    try {
      const httpResult = await sendViaResend({ to, subject, html });
      if (httpResult) {
        console.log(`[EMAIL] Sent via Resend API to ${to} - ID: ${httpResult.messageId}`);
        return httpResult;
      }
    } catch (httpErr) {
      console.error(`[EMAIL] Resend API failed for ${to}:`, httpErr.message);
    }
  }

  // Strategy 2: SMTP Fallback
  if (process.env.EMAIL_HOST) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    try {
      const info = await getPrimaryTransporter().sendMail(mailOptions);
      console.log(`[EMAIL] Sent via SMTP to ${to} - ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (primaryErr) {
      console.error(`[EMAIL] SMTP failed for ${to}:`, primaryErr.message);
      throw primaryErr;
    }
  }

  throw new Error("All configured email delivery mechanisms failed.");
};

exports.sendWelcomeEmail = (user) => send({
  to: user.email,
  subject: "Welcome to Roshan Poultry Farm",
  html: `<h2>Welcome, ${user.name}!</h2><p>Your customer account is ready.</p>`,
});

exports.sendOrderEmail = (order, customer, event = "placed") => send({
  to: customer?.email,
  subject: `Your Roshan Poultry order ${order.orderNumber} is ${event}`,
  html: `<h2>Order ${event}</h2><p>Hi ${customer?.name || "there"}, your order <b>${order.orderNumber}</b> totals <b>₹${order.totalAmount}</b>.</p>`,
});

exports.sendLowStockEmail = (product) => send({
  to: process.env.ADMIN_EMAIL,
  subject: `Low stock alert: ${product.name}`,
  html: `<h2>Low stock alert</h2><p><b>${product.name}</b> has ${product.stock} ${product.unit} remaining.</p>`,
});

exports.sendOtpEmail = async (email, otp, name) => {
  return send({
    to: email,
    subject: "Your OTP for Roshan Poultry Farm",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #059669; margin: 0;">🐔 Roshan Poultry</h2>
        </div>
        <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h3 style="margin-top: 0; color: #1f2937;">Hello ${name || "there"},</h3>
          <p style="color: #4b5563; line-height: 1.5;">Your verification OTP is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; background: #059669; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 12px 24px; border-radius: 8px;">${otp}</span>
          </div>
          <p style="color: #4b5563; line-height: 1.5;">Valid for <strong>5 minutes</strong>.</p>
        </div>
      </div>
    `,
  });
};