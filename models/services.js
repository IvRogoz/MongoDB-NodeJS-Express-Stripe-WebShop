const mongoose = require('mongoose')

const serviceSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  text: {
    type: String
  },
  description: {
    type: String
  },
  icon: {
    type: String
  }
})

const Services = module.exports = mongoose.model('Services', serviceSchema)
