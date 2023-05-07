const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL)
  } catch (e) {
    console.log("Db Error : ", e)
  }
}

module.exports = connectDB
