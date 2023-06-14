const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../config/jwtToken")
const User = require("../model/userModel")
const { validateMongoDbId } = require("../utils/validateMongodbId")
const { sendMail } = require("./emailController")
const { sendResponce } = require("../utils/response")

// @desc      Create User
// @route     POST /api/user/register
// @access    Public
const createUser = async (req, res) => {
  const { email } = req.body
  const user = await User.create(req.body)
  if (user) sendResponce(res, `User with ${email} created`)
  else throw new Error("Invalid user data received")
}

const login = async (req, res) => {
  const { email, password } = req.body
  if (!(email && password)) throw new Error("Email or Password Required")
  const findUser = await User.findOne({ email: email.toLowerCase() }).exec()
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id)
    await User.findByIdAndUpdate(
      findUser._id,
      {
        refreshToken,
      },
      { new: true }
    )
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    }
    if (process.env.NODE_ENV === "developement") {
      options.secure = false
    }
    res.cookie("refreshToken", refreshToken, options)
    const result = {
      _id: findUser._id,
      firstname: findUser.firstname,
      lastname: findUser.lastname,
      email: findUser.email,
      mobile: findUser.mobile,
      token: generateAccessToken(findUser._id),
    }
    sendResponce(res, "Login Successfully", result)
  } else {
    throw new Error("Invalid Credentials")
  }
}

const handelRefresh = async (req, res) => {
  const cookie = req.cookies
  if (!cookie?.refreshToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized .. did not found cookies" })
  }
  const refreshToken = cookie.refreshToken
  const user = await User.findOne({ refreshToken })
  if (!user) throw new Error("Unauthorized token not found in db")
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decode) => {
    if (err || user.id !== decode.id) {
      throw new Error("Unauthorized user There is something Wrong")
    }
    const accessToken = generateAccessToken(user._id)
    const result = { accessToken }
    sendResponce(res, "Refresh Successfully", result)
  })
}

const logout = async (req, res) => {
  const cookie = req.cookies
  if (!cookie?.refreshToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized .. did not found cookies" })
  }
  const refreshToken = cookie.refreshToken
  const user = await User.findOne({ refreshToken })
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    return res.sendStatus(204)
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  })
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  })
  // return res.json({ message: "Logout Success" })
  sendResponce(res, "Logout Successfully")
}

const getAllUser = async (req, res) => {
  const allUsers = await User.find().select("-password").lean()
  if (allUsers.length > 0) {
    sendResponce(res, "All users", allUsers)
  } else {
    throw new Error("No user Found")
  }
}

const getSingleUser = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)

  const singleUser = await User.findById(id).select("-password").lean()
  if (singleUser) {
    sendResponce(res, "Single user", singleUser)
  } else {
    throw new Error("No user Found")
  }
}

// const updateProduct = async (req, res) => {
//   const { title } = req.body
//   const { id } = req.params
//   validateMongoDbId(id)
//   if (title) {
//     req.body.slug = slugify(title)
//   }
//   const updateProduct = await Product.findOneAndUpdate({ _id: id }, req.body, {
//     new: true,
//   }).lean()
//   if (!updateProduct) {
//     throw new Error("No product found")
//   }
//   res.json(updateProduct)
// }

const updateUser = async (req, res) => {
  const { _id } = req.user
  const updatedUser = await User.findOneAndUpdate({ _id }, req.body, {
    new: true,
  }).lean()
  if (!updatedUser) {
    throw new Error("No user Found")
  }
  // const user = await User.findById(_id).exec()
  // if (!user) {
  //   throw new Error("No user Found")
  // }
  // if (!(firstname && lastname && email && mobile)) {
  //   throw new Error("Enter all details")
  // }

  // user.firstname = firstname
  // user.lastname = lastname
  // user.email = email
  // user.mobile = mobile

  // const updatedUser = await user.save()
  // return res.json({ message: `${updatedUser.firstname} updated` })
  sendResponce(res, `${updatedUser.firstname} updated`)
}

const deleteUser = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)

  const user = await User.findByIdAndDelete(id).select("-password").lean()
  if (user) {
    sendResponce(res, "user delete successfully", user)
  } else {
    throw new Error("No user Found")
  }
}

const blockUser = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const user = await User.findByIdAndUpdate(
    id,
    { isBlocked: true },
    { new: true }
  )
  if (!user) {
    throw new Error("User not found")
  }
  sendResponce(res, "user blocked successfully", user)
}

const unblockUser = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const user = await User.findByIdAndUpdate(
    id,
    { isBlocked: false },
    { new: true }
  )
  if (!user) {
    throw new Error("User not found")
  }
  sendResponce(res, "user un-blocked successfully", user)
}

const updatePassword = async (req, res) => {
  const { _id } = req.user
  const { password } = req.body
  validateMongoDbId(_id)
  const user = await User.findById(_id)
  if (password) {
    user.password = password
    const updatedPassword = await user.save()
    sendResponce(res, "password updated successfully", updatedPassword)
  } else {
    throw new Error("Please Enter Password to update")
  }
}

const forgotPasswordToken = async (req, res) => {
  const { email } = req.body
  if (!email) throw new Error("Please Enter valid email address")
  const user = await User.findOne({ email })
  if (!user) throw new Error("User not found with this email")
  const token = await user.createPasswordResetToken()
  await user.save()
  const resetUrl = `Hi please follow this link to reset your password . This link is valid till 10 minutes from now. <a href='http://localhost:4000/api/user/reset-password/${token}'>Click here</a>`
  const data = {
    to: email,
    text: "Hey user",
    subject: "Forgot Password Link",
    html: resetUrl,
  }
  sendMail(data)
  // res.json({ token })
  sendResponce(res, "forget password link have sended successfully", token)
}

const resetPassword = async (req, res) => {
  const { password } = req.body
  const { token } = req.params

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })
  if (!user) {
    throw new Error("Token Expired , Please try again later")
  }
  user.password = password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()
  sendResponce(res, "Password changed Successfully")
}

module.exports = {
  createUser,
  login,
  getAllUser,
  getSingleUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handelRefresh,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
}
