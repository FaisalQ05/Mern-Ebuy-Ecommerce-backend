const BlogCategory = require("../model/blogCatModel")
const { validateMongoDbId } = require("../utils/validateMongodbId")

const createCategory = async (req, res) => {
  const newCategory = await BlogCategory.create(req.body)
  res.json(newCategory)
}

const updateCategory = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const updateCategory = await BlogCategory.findOneAndUpdate(
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
  const category = await BlogCategory.findByIdAndDelete(id).lean()
  if (!category) {
    throw new Error("No Category found")
  }
  res.json(category)
}

const getSingleCategory = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const category = await BlogCategory.findById(id).lean()
  if (!category) {
    throw new Error("No Category found")
  }
  res.json(category)
}

const getAllCategory = async (req, res) => {
  const categories = await BlogCategory.find().lean()
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
