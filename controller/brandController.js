const Brand = require("../model/brandModel")
const { validateMongoDbId } = require("../utils/validateMongodbId")

const createBrand = async (req, res) => {
  const newBrand = await Brand.create(req.body)
  res.json(newBrand)
}

const updateBrand = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const updateBrand = await Brand.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  }).lean()
  if (!updateBrand) {
    throw new Error("No Brand found")
  }
  res.json(updateBrand)
}

const deleteBrand = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const brand = await Brand.findByIdAndDelete(id).lean()
  if (!brand) {
    throw new Error("No Brand found")
  }
  res.json(brand)
}

const getSingleBrand = async (req, res) => {
  console.log("single brand")
  const { id } = req.params
  validateMongoDbId(id)
  const brand = await Brand.findById(id).lean()
  if (!brand) {
    throw new Error("No Brand found")
  }
  res.json(brand)
}

const getAllBrand = async (req, res) => {
  const brands = await Brand.find().lean()
  if (!brands.length > 0) {
    throw new Error("No Brand found")
  }
  res.json(brands)
}



module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getAllBrand,
  getSingleBrand,
}
