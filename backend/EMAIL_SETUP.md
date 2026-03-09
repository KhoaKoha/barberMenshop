# Email Verification Setup Guide

## SMTP Configuration

To enable email verification, you need to configure SMTP settings in your backend.

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Gmail Setup (Recommended)

1. **Enable 2-Step Verification** on your Google account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `SMTP_PASS`

### Other Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
```

### Installing Dependencies

Make sure to install nodemailer:

```bash
cd backend
npm install nodemailer
```

### Testing Email Configuration

After setting up, restart your backend server and test the email verification flow. The system will:
1. Validate email format on frontend
2. Validate email format on backend
3. Send verification email via SMTP
4. Only allow payment after email verification

### Security Notes

- Never commit `.env` file to version control
- Use app passwords instead of main account passwords
- Keep SMTP credentials secure
- Consider using environment variables in production
