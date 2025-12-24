# Mailgun Email Setup

This application uses Mailgun to send email notifications for contact forms and estimate requests.

## Environment Variables

Add the following variables to your `.env` file:

```env
# Mailgun Configuration
MAILGUN_API_KEY=your-mailgun-api-key-here
MAILGUN_DOMAIN=your-domain.com
MAILGUN_FROM_EMAIL=noreply@your-domain.com
MAILGUN_TO_EMAIL=your-email@your-domain.com
```

## Getting Mailgun Credentials

1. Sign up for a Mailgun account at https://www.mailgun.com/
2. Verify your domain or use the sandbox domain for testing
3. Get your API key from the Mailgun dashboard (Settings > API Keys)
4. Set your domain (e.g., `mg.yourdomain.com` or your verified domain)
5. Configure the FROM email (must be from your verified domain)
6. Set the TO email where you want to receive notifications

## Features

- **Estimate Requests**: Sends email with form data and attached images
- **Contact Form**: Sends email with contact form submission
- **HTML Email Templates**: Professional HTML email templates
- **Image Attachments**: Automatically attaches uploaded images to estimate emails

## Testing

If Mailgun is not configured, the application will:
- Still save requests to the database
- Log a warning about missing Mailgun configuration
- Continue functioning normally (emails just won't be sent)

## Notes

- Images are attached to estimate request emails
- Reply-To header is set to the submitter's email address
- All emails include formatted HTML templates









