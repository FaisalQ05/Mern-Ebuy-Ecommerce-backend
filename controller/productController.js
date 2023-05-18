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

  const queryObj = { ...req.query }
  const excludeFields = ["page", "sort", "limit", "fields"]
  excludeFields.forEach((el) => delete queryObj[el])
  console.log(queryObj, excludeFields)

  let queryStr = JSON.stringify(queryObj)
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
  console.log(JSON.parse(queryStr))
  const products = await Product.find(JSON.parse(queryStr))


//   const query=Product.find(JSON.parse(queryObj))
  if (products.length > 0) {
    return res.json(products)
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
