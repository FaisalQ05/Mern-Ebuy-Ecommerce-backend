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
} = require("../controller/userController")
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware")

router.post("/register", createUser)
router.post("/login", login)
router.get("/all", getAllUser)

// router.post("/register", createUser)
// router.route("/login").post(login)
// router.route("/all").get(getAllUser)
router
  .route("/:id?")
  .get(authMiddleware, isAdmin, getSingleUser)
  .delete(deleteUser)
  .put(authMiddleware, updateUser)

router.post("/block-user/:id?", authMiddleware, isAdmin, blockUser)
router.post("/unblock-user/:id?", authMiddleware, isAdmin, unblockUser)
router.get("/token/refresh", authMiddleware, isAdmin, handelRefresh)
router.post("/logout", authMiddleware, isAdmin, logout)

// router.route("/block-user/:id?").post(authMiddleware, isAdmin, blockUser)
// router.route("/unblock-user/:id?").post(authMiddleware, isAdmin, unblockUser)
// router.route("/refresh").get(authMiddleware, isAdmin)

module.exports = router
