const express = require("express")

const {
  createProduct,
  getSingleProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
  uploadImages,
} = require("../controller/productController")
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware")
const {
  uploadPhoto,
  productImageResize,
} = require("../middleware/uploadImages")
const router = express.Router()

router.get("/", getAllProduct)
router.get("/:id", getSingleProduct)
router.put("/wishList", authMiddleware, addToWishList)
router.put("/rating", authMiddleware, rating)

router.use(authMiddleware, isAdmin)

router.put(
  "/upload/:id",
  uploadPhoto.array("images", 3),
  productImageResize,
  uploadImages
)

router.post("/", createProduct)

router
  .route("/:id")
  .put(authMiddleware, isAdmin, updateProduct)
  .delete(authMiddleware, isAdmin, deleteProduct)

module.exports = router
