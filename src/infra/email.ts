import { createTransport, type SendMailOptions } from "nodemailer";

const transporter = createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: Number(process.env.EMAIL_SMTP_PORT),
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASSWORD,
  },
  secure: process.env.NODE_ENV === "production",
});

async function send(mailOptions: SendMailOptions) {
  await transporter.sendMail(mailOptions);
}

const email = {
  send,
};

export default email;
