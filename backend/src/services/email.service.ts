import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendVerificationEmail = async (email: string, code: string, username: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Chess2Earn <noreply@chess2earn.com>',
    to: email,
    subject: 'Chess2Earn - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Chess2Earn, ${username}!</h2>
        <p>Thank you for signing up. Please use the verification code below to complete your registration:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #666;">This code will expire in 15 minutes.</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>
    `
  };

  try {
    // In development without real email config, just log the code
    if (process.env.NODE_ENV === 'development' && process.env.EMAIL_PASSWORD === 'dev-mode-no-real-emails') {
      console.log('\n' + '='.repeat(60));
      console.log('📧 DEV MODE - Email would be sent to:', email);
      console.log('🔑 Verification Code:', code);
      console.log('👤 Username:', username);
      console.log('='.repeat(60) + '\n');
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Verification email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

export const sendLoginEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Chess2Earn <noreply@chess2earn.com>',
    to: email,
    subject: 'Chess2Earn - Login Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Chess2Earn Login</h2>
        <p>Here's your login verification code:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #666;">This code will expire in 15 minutes.</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          If you didn't request this code, please secure your account immediately.
        </p>
      </div>
    `
  };

  try {
    // In development without real email config, just log the code
    if (process.env.NODE_ENV === 'development' && process.env.EMAIL_PASSWORD === 'dev-mode-no-real-emails') {
      console.log('\n' + '='.repeat(60));
      console.log('📧 DEV MODE - Email would be sent to:', email);
      console.log('🔑 Login Code:', code);
      console.log('='.repeat(60) + '\n');
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Login email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

export const sendWithdrawalEmail = async (email: string, amount: number, walletAddress: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Chess2Earn - Withdrawal Request Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Withdrawal Request Received</h2>
        <p>We've received your withdrawal request:</p>
        <ul>
          <li><strong>Amount:</strong> ${amount} RTD</li>
          <li><strong>Wallet:</strong> ${walletAddress}</li>
        </ul>
        <p>Your withdrawal will be processed within 24-48 hours.</p>
        <p style="color: #666;">You'll receive another email once the transaction is complete.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export default transporter;
