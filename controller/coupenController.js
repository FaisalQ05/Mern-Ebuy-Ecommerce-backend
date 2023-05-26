const Coupen = require("../model/coupenModel")
const { validateMongoDbId } = require("../utils/validateMongodbId")

const createCoupen = async (req, res) => {
  const newCoupen = await Coupen.create(req.body)
  if (newCoupen) res.json(newCoupen)
  else throw new Error("Invalid Data received")
}

const getAllCoupens = async (req, res) => {
  const coupens = await Coupen.find()
  if (coupens.length > 0) res.json(coupens)
  else throw new Error("No Coupen Found")
}

const updateCoupen = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const updatedCoupen = await Coupen.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  })
  if (updatedCoupen) res.json(updatedCoupen)
  else throw new Error("No Coupen Found")
}

const deleteCoupen = async (req, res) => {
  const { id } = req.params
  validateMongoDbId(id)
  const coupen = await Coupen.findByIdAndDelete(id).lean()
  if (coupen) res.json(coupen)
  else throw new Error("No Coupen Found")
}

module.exports = { createCoupen, getAllCoupens, updateCoupen, deleteCoupen }
