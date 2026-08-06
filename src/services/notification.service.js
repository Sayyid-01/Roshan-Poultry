const nodemailer = require("nodemailer");

const canSend = () => process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;

const getPrimaryTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === "true",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  family: 4, // Use IPv4 to avoid potential IPv6 issues
});

const send = async ({ to, subject, html }) => {
  if (!to || !canSend()) return { skipped: true };
  try {
    const info = await getPrimaryTransporter().sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    throw err;
  }
};

exports.sendWelcomeEmail = (user) => send({
  to: user.email,
  subject: "Welcome to Roshan Poultry Farm",
  html: `<h2>Welcome, ${user.name}!</h2><p>Your Roshan Poultry customer account is ready. Fresh products are just an order away.</p>`,
});

exports.sendOrderEmail = (order, customer, event = "placed") => send({
  to: customer?.email,
  subject: `Your Roshan Poultry order ${order.orderNumber} is ${event}`,
  html: `<h2>Order ${event}</h2><p>Hi ${customer?.name || "there"}, your order <b>${order.orderNumber}</b> totals <b>₹${order.totalAmount}</b>.</p><p>Status: ${order.status}</p>`,
});

exports.sendLowStockEmail = (product) => send({
  to: process.env.ADMIN_EMAIL,
  subject: `Low stock alert: ${product.name}`,
  html: `<h2>Low stock alert</h2><p><b>${product.name}</b> has ${product.stock} ${product.unit} remaining (minimum: ${product.minimumStock}).</p>`,
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
          <p style="color: #4b5563; line-height: 1.5;">Your one-time password (OTP) for verification is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; background: #059669; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 12px 24px; border-radius: 8px;">${otp}</span>
          </div>
          <p style="color: #4b5563; line-height: 1.5;">This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">If you did not request this OTP, please ignore this email.</p>
        </div>
      </div>
    `,
  });
};