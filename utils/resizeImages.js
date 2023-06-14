const sharp = require("sharp")

module.exports.resizeImage = async (file, width, height) => {
  return await sharp(file.buffer)
    .resize(width, height)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer()
}
