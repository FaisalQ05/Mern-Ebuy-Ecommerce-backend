const mongoose = require("mongoose")

var blogCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
)

blogCategorySchema.pre("findOneAndUpdate", function (next) {
  this.options.runValidators = true
  next()
})

//Export the model
module.exports = mongoose.model("BlogCategory", blogCategorySchema)
