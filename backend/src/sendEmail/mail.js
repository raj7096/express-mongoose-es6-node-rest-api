const nodemailer = require("nodemailer");

const OTP = Math.floor(100000 + Math.random() * 900000);

const sendMail = (x) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "jacobit818@gmail.com",
      pass: "test@123456",
    },
  });

  const mailOptions = {
    from: "raj.albiorix@gmail.com",
    to: x.email,
    subject: "Verify Your Account",
    text: `Dear ${x.name}
            We Received a request to Change Your Password
            Your OTP:${OTP}
            Please Go to Website And Verify OTP`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      throw new Error(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = {
  sendMail,
  OTP,
};
