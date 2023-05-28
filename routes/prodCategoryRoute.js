const express = require("express")
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getSingleCategory,
  getAllCategory,
} = require("../controller/prodCategoryController")
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware")
const router = express.Router()

router.get("/:id", getSingleCategory)
router.get("/", getAllCategory)

router.use(authMiddleware, isAdmin)

router.post("/", createCategory)
router.put("/:id", updateCategory)
router.delete("/:id", deleteCategory)

module.exports = router
