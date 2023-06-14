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
  if (!id) throw new Error("Blog id is required")
  validateMongoDbId(id)
  const updateBlog = await Blog.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  }).lean()
  if (!updateBlog) {
    throw new Error("No blog found")
  }
  res.json(updateBlog)
}

const getBlog = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const blog = await Blog.findById(id)
    .populate("likes")
    .populate("disLikes")
    .exec()
  if (!blog) throw new Error("No Blog found")
  blog.numViews = blog.numViews + 1
  const updatedBlog = await blog.save()

  // const updateViews = await Blog.findByIdAndUpdate(
  //   id,
  //   {
  //     $inc: { numViews: 1 },
  //   },
  //   { new: true }
  // )
  res.json(updatedBlog)
}

const getAllBlog = async (req, res) => {
  const blogs = await Blog.find().lean()
  if (blogs.length > 0) {
    res.json(blogs)
  } else {
    throw new Error("No Blog Found")
  }
}

const deleteBlog = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const deleteBlog = await Blog.findByIdAndDelete(id).lean()
  if (!deleteBlog) {
    throw new Error("No blog found")
  }
  res.json(deleteBlog)
}

const likeBlog = async (req, res) => {
  const { blogId } = req.params
  if (!blogId) throw new Error("Blog id is required")
  validateMongoDbId(blogId)
  const blog = await Blog.findById(blogId)
  const loginUserId = req?.user?._id
  const isLiked = blog?.isLiked

  const alreadyDisliked = blog?.disLikes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  )
  if (alreadyDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { disLikes: loginUserId },
        isDisLiked: false,
      },
      { new: true }
    )
    // res.json(blog)
  }
  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    )
    res.json(blog)
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      { new: true }
    )
    res.json(blog)
  }
}

const dislikeBlog = async (req, res) => {
  const { blogId } = req.params
  if (!blogId) throw new Error("Blog id is required")
  validateMongoDbId(blogId)
  const blog = await Blog.findById(blogId)
  const loginUserId = req?.user?._id
  const isDisliked = blog?.isDisLiked

  const alreadyLiked = blog?.likes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  )
  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    )
    // res.json(blog)
  }
  if (isDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { disLikes: loginUserId },
        isDisLiked: false,
      },
      { new: true }
    )
    res.json(blog)
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { disLikes: loginUserId },
        isDisLiked: true,
      },
      { new: true }
    )
    res.json(blog)
  }
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
  createBlog,
  updateBlog,
  getBlog,
  getAllBlog,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  handleUploadImages,
  handleDeleteImage,
  handleDeleteAllImages
}
