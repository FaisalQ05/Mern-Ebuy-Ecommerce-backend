require("dotenv").config()
require("express-async-errors")
const express = require("express")
const { default: mongoose } = require("mongoose")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")

const authRoute = require("./routes/authRoute")
const productRoute = require("./routes/productRoute")
const blogRoute = require("./routes/blogRoute")
const categoryRoute = require("./routes/prodCategoryRoute")
const blogCatRoute = require("./routes/blogCatRoute")
const brandRoute = require("./routes/brandRoute")
const coupenRoute = require("./routes/coupenRoute")

const connectDB = require("./config/dbConnect")
const { errorHandler } = require("./middleware/errorHandler")
const { logEvents, logger } = require("./middleware/logger")

const app = express()
const PORT = process.env.PORT || 4000

//Database Connect
connectDB()

console.log(process.env.NODE_ENV)

app.use(morgan("dev"))
app.use(logger)

//Body parser for Json
app.use(express.json())
app.use(cookieParser())

//Api routes
app.use("/api/user", authRoute)
app.use("/api/product", productRoute)
app.use("/api/blog", blogRoute)
app.use("/api/prodCategory", categoryRoute)
app.use("/api/blogcategory", blogCatRoute)
app.use("/api/brand", brandRoute)
app.use("/api/coupen", coupenRoute)

app.all("*", (req, res) => {
  res.status(404)
  res.json("404 not found")
})

app.use(errorHandler)

//If connection open once
mongoose.connection.once("open", () => {
  console.log("Databse connected successfully")
  app.listen(PORT, () => {
    console.log(`Server is runing on PORT ${PORT}`)
  })
})

//When mongos throw an error
mongoose.connection.on("error", (err) => {
  logEvents(
    `${err.no}: ${err.code}\t${err.codeName}\t${err.hostname}`,
    "dbConnectionError.log"
  )
  console.log("Mongoose Error : ", err)
})
