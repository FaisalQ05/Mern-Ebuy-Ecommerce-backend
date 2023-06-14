const express = require("express")
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware")
const {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlog,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  handleUploadImages,
  handleDeleteAllImages,
  handleDeleteImage,
} = require("../controller/blogController")
const {
  uploadImages,
  uploadImagesToCloud,
  deleteAllImagesFromCloud,
  deleteImageFromCloud,
} = require("../middleware/uploadImages")
const Blog = require("../model/blogModel")
const router = express.Router()

//Public routes
router.get("/:id", getBlog)
router.get("/", getAllBlog)

router.use(authMiddleware)

//Auth user routes
router.put("/likes/:blogId", likeBlog)
router.put("/dislikes/:blogId", dislikeBlog)

router.use(isAdmin)

//Admin routes
router.put(
  "/upload-img/:id",
  uploadImages.array("images"),
  uploadImagesToCloud(Blog, "blog", 700, 700),
  handleUploadImages
)

router.delete(
  "/delete-img/:id",
  deleteImageFromCloud(Blog, "blog"),
  handleDeleteImage
)
router.delete(
  "/delete-all-img/:id",
  deleteAllImagesFromCloud(Blog, "blog"),
  handleDeleteAllImages
)

router.post("/", createBlog)
router.put("/:id", updateBlog)
router.delete("/:id", deleteBlog)

module.exports = router
