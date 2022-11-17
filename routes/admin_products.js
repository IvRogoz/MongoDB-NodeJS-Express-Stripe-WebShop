const express = require('express')
const path = require('path')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const mkdirp = require('mkdirp')
const fs = require('fs-extra')
const resizeImg = require('resize-img')
const auth = require('../config/auth')
const isAdmin = auth.isAdmin

/**
 * Get product models
 */
const Product = require('../models/product')
const Category = require('../models/category')

/**
 * GET Product index
 */

router.get('/', isAdmin, (req, res) => {
  let count
  Product.count((error, c) => {
    if (error) return console.log(error)
    count = c
  })
  Product.find((error, products) => {
    if (error) return console.log(error)
    return res.render('admin/products', {
      products,
      count
    })
  })
})

/**
 * GET add product
 */
router.get('/add-product', isAdmin, (req, res) => {
  const title = ''
  const desc = ''
  const price = ''
  Category.find((error, categories) => {
    if (error) return console.log(error)
    return res.render('admin/add_product', {
      title,
      desc,
      categories,
      price
    })
  })
})

/**
 * POST add product
 */

router.post('/add-product', [
  check('title', 'Title must have a value.').notEmpty(),
  check('desc', 'Description must have a value.').notEmpty(),
  check('price', 'Price must have a value.').isDecimal(),
  check('image').custom((value, { req }) => {
    if (req.files) {
      const imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : ''
      const extension = (path.extname(imageFile)).toLowerCase()
      switch (extension) {
        case '.jpg':
          return '.jpg'
        case '.jpeg':
          return '.jpeg'
        case '.png':
          return '.png'
        case '':
          return '.jpg'
        default:
          return false
      }
    } else return true
  }).withMessage('Please only submit Image documents.')
], (req, res) => {
  const errors = validationResult(req)
  console.log(errors)

  const title = req.body.title
  const slug = title.replace(/\s+/g, '-').toLowerCase()
  const desc = req.body.desc
  const price = req.body.price
  const category = req.body.category

  if (!errors.isEmpty()) {
    Category.find((error, categories) => {
      if (error) return console.log('Products first error:' + error)
      return res.render('admin/add_product', {
        errors: errors.array(),
        title,
        desc,
        categories,
        price
      })
    })
  } else {
    Product.findOne({ slug }, (error, product) => {
      console.log(error)
      if (product) {
        req.flash('danger', 'Product title already exists.')
        Category.find((error, categories) => {
          if (error) return console.log('Product exists:' + error)
          return res.render('admin/add_product', {
            title,
            desc,
            categories,
            price
          })
        })
      } else {
        const price2 = parseFloat(price).toFixed(2)
        let imageFile = ''
        if (req.files) {
          imageFile = req.files.image.name
        }
        const product = new Product({
          title,
          slug,
          desc,
          price: price2,
          category,
          image: imageFile
        })
        product.save((error) => {
          if (error) return console.log('Save Product:' + error)

          const made = mkdirp.sync('public/product_images/')
          const made2 = mkdirp.sync('public/product_images/' + product._id + '/gallery')
          const made3 = mkdirp.sync('public/product_images/' + product._id + '/gallery/thumbs')

          if (imageFile !== '') {
            const productImage = req.files.image
            const path = 'public/product_images/' + product._id + '/' + imageFile

            productImage.mv(path, function (err) {
              if (err) return console.log('Move:' + err)
            })
          }

          req.flash('success', 'Product added!')
          res.redirect('/admin/products')
        })
      }
    })
  }
})

/**
 * GET edit product
 */
router.get('/edit-product/:id', isAdmin, (req, res) => {
  let errors
  if (req.session.errors) errors = req.session.errors
  req.session.errors = null
  Category.find((error, categories) => {
    if (error) return console.log(error)

    return Product.findById(req.params.id, (error, p) => {
      if (error) {
        console.log(error)
        res.redirect('/admin/products')
      } else {
        const galleryDir = 'public/product_images/' + p._id + '/gallery'
        let galleryImages = null

        fs.readdir(galleryDir, function (error, files) {
          if (error) {
            console.log(error)
          } else {
            galleryImages = files

            res.render('admin/edit_product', {
              title: p.title,
              errors,
              desc: p.desc,
              categories,
              category: p.category.replace(/\s+/g, '-').toLowerCase(),
              price: parseFloat(p.price).toFixed(2),
              image: p.image,
              galleryImages,
              id: p._id
            })
          }
        })
      }
    })
  })
})

/**
 * POST edit product
 */

router.post('/edit-product/:id', [
  check('title', 'Title must have a value.').notEmpty(),
  check('desc', 'Description must have a value.').notEmpty(),
  check('price', 'Price must have a value.').isDecimal(),
  check('image').custom((value, { req }) => {
    if (req.files) {
      const imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : ''
      const extension = (path.extname(imageFile)).toLowerCase()
      switch (extension) {
        case '.jpg':
          return '.jpg'
        case '.jpeg':
          return '.jpeg'
        case '.png':
          return '.png'
        case '':
          return '.jpg'
        default:
          return false
      }
    } else return true
  }).withMessage('Please only submit Image documents.')
], (req, res) => {
  const errors = validationResult(req)
  console.log(errors)

  const title = req.body.title
  console.log('Title:', title)
  const slug = title.replace(/\s+/g, '-').toLowerCase()
  const desc = req.body.desc
  const price = req.body.price
  const category = req.body.category
  const pimage = req.body.pimage
  const id = req.params.id
  console.log('id:', id)
  if (!errors.isEmpty()) {
    req.session.errors = errors
    res.redirect('/admin/products/edit-product/' + id)
  } else {
    Product.findOne({ slug, _id: { $ne: id } }, (error, p) => {
      if (error) console.log(error)
      if (p) {
        req.flash('danger', 'Product title exists, choos another.')
        res.redirect('/admin/products/edit-product/' + id)
      } else {
        Product.findById(id, (error, p) => {
          if (error) console.log(error)
          p.title = title
          p.slug = slug
          p.desc = desc
          p.price = parseFloat(price).toFixed(2)
          p.category = category

          let imageFile = ''
          if (req.files) imageFile = req.files.image.name
          if (imageFile !== '') p.image = imageFile

          p.save((error) => {
            if (error) console.log(error)

            if (imageFile !== '') {
              if (pimage !== '') {
                fs.remove('public/product_images/' + id + '/' + pimage, function (error) {
                  if (error) console.log(error)
                })
              }

              const productImage = req.files.image
              const path = 'public/product_images/' + id + '/' + imageFile

              productImage.mv(path, function (error) {
                if (error) return console.log(error)
              })
            }

            req.flash('success', 'Product edited!')
            res.redirect('/admin/products/edit-product/' + id)
          })
        })
      }
    })
  }
})

/*
 * POST product gallery
 */
router.post('/product-gallery/:id', (req, res) => {
  const productImage = req.files.file
  const id = req.params.id
  const path = 'public/product_images/' + id + '/gallery/' + req.files.file.name
  const thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name

  productImage.mv(path, (error) => {
    if (error) { console.log(error) }

    resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then((buf) => {
      fs.writeFileSync(thumbsPath, buf)
    })
  })

  res.sendStatus(200)
})

/*
 * GET delete image
 */
router.get('/delete-image/:image', isAdmin, (req, res) => {
  const originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image
  const thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image

  fs.remove(originalImage, (error) => {
    if (error) {
      console.log(error)
    } else {
      fs.remove(thumbImage, (error) => {
        if (error) {
          console.log(error)
        } else {
          req.flash('success', 'Image deleted!')
          res.redirect('/admin/products/edit-product/' + req.query.id)
        }
      })
    }
  })
})

/*
 * GET delete product
 */
router.get('/delete-product/:id', isAdmin, function (req, res) {
  const id = req.params.id
  const path = 'public/product_images/' + id

  fs.remove(path, function (err) {
    if (err) {
      console.log(err)
    } else {
      Product.findByIdAndRemove(id, function (error) {
        console.log(error)
      })

      req.flash('success', 'Product deleted!')
      res.redirect('/admin/products')
    }
  })
})

module.exports = router
