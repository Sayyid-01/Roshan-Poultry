const nodemailer = require("nodemailer");

const canSend = () => process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;
const transporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === "true",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const send = async ({ to, subject, html }) => {
  if (!to || !canSend()) return { skipped: true };
  return transporter().sendMail({ from: process.env.EMAIL_FROM || process.env.EMAIL_USER, to, subject, html });
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
