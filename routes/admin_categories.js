const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const auth = require('../config/auth')
const isAdmin = auth.isAdmin

/**
 * Get Chategory models
 */
const Category = require('../models/category')

const Product = require('../models/product')

/**
 * GET pages index
 */

router.get('/', isAdmin, (req, res) => {
  Category.find((error, categories) => {
    if (error) return console.log(error)
    console.log(categories)
    return res.render('admin/categories', {
      categories
    })
  })
})

/**
 * GET add category
 */
router.get('/add-category', isAdmin, (req, res) => {
  const title = ''
  res.render('admin/add_category', {
    title
  })
})

/**
 * POST add category
 */

router.post('/add-category', [
  check('title', 'Title must have a value.').notEmpty()
], (req, res) => {
  const errors = validationResult(req)
  console.log(errors)
  const title = req.body.title
  const slug = title.replace(/\s+/g, '-').toLowerCase()

  if (!errors.isEmpty()) {
    res.render('admin/add_category', {
      errors: errors.array(),
      title
    })
  } else {
    Category.findOne({ slug }, (error, category) => {
      console.log(error)
      if (category) {
        req.flash('danger', 'Category slug already exists.')
        res.render('admin/add_category', {
          title
        })
      } else {
        const category = new Category({
          title,
          slug
        })
        category.save((error) => {
          if (error) return console.log(error)

          // Get all categories to pass to header.ejs
          Category.find((error, categories) => {
            if (error) {
              console.log(error)
            } else {
              req.app.locals.categories = categories
            }
          })
          req.flash('success', 'Category Added')
          res.redirect('/admin/categories')
        })
      }
    })
  }
})

/**
 * GET edit category
 */
router.get('/edit-category/:id', isAdmin, (req, res) => {
  Category.findById(req.params.id, (error, category) => {
    if (error) return console.log(error)
    console.log(category)
    res.render('admin/edit_category', {
      title: category.title,
      id: category._id
    })
  })
})

/**
 * POST edit category
 */

router.post('/edit-category/:id', [
  check('title', 'Title must have a value.').notEmpty()
], (req, res) => {
  const errors = validationResult(req)

  const title = req.body.title
  const slug = title.replace(/\s+/g, '-').toLowerCase()
  const id = req.params.id

  if (!errors.isEmpty()) {
    res.render('admin/edit_category', {
      errors: errors.array(),
      title,
      id
    })
  } else {
    Category.findOne({ slug, _id: { $ne: id } }, (error, category) => {
      console.log('Edit_2:' + error)
      if (category) {
        req.flash('danger', 'Category title already exists.')
        res.render('admin/edit_category', {
          title,
          id
        })
      } else {
        Category.findById(id, async(error, category) => {
          if (error) return console.log(error)
          const pastCat = category.slug
          category.title = title
          category.slug = slug
          await category.save((error) => {
            if (error) return console.log(error)

            // Get all categories to pass to header.ejs
            Category.find((error, categories) => {
              if (error) {
                console.log(error)
              } else {
                req.app.locals.categories = categories
              }
            })

            req.flash('success', 'Category Edited')
            res.redirect('/admin/categories/edit-category/' + id)
          })

          console.log('Past:' + pastCat + ' > ' + slug)
          const update = await Product.updateMany({ category: pastCat }, { $set: { category: slug } })
          console.log(update.matchedCount)
          console.log(update.modifiedCount)
        })
      }
    })
  }
})

/**
 * GET delete category
 */

router.get('/delete-category/:id', (req, res) => {
  Category.findByIdAndRemove(req.params.id, (error) => {
    if (error) return console.log(error)

    // Get all categories to pass to header.ejs
    Category.find((error, categories) => {
      if (error) {
        console.log(error)
      } else {
        req.app.locals.categories = categories
      }
    })

    req.flash('success', 'Category deleted')
    res.redirect('/admin/categories/')
  })
})

module.exports = router
