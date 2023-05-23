const express = require("express")

const {
  createProduct,
  getSingleProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
} = require("../controller/productController")
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware")
const router = express.Router()

router.get("/", getAllProduct)
router.get("/:id", getSingleProduct)
router.put("/wishList", authMiddleware, addToWishList)
router.put("/rating", authMiddleware, rating)

router.use(authMiddleware, isAdmin)

router.post("/", createProduct)

router
  .route("/:id")
  .put(authMiddleware, isAdmin, updateProduct)
  .delete(authMiddleware, isAdmin, deleteProduct)

module.exports = router
