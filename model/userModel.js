const mongoose = require("mongoose") // Erase if already required
const bcrypt = require("bcrypt")
const crypto = require("crypto")
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "firstname is required"],
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, "lastname is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (inputValue) => {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
            inputValue
          )
        },
        message: "Invalid Email",
      },
    },
    mobile: {
      type: String,
      required: [true, "mobile phone is required"],
      unique: true,
      trim: true,
      validate: {
        validator: (inputValue) => {
          return /^((\+92)?(0092)?(92)?(0)?)(3)([0-9]{9})$/.test(inputValue)
        },
        message: "Invalid Phone number",
      },
    },
    password: {
      type: String,
      required: [true, "password is required"],
      trim: true,
      validate: {
        validator: (inputValue) => {
          return /^(?=.*[A-Za-z0-9])(?!.*\s).{5,}$/.test(inputValue)
        },
        message: "Invalid Password . Password Should contains 5 characters",
      },
    },
    role: {
      type: String,
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    cart: {
      type: Array,
      default: [],
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address",
    },
    weishList: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
    },
    refreshToken: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
)

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(8)
    this.password = await bcrypt.hash(this.password, salt)
  }
  next()
})

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex")
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000
  return resetToken
}

//Export the model
module.exports = mongoose.model("User", userSchema)
