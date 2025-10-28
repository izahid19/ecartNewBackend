const Brevo = require("@getbrevo/brevo");

/**
 * Sends a verification email via Brevo (works on Railway without a domain).
 * @param {string} token - Unique verification token
 * @param {string} email - Recipient's email address
 */
const verifyEmail = async (token, email) => {
  try {
    const { BREVO_API_KEY, FROM_EMAIL, FROM_NAME, FRONTEND_URL } = process.env;
    if (!BREVO_API_KEY) throw new Error("Missing BREVO_API_KEY in .env");

    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);

    const verificationLink = `${FRONTEND_URL}/verify/${token}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 30px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          
          <div style="background-color: #007bff; color: white; text-align: center; padding: 20px;">
            <h1 style="margin: 0;">Ecart</h1>
            <p>Your trusted online shopping platform</p>
          </div>

          <div style="padding: 25px; color: #333;">
            <h2>Welcome to Ecart!</h2>
            <p>Hey there,</p>
            <p>Thanks for signing up! Please verify your email by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                Verify Email
              </a>
            </div>
            <p>If the button doesn’t work, copy this link into your browser:</p>
            <p><a href="${verificationLink}" style="color: #007bff;">${verificationLink}</a></p>
            <p>If you didn’t create an account, ignore this email.</p>
            <br><p>Cheers,<br><strong>Zahid</strong><br>Founder of Ecart</p>
          </div>

          <div style="background-color: #f1f3f5; text-align: center; padding: 15px; font-size: 13px; color: #6c757d;">
            <p>&copy; ${new Date().getFullYear()} Ecart. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    const sendSmtpEmail = {
      sender: { email: FROM_EMAIL, name: FROM_NAME },
      to: [{ email }],
      subject: "Verify Your Email Address | Ecart",
      htmlContent,
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Verification email sent successfully:", response.messageId || response);
  } catch (error) {
    console.error("❌ Failed to send verification email:", error.message);
  }
};

module.exports = { verifyEmail };
