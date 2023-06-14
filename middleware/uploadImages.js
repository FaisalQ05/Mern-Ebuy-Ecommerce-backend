const multer = require("multer")
const { validateMongoDbId } = require("../utils/validateMongodbId")
const { resizeImage } = require("../utils/resizeImages")
const {
  cloudinaryUploadImage,
  cloudinaryDeleteImage,
  cloudinaryDeleteAllImages,
} = require("../utils/cloudinary")
const { ErrorResponse } = require("../utils/response")

const multerStorage = new multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true)
  } else {
    cb(
      {
        message: "unsupported File format",
      },
      false
    )
  }
}

const uploadImages = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 1000000, files: 3 },
})

const uploadImagesToCloud =
  (Model, modelName, width, height) => async (req, res, next) => {
    if (!req.files) {
      throw new ErrorResponse("please add image file", 400)
    }
    const { id } = req.params
    validateMongoDbId(id)
    const model = await Model.findById(id)
    if (!model) throw new ErrorResponse(`${modelName} not found`, 400)
    const files = req.files
    const urls = []
    for (const file of files) {
      const bufferResize = await resizeImage(file, width, height)
      const b64 = Buffer.from(bufferResize).toString("base64")
      let dataUri = "data:" + file.mimetype + ";base64," + b64
      const responseUrl = await cloudinaryUploadImage(dataUri, modelName)
      urls.push(responseUrl)
    }
    for (const url of urls) {
      model.images.push(url)
    }
    const updatedModel = await model.save()
    res.imageResponse = {
      success: true,
      message: "Image upload Successfully",
      result: updatedModel,
    }
    // res.json(updatedProduct)
    next()
  }

const deleteImageFromCloud = (Model, modelName) => async (req, res, next) => {
  const { id } = req.params
  const { publicId } = req.body
  if (!publicId) throw new ErrorResponse("Please Provide publicId of image", 400)
  validateMongoDbId(id)
  const model = await Model.findById(id)
  if (!model) throw new ErrorResponse(`${modelName}  not found`, 400)
  const deleteImageResponse = await cloudinaryDeleteImage(publicId)
  if (deleteImageResponse.result === "not found") {
    throw new ErrorResponse("Image not found", 400)
  }
  if (deleteImageResponse.result !== "ok") {
    throw new ErrorResponse("Something went wrong Please try again", 400)
  }
  const findPublicID = model.images.find(
    (item) => item.public_id === publicId.toString()
  )
  model.images = model.images.filter(
    (item) => item.public_id !== findPublicID.public_id
  )
  const updatedModel = await model.save()
  res.imageResponse = {
    success: true,
    message: "Image deleted Successfully",
    result: updatedModel,
  }
  next()
}

const deleteAllImagesFromCloud =
  (Model, modelName) => async (req, res, next) => {
    // console.log("uploadImages :", req.files)
    const { id } = req.params
    validateMongoDbId(id)
    const model = await Model.findById(id)
    if (!model) throw new ErrorResponse(`${modelName} not found`, 400)
    const response = await cloudinaryDeleteAllImages(modelName)
    if (response.deleted) {
      model.images = []
    }
    const updatedModel = await model.save()
    res.imageResponse = {
      success: true,
      message: "All Images deleted Successfully",
      result: updatedModel,
    }
    next()
  }

module.exports = {
  uploadImages,
  uploadImagesToCloud,
  deleteImageFromCloud,
  deleteAllImagesFromCloud,
}
