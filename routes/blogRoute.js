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

router.get("/:id", getBlog)
router.get("/", getAllBlog)

router.use(authMiddleware, isAdmin)

router.post("/", createBlog)
router.put("/:id", updateBlog)
router.delete("/:id", deleteBlog)
router.put("/likes/:blogId", likeBlog)
router.put("/dislikes/:blogId", dislikeBlog)

module.exports = router
