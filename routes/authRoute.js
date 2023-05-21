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

router.post("/register", createUser)
router.post("/login", login)
router.get("/", getAllUser)
router.post("/update-password", authMiddleware, updatePassword)
router.post("/forgot-password-token", forgotPasswordToken)
router.post("/reset-password/:token", resetPassword)

// router.post("/register", createUser)
// router.route("/login").post(login)
// router.route("/all").get(getAllUser)
router
  .route("/:id")
  .get(authMiddleware, isAdmin, getSingleUser)
  .delete(deleteUser)
  .put(authMiddleware, updateUser)

router.use(authMiddleware, isAdmin)

router.post("/block-user/:id?", blockUser)
router.post("/unblock-user/:id?", unblockUser)
router.get("/refresh/token", handelRefresh)
router.post("/logout", logout)

// router.route("/block-user/:id?").post(authMiddleware, isAdmin, blockUser)
// router.route("/unblock-user/:id?").post(authMiddleware, isAdmin, unblockUser)
// router.route("/refresh").get(authMiddleware, isAdmin)

module.exports = router
