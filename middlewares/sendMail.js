import { createTransport } from "nodemailer";

export const sendMail = async (email, subject, data) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // important for gmail
    auth: {
      user: process.env.GMAIL,
      pass: process.env.PASSWORD, // must be APP PASSWORD (not Gmail password)
    },
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
</head>
<body style="font-family: Arial, sans-serif;">
    <div style="max-width:450px;margin:auto;padding:20px;border:1px solid #ddd;border-radius:8px;text-align:center;">
        <h1 style="color:red;">OTP Verification</h1>
        <p>Hello ${data.name}, your one-time password is:</p>
        <h2 style="color:#7b68ee;font-size:36px;">${data.otp}</h2>
    </div>
</body>
</html>`;

  await transport.sendMail({
    from: process.env.GMAIL,
    to: email,
    subject,
    html,
  });
};
export default sendMail;