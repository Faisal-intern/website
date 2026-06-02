require('dotenv').config();
const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    try {
        console.log("MAIL_USER:", process.env.MAIL_USER); // Debugging
        console.log("MAIL_PASS:", process.env.MAIL_PASS); // Debugging

        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587, // Use 465 if 587 is blocked
            secure: false, // Use true for port 465 (SSL)
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS // Corrected environment variable
            }
        });

        let info = await transporter.sendMail({
            from: `Asssr <${process.env.MAIL_USER}>`, // Ensure valid "From" email
            to: email,
            subject: title,
            html: body
        });

        console.log("Email sent successfully:", info);
        return info;
    } catch (err) {
        console.error("Error sending email:", err.message);
    }
};

module.exports = mailSender;
