const Brevo = require("@getbrevo/brevo");

/**
 * Sends a one-time password (OTP) email for password reset via Brevo.
 * Works perfectly on Railway without domain authentication.
 *
 * @param {string} otp - The one-time password to send.
 * @param {string} email - The recipient's email address.
 */
const verifyOtp = async (otp, email) => {
  try {
    // ✅ Validate input
    if (!otp || !email) {
      throw new Error("OTP and email are required.");
    }

    // ✅ Load environment variables
    const { BREVO_API_KEY, FROM_EMAIL, FROM_NAME } = process.env;
    if (!BREVO_API_KEY || !FROM_EMAIL) {
      throw new Error("Missing Brevo credentials in environment variables.");
    }

    // ✅ Initialize Brevo API
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      BREVO_API_KEY
    );

    // ✅ HTML email template
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa; padding: 30px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background-color: #007bff; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Ecart</h1>
            <p style="color: #e2e6ea; margin: 5px 0 0;">Secure Password Reset</p>
          </div>

          <!-- Body -->
          <div style="padding: 25px; text-align: left; color: #333;">
            <h2 style="color: #007bff;">Reset Your Password</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password for your <strong>Ecart</strong> account.</p>
            <p>Please use the following One-Time Password (OTP) to reset it:</p>

            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f3f3f3; display: inline-block; padding: 15px 25px; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 8px; color: #007bff; border: 1px solid #d1d1d1;">
                ${otp}
              </div>
            </div>

            <p>This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>

            <p>If you didn’t request this reset, you can safely ignore this email — your account will remain secure.</p>

            <br>
            <p>Warm regards,<br><strong>Zahid</strong><br>Founder of Ecart</p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f1f3f5; text-align: center; padding: 15px; font-size: 13px; color: #6c757d;">
            <p>&copy; ${new Date().getFullYear()} Ecart. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    // ✅ Email config
    const sendSmtpEmail = {
      sender: { email: FROM_EMAIL, name: FROM_NAME },
      to: [{ email }],
      subject: "Your OTP for Password Reset | Ecart",
      htmlContent,
    };

    // ✅ Send via Brevo
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ OTP email sent successfully:", response.messageId || response);
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error.message);
  }
};

module.exports = { verifyOtp };
