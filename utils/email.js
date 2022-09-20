const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1, Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2, Define email options
  const mailOptions = {
    from: 'Tuan Truong <truong.tuan2004vn@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.text,
    // html:
  };

  //3, Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail