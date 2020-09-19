const express = require("express");
const auth = require("../middleware/Auth.js");
const { sendMail, OTP } = require("../sendEmail/mail.js");
const { verifyMail } = require("../sendEmail/verifyEmail.js");
const router = express.Router();
const User = require("../model/User.js");

router.post("/user", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    await verifyMail(user, req.params.user);
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    if (user.emailVerified != true) {
      throw new Error("Verify Your Email");
    }
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send("Unable To Login " + e);
  }
});

router.post("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });
    await req.user.save();
    res.send("Done!");
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/user/me", auth, async (req, res) => {
  res.send(req.user);
});

router.patch("/user/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch("/user/me/password", auth, async (req, res) => {
  try {
    req.user.password = req.body.password;
    req.user.tokens = [];
    req.user.save();
    res.send("Password Updated!");
  } catch (e) {
    res.status(400).send(e);
  }
});

// 1 Also For Resend OTP
router.get("/user/forgetPassword", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      throw new Error("No user Found Please Signup!");
    }
    user.otp = null;
    await sendMail(user);
    user.otp = OTP;
    user.save();
    res.send(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// 2
router.get("/user/OtpVerify/:email", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.params.email,
    });
    if (user.otp != req.body.OTP) {
      throw new Error("Please Enter Valid OTP");
    }
    res.send("Reset Password");
  } catch (e) {
    res.send(e.message);
  }
});

// 3
router.patch("/user/resetPassword/:email", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.params.email,
    });
    user.password = req.body.password;
    user.otp = null;
    user.tokens = [];
    user.save();
    res.send("LogIn With New Password");
  } catch (e) {
    res.send(e.message);
  }
});

router.post("/user/verifyEmail/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new Error("No User Found!");
    }
    if (user.emailVerified === true) {
      throw new Error("Email Already Verified");
    }
    user.emailVerified = true;
    user.save();
    res.send("Email Verified Now You Can Login");
  } catch (e) {
    res.send(e.message);
  }
});

router.delete("/user/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send("Deleted!");
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
