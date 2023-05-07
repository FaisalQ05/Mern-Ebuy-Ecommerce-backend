require("dotenv").config()
const express = require("express")
const connectDB = require("./config/dbConnect")
const { default: mongoose, mongo } = require("mongoose")

const app = express()
const PORT = process.env.PORT || 4000

connectDB()
console.log(process.env.NODE_ENV)

app.get("/", (req, res) => {
  res.send("hello")
})

mongoose.connection.once("open", () => {
  console.log("Databse connected successfully")
  app.listen(PORT, () => {
    console.log(`Server is runing on PORT ${PORT}`)
  })
})

mongoose.connection.on("error", (error) => {
  console.log("Mongoose Error : ", error)
})
