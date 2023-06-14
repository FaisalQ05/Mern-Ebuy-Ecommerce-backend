const express = require("express")
const router = express.Router()
const {
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
} = require("../controller/userController")
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware")

//public routes
router.post("/register", createUser)
router.post("/login", login)
router.get("/", getAllUser)
router.post("/forgot-password-token", forgotPasswordToken)
router.post("/reset-password/:token", resetPassword)
router.post("/logout", logout)
router.get("/refresh/token", handelRefresh)
router.delete("/:id", deleteUser)

//auth routes
router.put("/", authMiddleware, updateUser)
router.put("/update-password", authMiddleware, updatePassword)

//auth routes and admin
router.use(authMiddleware, isAdmin)

router.get("/:id", getSingleUser)
router.post("/block-user/:id?", blockUser)
router.post("/unblock-user/:id?", unblockUser)

module.exports = router
