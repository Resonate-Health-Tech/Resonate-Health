import twilio from 'twilio'
import dotenv from "dotenv";

dotenv.config();


const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

async function sendReportReady(phone) {
  return client.messages.create({
    body: "Your report is ready!",
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: `whatsapp:${phone}`
  });
}

export default sendReportReady
