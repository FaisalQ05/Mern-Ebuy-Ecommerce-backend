const { logEvents } = require("./logger")

const errorHandler = (error, req, res, next) => {
  // console.log(error)
  logEvents(
    `${error.name}\t${error.message}\t${req.method}\t${req.url}\t`,
    "ErrorLogs.log"
  )

  // const status = res.statusCode ? res.statusCode : 500
  const status =
    res.statusCode === 200 ? 400 : res.statusCode ? res.statusCode : 500
  res.status(error.statusCode ? error.statusCode : status)

  if (error.name === "ValidationError") {
    handleValidationError(error, res)
  } else if (error.code && error.code === 11000) {
    handleDuplicateKeyErrors(error, res)
  } else {
    res.json({ message: error.message, isError: true })
  }
}

const handleValidationError = (error, res) => {
  let errors = {}
  Object.keys(error.errors).forEach((key) => {
    errors[key] = error.errors[key].message
  })

  return res.status(400).json({ message: errors, isError: true })
}

const handleDuplicateKeyErrors = (error, res) => {
  const field = Object.keys(error.keyValue)
  let message =
    field[0] === "mobile"
      ? "The mobile phone is already exists"
      : `The ${field} is already exists`
  return res.status(400).json({
    message,
    isError: true,
  })
}

module.exports = { errorHandler }
