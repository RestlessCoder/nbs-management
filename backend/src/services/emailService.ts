import { asyncWrapProviders } from "node:async_hooks";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "noreply@cheeaiklim.dev",
    pass: process.env.HOSTINGER_SMTP_PASS || "",
  },
});

export async function sendVerificationEmail(name: string, email: string, token: string) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  //console.log("Sending verification email to:", name, email, verifyUrl);
  //console.log("SMTP password:", process.env.HOSTINGER_SMTP_PASS);

  await transporter.sendMail({
    from: "noreply@cheeaiklim.dev",
    to: email,
    subject: "Verify your account - NBS Management System",
    text: `Hello ${name},\n\nClick here to verify your account: ${verifyUrl}`,
  });
}

export async function sendPasswordResetEmail(name: string, email: string, token: string) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  //console.log("Sending password reset email to:", name, email, resetUrl);
  //console.log("SMTP password:", process.env.HOSTINGER_SMTP_PASS);

  await transporter.sendMail({
    from: "noreply@cheeaiklim.dev",
    to: email,
    subject: "Reset your password - NBS Management System",
    text: `Hello ${name},\n\nClick here to reset your password: ${resetUrl}`,
  });

}
