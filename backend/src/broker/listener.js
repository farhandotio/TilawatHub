import { subscribeToQueue } from "./rabbit.js";
import sendEmail from "../utils/email.js";

function startListener() {
  subscribeToQueue("user.created", async (msg) => {
    const {
      email,
      role,
      fullname: { firstName, lastName },
    } = msg;

    const template = `
    <p>Dear ${firstName} ${lastName},</p>
    <p>Thank you for registering with Tilawat Hub.</p>
    <p>We are excited to have you on board!</p>
    <p>Your role is: ${role}.</p>
    <p>Best regards,<br/>Tilawat Hub Team</p>
    `;

    await sendEmail(
      email,
      "Welcome to Tilawat Hub",
      "Thank you for registering with Tilawat Hub.",
      template
    );
  });
}

export default startListener;
