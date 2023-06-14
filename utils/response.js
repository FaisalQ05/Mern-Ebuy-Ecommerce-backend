class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}

const sendResponce = (res, message, result) => {
  res.status(200).json({ success: true, message, result })
}

module.exports = { sendResponce, ErrorResponse }
