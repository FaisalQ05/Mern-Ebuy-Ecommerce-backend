const mongoose = require("mongoose") // Erase if already required
const bcrypt = require("bcrypt")
// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "price is required"],
      trim: true,
    },
    // category: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Category",
    // },
    category: {
      type: String,
      required: [true, "category is required"],
    },
    // brand: {
    //   type: String,
    //   enum: ["Apple", "Samsung", "Lenovo"],
    // },
    brand: {
      type: String,
      required: [true, "brand is required"],
    },
    quantity: {
      type: Number,
      required: [true, "quantity is required"],
    },
    images: {
      type: [],
    },
    color: {
      type: String,
      required: [true, "color is required"],
    },
    sold: { type: Number, default: 0 },
    ratings: [
      {
        star: Number,
        comment: String,
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    totalrating: {
      type: String,
      default: 0,
    },
  },
  { timestamps: true }
)

productSchema.pre("findOneAndUpdate", function (next) {
  this.options.runValidators = true
  next()
})

//Export the model
module.exports = mongoose.model("Product", productSchema)
