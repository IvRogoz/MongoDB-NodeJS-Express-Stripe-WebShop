const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
// Get models
const Page = require('../models/page')
const Product = require('../models/product')
const Services = require('../models/services')
/*
 * GET /
 */
router.get('/', (req, res) => {
  const images = getImagesFromDir('./public/carousel/')
  Page.findOne({ slug: 'home' }, (error, page) => {
    if (error) { return console.log(error) }

    /*
  * GET all products
  */
    Product.find((error, products) => {
      if (error) { return console.log(error) }
      Services.find((error, services) => {
        if (error) { return console.log(error) }

        res.render('home', {
          title: page.title,
          content: page.content,
          images,
          products,
          services,

          currency: req.app.locals.currency,
          company: req.app.locals.company,
          email: req.app.locals.email,
          contact: req.app.locals.contact,
          addressCountry: req.app.locals.addressCountry,
          addressStreet: req.app.locals.addressStreet,
          addressCity: req.app.locals.addressCity,
          addressZip: req.app.locals.addressZip,
          facebook: req.app.locals.facebook,
          youtube: req.app.locals.youtube,
          linkedin: req.app.locals.linkedin,
          twitter: req.app.locals.twitter,
          instagram: req.app.locals.instagram,
          other: req.app.locals.other

        })
      })
    })
  })
})

// dirPath: target image directory
function getImagesFromDir (dirPath) {
  // All iamges holder, defalut value is empty
  const allImages = []

  // Iterator over the directory
  const files = fs.readdirSync(dirPath)

  // Iterator over the files and push jpg and png images to allImages array.
  files.forEach((file) => {
    const fileLocation = path.join(dirPath, file)
    const stat = fs.statSync(fileLocation)
    if (stat && stat.isDirectory()) {
      getImagesFromDir(fileLocation) // process sub directories
    } else if (stat && stat.isFile() && ['.jpg', '.png'].indexOf(path.extname(fileLocation)) !== -1) {
      allImages.push('/carousel/' + file) // push all .jpf and .png files to all images
    }
  })

  // return all images in array formate
  // console.log(allImages)
  return allImages
}

/*
 * GET a page
 */
router.get('/:slug', (req, res) => {
  const slug = req.params.slug

  Page.findOne({ slug }, (error, page) => {
    if (error) { console.log(error) }
    if (!page) {
      res.redirect('/')
    } else {
      res.render('index', {
        title: page.title,
        content: page.content
      })
    }
  })
})

module.exports = router
