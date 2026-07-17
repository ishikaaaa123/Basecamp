// backend/src/utils/mailgen.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Keep the SAME exported function name your auth controller already imports.
// If your controller imports it differently, just rename the export accordingly.
const sendVerificationEmail = async (toEmail, verificationUrl) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const from = process.env.MAIL_FROM || "onboarding@resend.dev";

    const { data, error } = await resend.emails.send({
      from,                       // e.g. "MyApp <no-reply@yourdomain.com>"
      to: [toEmail],
      subject: "Verify your email",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px">
          <h2>Verify your email</h2>
          <p>Click the button below to verify your email address:</p>
          <p>
            <a href="${verificationUrl}"
               style="background:#2563eb;color:#fff;padding:10px 18px;
                      border-radius:6px;text-decoration:none">
              Verify Email
            </a>
          </p>
          <p>Or open this link:<br/>${verificationUrl}</p>
        </div>
      `,
    });

    if (error) {
      console.error("error occured!! email service failed", error);
      throw new Error(error.message || "email service failed");
    }

    return data;
  } catch (err) {
    console.error("error occured!! email service failed", err.message);
    throw err;
  }
};

module.exports = { sendVerificationEmail };