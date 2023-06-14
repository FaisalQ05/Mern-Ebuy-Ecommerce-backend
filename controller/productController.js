const slugify = require("slugify")
const Product = require("../model/productModel")
const User = require("../model/userModel")
const { validateMongoDbId } = require("../utils/validateMongodbId")
const { sendResponce } = require("../utils/response")

const createProduct = async (req, res) => {
  const { title } = req.body
  if (title) {
    req.body.slug = slugify(title)
  }
  // console.log(req.body.slug)
  const product = await Product.create(req.body)
  sendResponce(res, "Product created", product)
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
  sendResponce(res, "Product updated", updateProduct)
}

const deleteProduct = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const deleteProduct = await Product.findByIdAndDelete(id).lean()
  if (!deleteProduct) {
    throw new Error("No product found")
  }
  sendResponce(res, "Product deleted", deleteProduct)
}

const getSingleProduct = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const product = await Product.findById(id)
  if (product) {
    sendResponce(res, "Single product fecthed successfully", product)
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
  let queryStr = JSON.stringify(queryObj)
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
  queryStr = JSON.parse(queryStr)
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

  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit) || 25
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  query = query.skip(startIndex).limit(limit)
  const total = await Product.countDocuments()

  const product = await query

  // Pagination result
  const pagination = {}

  if (endIndex < total) {
    console.log("condition true one ", { endIndex, total })
    pagination.next = {
      page: page + 1,
      limit,
    }
  }

  if (startIndex > 0) {
    console.log("condition true second ", { endIndex, total })
    pagination.prev = {
      page: page - 1,
      limit,
    }
  }

  if (product.length > 0) {
    return res.status(200).json({
      success: true,
      count: product.length,
      pagination,
      result: product,
    })
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
  validateMongoDbId(prodId)
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
  sendResponce(res, "added to user wishlist", updateUser)
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
  const getAllRatings = await Product.findById(prodId).exec()
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
  sendResponce(res, "Product rated successfully", finalProduct)
}

const handleUploadImages = async (req, res) => {
  res.status(200).json(res.imageResponse)
}

const handleDeleteImage = async (req, res) => {
  res.status(200).json(res.imageResponse)
}

const handleDeleteAllImages = async (req, res) => {
  res.status(200).json(res.imageResponse)
}

module.exports = {
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
}
