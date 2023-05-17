const jwt = require("jsonwebtoken")
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../config/jwtToken")
const User = require("../model/userModel")
const { validateMongoDbId } = require("../utils/validateMongodbId")

const createUser = async (req, res) => {
  const { email } = req.body
  const user = await User.create(req.body)
  if (user) return res.json({ message: `User with ${email} created` })
  else return res.json({ message: "Invalid user data received" })
}

const login = async (req, res) => {
  const { email, password } = req.body
  const findUser = await User.findOne({ email: email.toLowerCase() }).exec()
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id)
    const updateUser = await User.findByIdAndUpdate(
      findUser._id,
      {
        refreshToken,
      },
      { new: true }
    )
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    })

    res.json({
      _id: findUser._id,
      firstname: findUser.firstname,
      lastname: findUser.lastname,
      email: findUser.email,
      mobile: findUser.mobile,
      token: generateAccessToken(findUser._id),
    })
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
  if (!user) throw new Error("Not found")
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decode) => {
    if (err || user.id !== decode.id) {
      throw new Error("There is something Wrong")
    }
    const accessToken = generateAccessToken(user._id)
    res.json({ accessToken })
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
  return res.json({ message: "Logout Success" })
}

const getAllUser = async (req, res) => {
  const allUsers = await User.find().select("-password").lean()
  if (allUsers.length > 0) {
    return res.json(allUsers)
  } else {
    throw new Error("No user Found")
  }
}

const getSingleUser = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)

  const allUsers = await User.findById(id).select("-password").lean()
  if (allUsers) {
    return res.json(allUsers)
  } else {
    throw new Error("No user Found")
  }
}

const updateUser = async (req, res) => {
  const { _id } = req.user
  const { firstname, lastname, email, mobile } = req.body
  const user = await User.findById(_id).exec()
  if (!user) {
    throw new Error("No user Found")
  }
  if (!(firstname && lastname && email && mobile)) {
    throw new Error("Enter all details")
  }

  user.firstname = firstname
  user.lastname = lastname
  user.email = email
  user.mobile = mobile

  const updatedUser = await user.save()
  return res.json({ message: `${updatedUser.firstname} updated` })
}

const deleteUser = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)

  const allUsers = await User.findByIdAndDelete(id).select("-password").lean()
  if (allUsers) {
    return res.json(allUsers)
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
  return res.json(user)
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
  return res.json(user)
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
}
