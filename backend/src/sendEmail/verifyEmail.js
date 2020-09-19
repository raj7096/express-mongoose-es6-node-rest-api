const nodemailer = require("nodemailer");

const verifyMail = (user, x) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "jacobit818@gmail.com",
      pass: "test@123456",
    },
  });
  const htmlToSend = `<h1>Dear ${user.name}</h1>
  <p>Thank you for signing up. Before you can start using the site, you must first verify your email.</p>
  <p>Please <a href='https://localhost:3000/${x}/verifyEmail/${user._id}'>Click Here</a> To Verify</p> `;

  const mailOptions = {
    from: "jacobit818@gmail.com",
    to: user.email,
    subject: "Verify Email Address",
    html: htmlToSend,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      throw new Error(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = { verifyMail };
