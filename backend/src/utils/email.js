// utils/email.js
import config from "../config/config.js";
import nodemailer from "nodemailer";

// Gmail App Password version
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.EMAIL_USER,   // আপনার Gmail ঠিকানা
    pass: config.EMAIL_PASS,   // Gmail App Password
  },
});

// Verify the connection
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Tilawat Hub" <${config.EMAIL_USER}>`, // sender address
      to, // recipient
      subject, // email subject
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendEmail;
