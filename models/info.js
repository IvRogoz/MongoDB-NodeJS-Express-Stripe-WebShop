const mongoose = require('mongoose')

const infoSchema = mongoose.Schema({
  company: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  addressCountry: {
    type: String,
    required: true
  },
  addressStreet: {
    type: String,
    required: true
  },
  addressCity: {
    type: String,
    required: true
  },
  addressZip: {
    type: String,
    required: true
  },
  facebook: {
    type: String
  },
  youtube: {
    type: String
  },
  linkedin: {
    type: String
  },
  twitter: {
    type: String
  },
  instagram: {
    type: String
  },
  other: {
    type: String
  }

})

const Info = module.exports = mongoose.model('Info', infoSchema)
