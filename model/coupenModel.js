const mongoose = require("mongoose") // Erase if already required

// Declare the Schema of the Mongo model
var couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
    unique: true,
    uppercase: true,
  },
  expiry: {
    type: Date,
    required: [true, "expiry is required"],
  },
  discount: {
    type: Number,
    required: [true, "discount is required"],
  },
})

//Export the model
module.exports = mongoose.model("Coupon", couponSchema)
