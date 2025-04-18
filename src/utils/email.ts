import Config from "config";
import { NetworkError } from "middleware/errorHandler.middleware";
import nodemailer, { TransportOptions } from "nodemailer";

export const sendResetEmail = async (userEmail: string, resetToken: string) => {
  try {
    const resetUrl = `${Config.BASEURL}/reset-pasword?token=${resetToken}`;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: Config.ADMIN_EMAIL,
        pass: Config.ADMIN_PASSWORD,
      },
    } as TransportOptions);

    const mailOptions = {
      from: "No-Reply Postal",
      to: userEmail,
      subject: "Reset Your Password",
      html: `To reset your password, click the following link: ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new NetworkError((error as Error).message, 400);
  }
};
