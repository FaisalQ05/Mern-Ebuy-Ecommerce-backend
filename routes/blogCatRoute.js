const express = require("express")
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getSingleCategory,
  getAllCategory,
} = require("../controller/blogCatController")
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware")
const router = express.Router()

router.post("/", authMiddleware, isAdmin, createCategory)
router.put("/:id", authMiddleware, isAdmin, updateCategory)
router.delete("/:id", authMiddleware, isAdmin, deleteCategory)
router.get("/:id", getSingleCategory)
router.get("/", getAllCategory)

module.exports = router
