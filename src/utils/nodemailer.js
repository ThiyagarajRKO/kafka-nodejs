const nodemailer = require("nodemailer");
require("dotenv").config();

// Configure the SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587, // SMTP port for SendGrid
  secure: false, // Use TLS
  auth: {
    user: "apikey", // This is the literal string "apikey"
    pass: process.env.SENDGRID_API_KEY, // Replace with your SendGrid API key
  },
});

export const SendEmail = (body) => {
  return new Promise((resolve, reject) => {
    // Email options
    const mailOptions = {
      from: process.env.FROM_MAIL, // Sender email
      to: process.env.TO_MAILS?.split(","), // Recipient email
      subject: "Informatica Error", // Subject
      html: body,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        reject(error);
      } else {
        console.log("Email sent:", info.response);
        resolve(info.response);
      }
    });
  });
};
