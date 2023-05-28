const slugify = require("slugify")
const Product = require("../model/productModel")
const User = require("../model/userModel")
const { validateMongoDbId } = require("../utils/validateMongodbId")
const { cloudinaryUploadImage } = require("../utils/cloudinary")
const fs = require("fs")

const createProduct = async (req, res) => {
  const { title } = req.body
  if (title) {
    req.body.slug = slugify(title)
  }
  // console.log(req.body.slug)
  const product = await Product.create(req.body)
  res.json(product)
}

const updateProduct = async (req, res) => {
  const { title } = req.body
  const { id } = req.params
  validateMongoDbId(id)
  if (title) {
    req.body.slug = slugify(title)
  }
  const updateProduct = await Product.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  }).lean()
  if (!updateProduct) {
    throw new Error("No product found")
  }
  res.json(updateProduct)
}

const deleteProduct = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const deleteProduct = await Product.findByIdAndDelete(id).lean()
  if (!deleteProduct) {
    throw new Error("No product found")
  }
  res.json(deleteProduct)
}

const getSingleProduct = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const product = await Product.findById(id)
  if (product) {
    res.json(product)
  } else {
    throw new Error("No product Found")
  }
}

const getAllProduct = async (req, res) => {
  //   const products = await Product.find().lean()

  //filtering
  const queryObj = { ...req.query }
  // console.log(queryObj)
  const excludeFields = ["page", "sort", "limit", "fields"]
  excludeFields.forEach((el) => delete queryObj[el])
  // console.log(queryObj, excludeFields)
  // console.log(queryObj)
  let queryStr = JSON.stringify(queryObj)
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
  queryStr = JSON.parse(queryStr)
  // console.log(queryStr)
  // console.log(typeof queryStr)
  let query = Product.find(queryStr)

  //sorting
  if (req.query.sort) {
    // console.log(req.query.sort)
    const sortBy = req.query.sort.split(",").join(" ")
    // console.log(sortBy)
    query = query.sort(sortBy)
  } else {
    query = query.sort("-createdAt")
  }

  // //limiting the fields

  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ")
    query = query.select(fields)
  } else {
    query = query.select("-__v")
  }

  //pagination

  const page = req.query.page
  const limit = req.query.limit
  const skip = (page - 1) * limit
  query = query.skip(skip).limit(limit)
  if (req.query.page) {
    const productCount = await Product.countDocuments()
    if (skip >= productCount) throw new Error("This page does not exist")
  }

  const product = await query

  if (product.length > 0) {
    return res.json(product)
  } else {
    throw new Error("No Product Found")
  }
}

const addToWishList = async (req, res) => {
  const { _id } = req.user
  const { prodId } = req.body
  if (!prodId) throw new Error("prodId required")
  const findProd = await Product.findById(prodId).lean().exec()
  if (!findProd) throw new Error("Product not exist")
  if (!prodId || validateMongoDbId(prodId)) {
    throw new Error("Valid prodId required")
  }
  const user = await User.findById(_id)
  const alreadAdded = user.wishList.find((id) => id.toString() === prodId)
  if (alreadAdded) {
    // let user = await User.findByIdAndUpdate(
    //   _id,
    //   {
    //     $pull: { wishList: prodId },
    //   },
    //   { new: true }
    // )
    // res.json(user)

    user.wishList.pop(prodId)
  } else {
    user.wishList.push(prodId)
    // let user = await User.findByIdAndUpdate(
    //   _id,
    //   {
    //     $push: { wishList: prodId },
    //   },
    //   { new: true }
    // )
    // res.json(user)
  }
  const updateUser = await user.save()
  res.json(updateUser)
}

const rating = async (req, res) => {
  const { _id } = req.user
  const { star, prodId, comment } = req.body
  if (!prodId || validateMongoDbId(prodId))
    throw new Error("Enter product valid id")
  const product = await Product.findById(prodId)
  if (!product) throw new Error("No product found")
  if (!star) throw new Error("Please Submit the rating Star")
  let alreadyRated = product.ratings.find(
    (userId) => userId.postedBy.toString() === _id.toString()
  )
  if (alreadyRated) {
    // console.log(alreadyRated)
    // console.log("Rating : ", product.ratings)
    // const newArray = product.ratings.map((item) =>
    //   item.postedBy.toString() === alreadyRated.postedBy.toString()
    //     ? { star: star, postedBy: item.postedBy, _id: item._id }
    //     : item
    // )
    // console.log("New arrray : ", newArray)
    const updateRating = await Product.updateOne(
      {
        ratings: { $elemMatch: alreadyRated },
      },
      { $set: { "ratings.$.star": star, "ratings.$.comment": comment } },
      { new: true }
    )
    // res.json(updateRating)
  } else {
    product.ratings.push({ star, postedBy: _id, comment })
    const updateProduct = await product.save()
    // const rateProduct = await Product.findByIdAndUpdate(
    //   prodId,
    //   {
    //     $push: {
    //       ratings: {
    //         star: star,
    //         postedBy: _id,
    //       },
    //     },
    //   },
    //   { new: true }
    // )
    // res.json(updateProduct)
  }
  const getAllRatings = await Product.findById(prodId)
  let totalRating = getAllRatings.ratings.length
  let ratingSum = getAllRatings.ratings
    .map((item) => item.star)
    .reduce((prev, curr) => prev + curr, 0)
  let acutalRating = Math.round(ratingSum / totalRating)
  let finalProduct = await Product.findByIdAndUpdate(
    prodId,
    { totalrating: acutalRating },
    { new: true }
  )
  res.json(finalProduct)
}

const uploadImages = async (req, res) => {
  // console.log("uploadImages :", req.files)
  const uploader = (path) => cloudinaryUploadImage(path, "Ebuy/products")
  const urls = []
  const files = req.files
  for (const file of files) {
    const { path } = file
    const newpath = await uploader(path)
    console.log(newpath)
    urls.push(newpath)
    fs.unlinkSync(path)
  }
  const images = urls.map((file) => {
    return file
  })
  res.json(images)
}

module.exports = {
  createProduct,
  getSingleProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
  uploadImages,
}
