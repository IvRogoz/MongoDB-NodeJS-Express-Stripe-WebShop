const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const auth = require('../config/auth')
const isAdmin = auth.isAdmin

/**
 * Get info models
 */
const Info = require('../models/info')

/**
 * GET Info index
 */

router.get('/', isAdmin, (req, res) => {
  Info.find({}).sort({ sorting: 1 }).exec((error, info) => {
    console.log(info)
    info = info[0]
    if (error) console.log(error)
    res.render('admin/info', {
      company: info.company,
      email: info.email,
      contact: info.contact,
      addressCountry: info.addressCountry,
      addressStreet: info.addressStreet,
      addressCity: info.addressCity,
      addressZip: info.addressZip,
      facebook: info.facebook,
      youtube: info.youtube,
      linkedin: info.linkedin,
      twitter: info.twitter,
      instagram: info.instagram,
      other: info.other,
      id: info._id
    })
  })
})

/**
 * POST edit page
 */

router.post('/edit-info/:id', [
  check('company', 'Company must have a value.').notEmpty(),
  check('email', 'Email must have a value.').notEmpty(),
  check('contact', 'contact must have a value.').notEmpty(),
  check('addressCountry', 'Country must have a value.').notEmpty(),
  check('addressStreet', 'Street must have a value.').notEmpty(),
  check('addressCity', 'City must have a value.').notEmpty(),
  check('addressZip', 'Zip code must have a value.').notEmpty()
], (req, res) => {
  const errors = validationResult(req)

  const company = req.body.company
  const email = req.body.email
  const contact = req.body.contact
  const addressCountry = req.body.addressCountry
  const addressStreet = req.body.addressStreet
  const addressCity = req.body.addressCity
  const addressZip = req.body.addressZip
  const facebook = req.body.facebook
  const youtube = req.body.youtube
  const linkedin = req.body.linkedin
  const twitter = req.body.twitter
  const instagram = req.body.instagram
  const other = req.body.other

  const id = req.params.id

  if (!errors.isEmpty()) {
    res.render('admin/info', {
      errors: errors.array(),
      company,
      email,
      contact,
      addressCountry,
      addressStreet,
      addressCity,
      addressZip,
      facebook,
      youtube,
      linkedin,
      twitter,
      instagram,
      other,
      id
    })
  } else {
    Info.findById(id, (error, info) => {
      if (error) return console.log(error)

      info.company = company
      info.email = email
      info.contact = contact
      info.address_country = addressCountry
      info.address_street = addressStreet
      info.address_city = addressCity
      info.address_zip = addressZip
      info.facebook = facebook
      info.youtube = youtube
      info.linkedin = linkedin
      info.twitter = twitter
      info.instagram = instagram
      info.other = other

      info.save((error) => {
        if (error) return console.log(error)
        req.flash('success', 'Info Edited')
        res.redirect('/admin/info/')
      })
    })
  }
})

module.exports = router
