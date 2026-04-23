import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY as string});

export const sendVerificationEmail = async (name: string, email: string, token: string) => {
  const verifyUrl = `http://localhost:3000/auth/verify-email?token=${token}`;
  
  console.log("Sending verification email to", email);
  console.log("Verification URL:", verifyUrl);
  console.log(brevo);

  /* TODOList - Need to test the email sending functionality with a real email address and check the Brevo dashboard for logs. */
  try {
    await brevo.transactionalEmails.sendTransacEmail({
        sender: { name: "NBS", email: "noreply@cheeaiklim.dev" },
        to: [{ email }],
        subject: "Verify your account",
        htmlContent: `<h1>Hello ${name},</h1>
          <p>Click <a href="${verifyUrl}">here</a> to verify your account.</p>`,
    });
    console.log("Verification email sent to", email);

  } catch (error) {
    console.error("Failed to send email:", error);

    throw error;
  }
};