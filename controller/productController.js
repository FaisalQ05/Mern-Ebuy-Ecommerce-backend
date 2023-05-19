const slugify = require("slugify")
const Product = require("../model/productModel")
const { validateMongoDbId } = require("../utils/validateMongodbId")

const createProduct = async (req, res) => {
  const { title } = req.body
  if (title) {
    req.body.slug = slugify(title)
  }
  console.log(req.body.slug)
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

module.exports = {
  createProduct,
  getSingleProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
}
