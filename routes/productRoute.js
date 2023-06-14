const express = require("express")
const Product = require("../model/productModel")
const {
  createProduct,
  getSingleProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
  handleUploadImages,
  handleDeleteImage,
  handleDeleteAllImages,
} = require("../controller/productController")
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware")
const {
  uploadImages,
  uploadImagesToCloud,
  deleteImageFromCloud,
  deleteAllImagesFromCloud,
} = require("../middleware/uploadImages")

const router = express.Router()

//public routes
router.get("/", getAllProduct)
router.get("/:id", getSingleProduct)

//Auth user routes
router.use(authMiddleware)
router.put("/wishList", addToWishList)
router.put("/rating", rating)

router.use(isAdmin)

//Admin routes
// router.put("/upload-img/:id", uploadImages.array("images"), handleUploadImages)
router.put(
  "/upload-img/:id",
  uploadImages.array("images"),
  uploadImagesToCloud(Product, "product", 900, 900),
  handleUploadImages
)
// router.delete("/delete-img/:id", handleDeleteImage)
router.delete(
  "/delete-img/:id",
  deleteImageFromCloud(Product, "product"),
  handleDeleteImage
)
router.delete(
  "/delete-all-img/:id",
  deleteAllImagesFromCloud(Product, "product"),
  handleDeleteAllImages
)
// router.delete("/delete-all-img/:id", handleDeleteAllImages)

router.post("/", createProduct)

router.route("/:id").put(updateProduct).delete(deleteProduct)

module.exports = router
