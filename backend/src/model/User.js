const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    trim: true,
  },
  otp: {
    type: Number,
  },otp_verified: {
    type: Boolean,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

memberSchema.methods.toJSON = function () {
  const member = this;
  const memberObject = member.toObject();

  delete memberObject.password;
  delete memberObject.otp;
  delete memberObject.tokens;
  delete memberObject.emailVerified;

  return memberObject;
};

memberSchema.methods.generateAuthToken = async function () {
  const member = this;

  const token = jwt.sign(
    { _id: member._id.toString() },
    process.env.JWT_SECRET
  );

  member.tokens = member.tokens.concat({ token });
  await member.save();

  return token;
};

// Hash the plain text password before saving
memberSchema.pre("save", async function (next) {
  const member = this;

  if (member.isModified("password")) {
    member.password = await bcrypt.hash(member.password, 8);
  }

  next();
});

memberSchema.statics.findByCredentials = async (email, password) => {
  const member = await Member.findOne({ email: email });

  if (!member) {
    throw new Error("No member Found Please SignUp!");
  }

  const isMatch = await bcrypt.compare(password, member.password);

  if (!isMatch) {
    throw new Error("Password Is InCorrect");
  }

  return member;
};

const Member = mongoose.model("user", memberSchema);

module.exports = Member;
