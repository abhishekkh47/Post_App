import Config from "config";
import { NetworkError } from "middleware/errorHandler.middleware";
import nodemailer, { TransportOptions } from "nodemailer";

export const sendResetEmail = async (userEmail: string, resetToken: string) => {
  try {
    const resetUrl = `${Config.BASEURL}:${Config.PORT}/reset-pasword?token=${resetToken}`;
    let transporter = nodemailer.createTransport({
      host: "smtp.mailgun.com",
      port: 587,
      secure: false, // Use STARTTLS (recommended)
      auth: {
        email: "sender@gmail.com",
        pass: "randomPassword",
      },
      tls: {
        rejectUnauthorized: false, // This allows you to bypass certificate verification (only for testing purposes)
      },
    } as TransportOptions);

    const mailOptions = {
      from: "sender@gmail.com",
      to: userEmail,
      subject: "Reset Your Password",
      text: `To reset your password, click the following link: ${resetUrl}`,
    };

    const sendMail = await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new NetworkError((error as Error).message, 400);
  }
};
