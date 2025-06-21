const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //   mailOptions
  // 2. Define the email options
  const mailOptions = {
    from: options.user, // e.g., "YourApp Support <support@yourapp.com>"
    to: options.email, // recipient
    subject: options.subject, // subject line
    text: options.message, // plain text message
    // html: options.html,        // optional - for HTML emails
  };

  // send email
  // 3. Actually send the email
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
