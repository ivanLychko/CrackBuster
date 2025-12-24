const formData = require('form-data');
const Mailgun = require('mailgun.js');
const path = require('path');
const fs = require('fs');
const SiteSettings = require('../models/SiteSettings');

// Lazy initialization of Mailgun client
function getMailgunClient() {
  const apiKey = process.env.MAILGUN_API_KEY;
  if (!apiKey) {
    return null;
  }
  
  const mailgun = new Mailgun(formData);
  return mailgun.client({
    username: 'api',
    key: apiKey,
  });
}

const DOMAIN = process.env.MAILGUN_DOMAIN || '';
const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL || `noreply@${DOMAIN}`;

// Get notification settings from database
async function getNotificationSettings() {
  try {
    const settings = await SiteSettings.getSettings();
    return {
      enabled: settings.notificationsEnabled !== false,
      email: settings.notificationEmail || process.env.MAILGUN_TO_EMAIL || FROM_EMAIL,
      estimateEnabled: settings.estimateNotificationsEnabled !== false,
      contactEnabled: settings.contactNotificationsEnabled !== false
    };
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return {
      enabled: true,
      email: process.env.MAILGUN_TO_EMAIL || FROM_EMAIL,
      estimateEnabled: true,
      contactEnabled: true
    };
  }
}

/**
 * Send estimate request email with attachments
 * @param {Object} contactData - Contact data from form
 * @param {Array} imagePaths - Array of image file paths
 * @returns {Promise}
 */
async function sendEstimateEmail(contactData, imagePaths = []) {
  try {
    // Check notification settings
    const notificationSettings = await getNotificationSettings();
    if (!notificationSettings.enabled || !notificationSettings.estimateEnabled) {
      console.log('Email notifications are disabled for estimate requests.');
      return { success: false, error: 'Notifications disabled' };
    }

    const mg = getMailgunClient();
    if (!mg || !DOMAIN) {
      console.warn('Mailgun not configured. Skipping email send.');
      return { success: false, error: 'Mailgun not configured' };
    }

    const { name, email, phone, address, description } = contactData;
    const submissionDate = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Build beautiful email HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              background-color: #f4f4f4;
              padding: 20px;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .email-header {
              background: linear-gradient(135deg, #031167 0%, #0524a0 100%);
              color: #ffffff;
              padding: 40px 30px;
              text-align: center;
            }
            .email-header h1 {
              font-size: 28px;
              font-weight: 600;
              margin-bottom: 10px;
              letter-spacing: -0.5px;
            }
            .email-header .subtitle {
              font-size: 14px;
              opacity: 0.9;
              font-weight: 300;
            }
            .email-content {
              padding: 40px 30px;
            }
            .info-card {
              background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
              border-left: 4px solid #031167;
              padding: 20px;
              margin-bottom: 25px;
              border-radius: 4px;
            }
            .field-group {
              margin-bottom: 25px;
            }
            .field-label {
              font-size: 12px;
              font-weight: 600;
              color: #031167;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
              display: block;
            }
            .field-value {
              font-size: 16px;
              color: #333333;
              line-height: 1.5;
              word-wrap: break-word;
            }
            .field-value a {
              color: #031167;
              text-decoration: none;
              font-weight: 500;
            }
            .field-value a:hover {
              text-decoration: underline;
            }
            .description-box {
              background-color: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 6px;
              padding: 15px;
              margin-top: 10px;
              white-space: pre-wrap;
              font-size: 15px;
              line-height: 1.6;
            }
            .images-section {
              margin-top: 30px;
              padding-top: 25px;
              border-top: 2px solid #e9ecef;
            }
            .images-header {
              font-size: 14px;
              font-weight: 600;
              color: #031167;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 15px;
            }
            .image-list {
              list-style: none;
              padding: 0;
            }
            .image-item {
              background-color: #f8f9fa;
              padding: 12px 15px;
              margin-bottom: 8px;
              border-radius: 4px;
              border-left: 3px solid #031167;
              font-size: 14px;
              color: #495057;
            }
            .image-item:before {
              content: "📎 ";
              margin-right: 8px;
            }
            .email-footer {
              background-color: #f8f9fa;
              padding: 25px 30px;
              text-align: center;
              border-top: 1px solid #e9ecef;
            }
            .footer-text {
              font-size: 12px;
              color: #6c757d;
              line-height: 1.6;
            }
            .footer-text strong {
              color: #031167;
            }
            @media only screen and (max-width: 600px) {
              .email-header { padding: 30px 20px; }
              .email-header h1 { font-size: 24px; }
              .email-content { padding: 30px 20px; }
              .email-footer { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-header">
              <h1>📋 New Estimate Request</h1>
              <div class="subtitle">You have received a new estimate request</div>
            </div>
            <div class="email-content">
              <div class="info-card">
                <div class="field-group">
                  <span class="field-label">👤 Full Name</span>
                  <div class="field-value">${name}</div>
                </div>
                <div class="field-group">
                  <span class="field-label">📧 Email Address</span>
                  <div class="field-value">
                    <a href="mailto:${email}">${email}</a>
                  </div>
                </div>
                <div class="field-group">
                  <span class="field-label">📞 Phone Number</span>
                  <div class="field-value">
                    <a href="tel:${phone}">${phone}</a>
                  </div>
                </div>
                ${address ? `
                <div class="field-group">
                  <span class="field-label">📍 Address</span>
                  <div class="field-value">${address}</div>
                </div>
                ` : ''}
              </div>
              <div class="field-group">
                <span class="field-label">📝 Project Description</span>
                <div class="description-box">${description.replace(/\n/g, '\n')}</div>
              </div>
              ${imagePaths.length > 0 ? `
                <div class="images-section">
                  <div class="images-header">Attached Images (${imagePaths.length})</div>
                  <ul class="image-list">
                    ${imagePaths.map((imgPath, index) => `
                      <li class="image-item">${path.basename(imgPath)}</li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
            <div class="email-footer">
              <div class="footer-text">
                <p><strong>This email was automatically sent from the CrackBuster website.</strong></p>
                <p style="margin-top: 10px;">Submitted on ${submissionDate}</p>
                <p style="margin-top: 10px;">You can reply directly to this email to contact the customer.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Prepare attachments
    const attachments = [];
    if (imagePaths && imagePaths.length > 0) {
      for (const imagePath of imagePaths) {
        const fullPath = path.join(__dirname, '../../client/public', imagePath);
        if (fs.existsSync(fullPath)) {
          attachments.push({
            filename: path.basename(fullPath),
            data: fs.createReadStream(fullPath)
          });
        }
      }
    }

    // Prepare message data
    const messageData = {
      from: FROM_EMAIL,
      to: notificationSettings.email,
      subject: `📋 New Estimate Request from ${name}`,
      html: htmlContent,
      'h:Reply-To': email,
    };

    // Add attachments if any
    if (attachments.length > 0) {
      messageData.attachment = attachments;
    }

    // Send email
    const response = await mg.messages.create(DOMAIN, messageData);
    
    return { success: true, messageId: response.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send contact form email
 * @param {Object} contactData - Contact data from form
 * @returns {Promise}
 */
async function sendContactEmail(contactData) {
  try {
    // Check notification settings
    const notificationSettings = await getNotificationSettings();
    if (!notificationSettings.enabled || !notificationSettings.contactEnabled) {
      console.log('Email notifications are disabled for contact form submissions.');
      return { success: false, error: 'Notifications disabled' };
    }

    const mg = getMailgunClient();
    if (!mg || !DOMAIN) {
      console.warn('Mailgun not configured. Skipping email send.');
      return { success: false, error: 'Mailgun not configured' };
    }

    const { name, email, phone, message } = contactData;
    const submissionDate = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Build beautiful email HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              background-color: #f4f4f4;
              padding: 20px;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .email-header {
              background: linear-gradient(135deg, #031167 0%, #0524a0 100%);
              color: #ffffff;
              padding: 40px 30px;
              text-align: center;
            }
            .email-header h1 {
              font-size: 28px;
              font-weight: 600;
              margin-bottom: 10px;
              letter-spacing: -0.5px;
            }
            .email-header .subtitle {
              font-size: 14px;
              opacity: 0.9;
              font-weight: 300;
            }
            .email-content {
              padding: 40px 30px;
            }
            .info-card {
              background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
              border-left: 4px solid #031167;
              padding: 20px;
              margin-bottom: 25px;
              border-radius: 4px;
            }
            .field-group {
              margin-bottom: 25px;
            }
            .field-label {
              font-size: 12px;
              font-weight: 600;
              color: #031167;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
              display: block;
            }
            .field-value {
              font-size: 16px;
              color: #333333;
              line-height: 1.5;
              word-wrap: break-word;
            }
            .field-value a {
              color: #031167;
              text-decoration: none;
              font-weight: 500;
            }
            .field-value a:hover {
              text-decoration: underline;
            }
            .message-box {
              background-color: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 6px;
              padding: 15px;
              margin-top: 10px;
              white-space: pre-wrap;
              font-size: 15px;
              line-height: 1.6;
            }
            .email-footer {
              background-color: #f8f9fa;
              padding: 25px 30px;
              text-align: center;
              border-top: 1px solid #e9ecef;
            }
            .footer-text {
              font-size: 12px;
              color: #6c757d;
              line-height: 1.6;
            }
            .footer-text strong {
              color: #031167;
            }
            @media only screen and (max-width: 600px) {
              .email-header { padding: 30px 20px; }
              .email-header h1 { font-size: 24px; }
              .email-content { padding: 30px 20px; }
              .email-footer { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-header">
              <h1>✉️ New Contact Form Submission</h1>
              <div class="subtitle">You have received a new message</div>
            </div>
            <div class="email-content">
              <div class="info-card">
                <div class="field-group">
                  <span class="field-label">👤 Full Name</span>
                  <div class="field-value">${name}</div>
                </div>
                <div class="field-group">
                  <span class="field-label">📧 Email Address</span>
                  <div class="field-value">
                    <a href="mailto:${email}">${email}</a>
                  </div>
                </div>
                ${phone ? `
                <div class="field-group">
                  <span class="field-label">📞 Phone Number</span>
                  <div class="field-value">
                    <a href="tel:${phone}">${phone}</a>
                  </div>
                </div>
                ` : ''}
              </div>
              <div class="field-group">
                <span class="field-label">💬 Message</span>
                <div class="message-box">${message.replace(/\n/g, '\n')}</div>
              </div>
            </div>
            <div class="email-footer">
              <div class="footer-text">
                <p><strong>This email was automatically sent from the CrackBuster website.</strong></p>
                <p style="margin-top: 10px;">Submitted on ${submissionDate}</p>
                <p style="margin-top: 10px;">You can reply directly to this email to contact the customer.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const messageData = {
      from: FROM_EMAIL,
      to: notificationSettings.email,
      subject: `✉️ New Contact Form Submission from ${name}`,
      html: htmlContent,
      'h:Reply-To': email,
    };

    const response = await mg.messages.create(DOMAIN, messageData);
    
    return { success: true, messageId: response.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendEstimateEmail,
  sendContactEmail
};

