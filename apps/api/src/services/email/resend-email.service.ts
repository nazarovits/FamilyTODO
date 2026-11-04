import { Resend } from "resend";

type PasswordResetEmailOptions = {
  recipientEmail: string;
  resetUrl: string;
};

export async function sendPasswordResetEmail({
  recipientEmail,
  resetUrl,
}: PasswordResetEmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const templateId = process.env.RESEND_RESET_PASSWORD_TEMPLATE_ID;
  const senderEmail = process.env.RESEND_RESET_PASSWORD_SENDER_EMAIL;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY must be configured to send email.");
  }
  if (!templateId) {
    throw new Error(
      "RESEND_RESET_PASSWORD_TEMPLATE_ID must be configured to send password reset email.",
    );
  }
  if (!senderEmail) {
    throw new Error(
      "RESEND_RESET_PASSWORD_SENDER_EMAIL must be configured to send password reset email.",
    );
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: senderEmail,
    to: recipientEmail,
    template: {
      id: templateId,
      variables: { resetUrl },
    },
  });

  if (error) {
    throw new Error("Resend failed to send the password reset email.");
  }
}
