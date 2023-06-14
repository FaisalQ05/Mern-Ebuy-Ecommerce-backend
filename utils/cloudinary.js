const cloudinary = require("cloudinary").v2

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
})

const cloudinaryUploadImage = async (fileToUpload, folder) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      fileToUpload,
      { resource_type: "auto", folder: `Ebuy/${folder}` },
      (err, result) => {
        // console.log("result : ", result)
        resolve({
          url: result.secure_url,
          asset_id: result.asset_id,
          public_id: result.public_id,
        })
      }
    )
  })
}

const cloudinaryDeleteImage = async (fileToDelete) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      fileToDelete,
      { resource_type: "image" },
      (err, res) => {
        if (res) {
          resolve({
            result: res.result,
          })
        } else {
          reject(err)
        }
      }
    )
  })
}

const getAllPublicIds = async (folderPath) => {
  return new Promise((resolve, reject) => {
    cloudinary.api.resources(
      {
        type: "upload",
        prefix: `Ebuy/${folderPath}/`,
        max_results: 500,
      },
      (err, result) => {
        if (err) {
          reject(err)
        } else {
          const publicIds = result.resources.map(
            (resource) => resource.public_id
          )
          resolve(publicIds)
        }
      }
    )
  })
}

const cloudinaryDeleteAllImages = async (folderPath) => {
  return new Promise((resolve, reject) => {
    getAllPublicIds(folderPath)
      .then((result) => {
        if (result.length === 0) {
          reject({ message: "Folder is already empty" })
        }
        cloudinary.api.delete_resources(result, (err, result) => {
          resolve(result)
        })
      })
      .catch((err) => reject(err))
  })
}

module.exports = {
  cloudinaryUploadImage,
  cloudinaryDeleteImage,
  cloudinaryDeleteAllImages,
}
