import nodemailer from "nodemailer";

const sendEmail = async (to, subject, message,html = null) => {
  try {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Lak Isuru Tea" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: message,
    html: html || `<p>${message}</p>`,
  };

  await transporter.sendMail({
      from: `"${process.env.ADMIN_EMAIL_FROM || "Lak Isuru Tea"}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });


   console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Email sending failed:", error.message);
  }
};

export default sendEmail;