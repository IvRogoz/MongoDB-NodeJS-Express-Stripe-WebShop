const express = require('express')
const router = express.Router()
const fs = require('fs-extra')
// const auth = require('../config/auth')
// const isUser = auth.isUser

// Get Product model
const Product = require('../models/product')

// Get Category model
const Category = require('../models/category')

/*
 * GET all products
 */
router.get('/', (req, res) => {
  Product.find((error, products) => {
    if (error) { console.log(error) }

    return res.render('all_products', {
      title: 'All products',
      products,
      currency: req.app.locals.currency,
      contact: res.app.locals.contact,
      category: 'all_products'
    })
  })
})

/*
 * GET products by category
 */

router.get('/:category', (req, res) => {
  const categorySlug = req.params.category
 console.log('Here')
  Category.findOne({ slug: categorySlug }, (error, c) => {
    if (error) { console.log(error) }
    Product.find({ category: categorySlug }, (error, products) => {
      if (error) { console.log(error) }

      res.render('cat_products', {
        title: c.title,
        products
      })
    })
  })
})

/*
 * GET product details
 */
router.get('/:category/:product', (req, res) => {
  let galleryImages = null
  const loggedIn = !!(req.isAuthenticated())
  console.log(req.params.category)
  Product.findOne({ slug: req.params.product }, (error, product) => {
    if (error) {
      console.log(error)
    } else {
      const galleryDir = 'public/product_images/' + product._id + '/gallery'

      fs.readdir(galleryDir, (error, files) => {
        if (error) {
          console.log(error)
        } else {
          galleryImages = files

          res.render('product', {
            title: product.title,
            contact: res.app.locals.contact,
            p: product,
            category: req.params.category,
            galleryImages,
            loggedIn
          })
        }
      })
    }
  })
})

// Exports
module.exports = router
