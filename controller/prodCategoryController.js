const Category = require("../model/prodCategoryModel")
const { validateMongoDbId } = require("../utils/validateMongodbId")

const createCategory = async (req, res) => {
  const newCategory = await Category.create(req.body)
  res.json(newCategory)
}

const updateCategory = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const updateCategory = await Category.findOneAndUpdate(
    { _id: id },
    req.body,
    {
      new: true,
    }
  ).lean()
  if (!updateCategory) {
    throw new Error("No Category found")
  }
  res.json(updateCategory)
}

const deleteCategory = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const category = await Category.findByIdAndDelete(id).lean()
  if (!category) {
    throw new Error("No Category found")
  }
  res.json(category)
}

const getSingleCategory = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const category = await Category.findById(id).lean()
  if (!category) {
    throw new Error("No Category found")
  }
  res.json(category)
}

const getAllCategory = async (req, res) => {
  const categories = await Category.find().lean()
  if (!categories.length > 0) {
    throw new Error("No Category found")
  }
  res.json(categories)
}

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategory,
  getSingleCategory,
}
