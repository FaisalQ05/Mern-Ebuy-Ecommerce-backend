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

router.get("/:id", getSingleBrand)
router.get("/", getAllBrand)

router.use(authMiddleware, isAdmin)

router.post("/", createBrand)
router.put("/:id", updateBrand)
router.delete("/:id", deleteBrand)

module.exports = router
