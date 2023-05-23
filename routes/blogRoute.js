const express = require("express")
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware")
const {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlog,
  deleteBlog,
  likeBlog,
  dislikeBlog,
} = require("../controller/blogController")
const router = express.Router()

router.post("/", authMiddleware, isAdmin, createBlog)
router.put("/:id", authMiddleware, isAdmin, updateBlog)
router.get("/:id", getBlog)
router.get("/", getAllBlog)
router.delete("/:id", authMiddleware, isAdmin, deleteBlog)
router.put("/likes/:blogId", authMiddleware, isAdmin, likeBlog)
router.put("/dislikes/:blogId", authMiddleware, isAdmin, dislikeBlog)

module.exports = router
