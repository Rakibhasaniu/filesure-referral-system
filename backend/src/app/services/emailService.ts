import nodemailer from 'nodemailer';
import config from '../config';
import {
  welcomeEmailTemplate,
  referralSignupEmailTemplate,
  referralConversionEmailTemplate,
  firstPurchaseEmailTemplate,
} from '../utils/emailTemplates';

// Lazy-load transporter to avoid initialization errors in test environment
let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!transporter && config.email_user && config.email_pass) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: config.email_user,
        pass: config.email_pass,
      },
    });
  }
  return transporter;
};

const sendEmail = async (to: string, subject: string, html: string) => {
  // Skip sending emails in test environment
  if (config.NODE_ENV === 'test' || process.env.NODE_ENV === 'test') {
    console.log(`📧 [TEST MODE] Email skipped: ${to} - ${subject}`);
    return;
  }

  try {
    const emailTransporter = getTransporter();
    if (!emailTransporter) {
      console.warn(`⚠️ Email not configured - skipping email to ${to}`);
      return;
    }

    await emailTransporter.sendMail({
      from: `"FileSure Templates" <${config.email_user}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    // Don't throw error - email failure shouldn't break the flow
  }
};

export const sendWelcomeEmail = async (
  email: string,
  name: string,
  referralCode: string,
  referralLink: string,
) => {
  const html = welcomeEmailTemplate(name, referralCode, referralLink);
  await sendEmail(email, '🎉 Welcome to FileSure Templates!', html);
};

export const sendReferralSignupNotification = async (
  referrerEmail: string,
  referrerName: string,
  referredName: string,
  referredEmail: string,
) => {
  const html = referralSignupEmailTemplate(
    referrerName,
    referredName,
    referredEmail,
  );
  await sendEmail(
    referrerEmail,
    '🎊 Someone used your referral link!',
    html,
  );
};

export const sendReferralConversionNotification = async (
  referrerEmail: string,
  referrerName: string,
  referredEmail: string,
  creditsEarned: number,
) => {
  const html = referralConversionEmailTemplate(
    referrerName,
    referredEmail,
    creditsEarned,
  );
  await sendEmail(referrerEmail, '🎉 You earned credits!', html);
};

export const sendFirstPurchaseEmail = async (
  email: string,
  name: string,
  creditsEarned: number,
  totalCredits: number,
) => {
  const html = firstPurchaseEmailTemplate(name, creditsEarned, totalCredits);
  await sendEmail(email, '🎊 Purchase Successful - Credits Earned!', html);
};
