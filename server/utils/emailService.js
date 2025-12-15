const formData = require('form-data');
const Mailgun = require('mailgun.js');
const path = require('path');
const fs = require('fs');

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
const TO_EMAIL = process.env.MAILGUN_TO_EMAIL || '';

/**
 * Send estimate request email with attachments
 * @param {Object} contactData - Contact data from form
 * @param {Array} imagePaths - Array of image file paths
 * @returns {Promise}
 */
async function sendEstimateEmail(contactData, imagePaths = []) {
  try {
    const mg = getMailgunClient();
    if (!mg || !DOMAIN) {
      console.warn('Mailgun not configured. Skipping email send.');
      return { success: false, error: 'Mailgun not configured' };
    }

    const { name, email, phone, address, description } = contactData;

    // Build email HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #031167; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; margin-top: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #031167; }
            .value { margin-top: 5px; }
            .images { margin-top: 20px; }
            .image-item { margin: 10px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Estimate Request</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
              </div>
              <div class="field">
                <div class="label">Address:</div>
                <div class="value">${address || 'Not provided'}</div>
              </div>
              <div class="field">
                <div class="label">Description:</div>
                <div class="value">${description.replace(/\n/g, '<br>')}</div>
              </div>
              ${imagePaths.length > 0 ? `
                <div class="images">
                  <div class="label">Attached Images (${imagePaths.length}):</div>
                  ${imagePaths.map((imgPath, index) => `
                    <div class="image-item">${index + 1}. ${path.basename(imgPath)}</div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>This email was sent from the CrackBuster website contact form.</p>
              <p>Submitted: ${new Date().toLocaleString()}</p>
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
      to: TO_EMAIL || FROM_EMAIL,
      subject: `New Estimate Request from ${name}`,
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
    const mg = getMailgunClient();
    if (!mg || !DOMAIN) {
      console.warn('Mailgun not configured. Skipping email send.');
      return { success: false, error: 'Mailgun not configured' };
    }

    const { name, email, phone, message } = contactData;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #031167; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; margin-top: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #031167; }
            .value { margin-top: 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              ${phone ? `
                <div class="field">
                  <div class="label">Phone:</div>
                  <div class="value"><a href="tel:${phone}">${phone}</a></div>
                </div>
              ` : ''}
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from the CrackBuster website contact form.</p>
              <p>Submitted: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const messageData = {
      from: FROM_EMAIL,
      to: TO_EMAIL || FROM_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
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

