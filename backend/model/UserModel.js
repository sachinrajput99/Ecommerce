const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 4,
    unique: false,
    required: [true, "Please tell us your name"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email!"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "Please enter the password"],
    minlength: 6,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validator: {
      // Only runs on CREATE and SAVE, not on findOneAndUpdate
      validate: function (el) {
        return el === this.password;
      },
    },
  },
  userRole: {
    type: String,
    enum: ["user", "user,guide", "lead-guide", "admin"],
    default: "user",
  },
  active: {
    type: Boolean,
    default: true,
    select: false, //hide from api response
  },
  passwordChangedAt: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //password field modified? if not return

  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined; //not saved in db
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } }); // exclude inactive users
  next();
});

userSchema.methods.comparePassword = async function (
  password,
  enteredPassword
) {
  const isMatched = await bcrypt.compare(password, enteredPassword);
  return isMatched; //true or false ,yes/no
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // convert time to  millisecond

    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp; // true = password changed after token
  }
  // False means password was NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // raw reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // store hexed reset token in db
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  // token expiry time 10 minute form now
  this.PasswordResetExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.pre("save", function (next) {
  // agr password nhi change hua h or  document naya h to next () wrna passwordChangedAt ki value set krdo
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // 1 sec peeche set karte hain for JWT timing mismatch
  next();
});

// creating  model
const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
