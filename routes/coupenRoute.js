const express = require("express")
const {
  createCoupen,
  getAllCoupens,
  updateCoupen,
  deleteCoupen,
} = require("../controller/coupenController")
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware")
const router = express.Router()

router.post("/", authMiddleware, isAdmin, createCoupen)
router.get("/", authMiddleware, isAdmin, getAllCoupens)
router.put("/:id", authMiddleware, isAdmin, updateCoupen)
router.delete("/:id", authMiddleware, isAdmin, deleteCoupen)

module.exports = router
