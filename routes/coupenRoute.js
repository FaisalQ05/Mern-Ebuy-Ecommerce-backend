const express = require("express")
const {
  createCoupen,
  getAllCoupens,
  updateCoupen,
  deleteCoupen,
} = require("../controller/coupenController")
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware")
const router = express.Router()

router.use(authMiddleware, isAdmin)

router.post("/", createCoupen)
router.get("/", getAllCoupens)
router.put("/:id", updateCoupen)
router.delete("/:id", deleteCoupen)

module.exports = router
