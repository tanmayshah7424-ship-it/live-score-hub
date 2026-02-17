const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password for Gmail
    },
});

exports.sendPasswordResetEmail = async (to, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Password Reset Request - ScoreHub',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>You requested to reset your password for your ScoreHub account.</p>
                <p>Click the button below to reset your password:</p>
                <div style="margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 4px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    Or copy and paste this link into your browser:<br>
                    <a href="${resetUrl}">${resetUrl}</a>
                </p>
                <p style="color: #666; font-size: 14px;">
                    This link will expire in 1 hour.
                </p>
                <p style="color: #666; font-size: 14px;">
                    If you didn't request this, please ignore this email.
                </p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};
