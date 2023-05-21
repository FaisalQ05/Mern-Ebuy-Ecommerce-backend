const mongoose = require("mongoose")

var blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "category is required"],
      trim: true,
    },
    numViews: {
      type: Number,
      default: 0,
    },
    isLiked: {
      type: Boolean,
      default: false,
    },
    isDisLiked: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    disLikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    image: {
      type: String,
      default:
        "https://www.shutterstock.com/image-photo/blogging-blog-word-coder-coding-260nw-520314613.jpg",
    },
    author: {
      type: String,
      default: "admin",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
)

blogSchema.pre("findOneAndUpdate", function (next) {
  this.options.runValidators = true
  next()
})

//Export the model
module.exports = mongoose.model("Blog", blogSchema)
