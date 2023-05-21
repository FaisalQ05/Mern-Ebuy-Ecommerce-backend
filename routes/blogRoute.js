const express = require("express")
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware")
const { createBlog, updateBlog } = require("../controller/blogController")
const router = express.Router()

router.post("/", authMiddleware, isAdmin, createBlog)
router.put("/:id", authMiddleware, isAdmin, updateBlog)

module.exports = router
