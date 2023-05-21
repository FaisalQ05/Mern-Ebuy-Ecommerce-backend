const Blog = require("../model/blogModel")
const User = require("../model/userModel")
const { validateMongoDbId } = require("../utils/validateMongodbId")

const createBlog = async (req, res) => {
  const newBlog = await Blog.create(req.body)
  if (newBlog) {
    res.json({
      status: "success",
      newBlog,
    })
  } else {
    throw new Error("Invalid Data Recevied")
  }
}

const updateBlog = async (req, res) => {
  const { id } = req.params
  if (!id) throw new Error("Blog is required")
  validateMongoDbId(id)
  const updateBlog = await Blog.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  }).lean()
  if (!updateBlog) {
    throw new Error("No blog found")
  }
  res.json(updateBlog)
}

module.exports = { createBlog, updateBlog }
