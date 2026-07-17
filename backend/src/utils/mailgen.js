import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email via Resend.
 * Signature kept compatible with the old nodemailer version.
 */
export const sendEmail = async (options) => {
  try {
    const { email, subject, mailgenContent } = options;

    // mailgenContent is now just { html, text } (see helpers below)
    await resend.emails.send({
      from: process.env.MAIL_FROM, // e.g. "MyApp <onboarding@resend.dev>"
      to: email,
      subject,
      html: mailgenContent.html,
      text: mailgenContent.text,
    });
  } catch (error) {
    console.log("error occured!! email service failed", error.message);
    throw new Error("email service failed");
  }
};

/**
 * Content for the "verify your email" email.
 * Returns { html, text } that sendEmail() will use.
 */
export const emailVerifyMailgenContent = (username, verificationUrl) => {
  return {
    text: `Hi ${username},

Welcome! Please verify your email by opening this link:
${verificationUrl}

If you did not create an account, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Welcome, ${username} 👋</h2>
        <p>Please verify your email address to activate your account.</p>
        <p>
          <a href="${verificationUrl}"
             style="display:inline-block;padding:10px 18px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;">
            Verify Email
          </a>
        </p>
        <p>Or copy this link into your browser:<br/>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        <p style="color:#666;font-size:12px;">If you did not create an account, you can ignore this email.</p>
      </div>
    `,
  };
};

/**
 * Content for the "forgot password" email.
 */
export const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    text: `Hi ${username},

We received a request to reset your password. Open this link to set a new one:
${passwordResetUrl}

If you did not request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Hi ${username},</h2>
        <p>We received a request to reset your password.</p>
        <p>
          <a href="${passwordResetUrl}"
             style="display:inline-block;padding:10px 18px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;">
            Reset Password
          </a>
        </p>
        <p>Or copy this link into your browser:<br/>
          <a href="${passwordResetUrl}">${passwordResetUrl}</a>
        </p>
        <p style="color:#666;font-size:12px;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  };
};


// Backward-compatible alias for the misspelled import in auth.js
export const forgotPassowrdMailgenContent = forgotPasswordMailgenContent;
