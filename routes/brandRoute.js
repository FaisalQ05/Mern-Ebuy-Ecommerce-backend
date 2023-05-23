const express = require("express")
const {
  createBrand,
  updateBrand,
  deleteBrand,
  getSingleBrand,
  getAllBrand,
} = require("../controller/brandController")
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware")
const router = express.Router()

router.post("/", authMiddleware, isAdmin, createBrand)
router.put("/:id", authMiddleware, isAdmin, updateBrand)
router.delete("/:id", authMiddleware, isAdmin, deleteBrand)
router.get("/:id", getSingleBrand)
router.get("/", getAllBrand)

module.exports = router
