const jwt = require("jsonwebtoken")
const User = require("../model/userModel")

const authMiddleware = (req, res, next) => {
  const authHeaders = req.headers.authorization || req.headers.Authoriation
  if (!authHeaders?.startsWith("Bearer")) {
    return res.status(401).json({
      message: "Unauthorized . Please Add Header Token",
      isError: true,
    })
  }
  const token = authHeaders.split(" ")[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decode) => {
    if (err) {
      return res.status(403).json({
        message: "Token expired",
        isError: true,
      })
    }
    const user = await User.findById(decode?.id)
    req.user = user
    if (!user) {
      return res
        .status(400)
        .json({ message: "no user found in db against access token" })
    }
    next()
  })
}

const isAdmin = async (req, res, next) => {
  const { email } = req.user
  const adminUser = await User.findOne({ email })
  if (adminUser.role !== "admin") {
    throw new Error(
      "You are not an admin . You,re not allowed to this endpoint"
    )
  } else {
    next()
  }
}

module.exports = { authMiddleware, isAdmin }
