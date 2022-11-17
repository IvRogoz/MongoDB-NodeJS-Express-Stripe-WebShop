const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const auth = require('../config/auth')
const isAdmin = auth.isAdmin

const fs = require('fs-extra')

/**
 * Get page models
 */
const Page = require('../models/page')
const Info = require('../models/info')

/**
 * GET pages index
 */

router.get('/', isAdmin, (req, res) => {
  Page.find({}).sort({ sorting: 1 }).exec((error, pages) => {
    if (error) console.log(error)
    res.render('admin/pages', {
      pages
    })
  })
})

/**
 * GET add page
 */
router.get('/add-page', isAdmin, (req, res) => {
  const title = ''
  const slug = ''
  const content = ''
  res.render('admin/add_page', {
    title,
    slug,
    content
  })
})

/**
 * POST add page
 */

router.post('/add-page', [
  check('title', 'Title must have a value.').notEmpty(),
  check('content', 'Content must have a value.').notEmpty()
], (req, res) => {
  const errors = validationResult(req)
  console.log(errors)
  const title = req.body.title
  const content = req.body.content
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase()
  if (slug === '') slug = title.replace(/\s+/g, '-').toLowerCase()

  if (!errors.isEmpty()) {
    res.render('admin/add_page', {
      errors: errors.array(),
      title,
      slug,
      content
    })
  } else {
    Page.findOne({ slug }, (error, page) => {
      console.log(error)
      if (page) {
        req.flash('danger', 'Page slug already exists.')
        res.render('admin/add_page', {
          title,
          slug,
          content
        })
      } else {
        const page = new Page({
          title,
          slug,
          content,
          sorting: 100
        })

        Page.find({}).sort({ sorting: 1 }).exec((error, pages) => {
          if (error) {
            console.log(error)
          } else {
            req.app.locals.pages = pages
          }
        })

        page.save((error) => {
          if (error) return console.log(error)
          req.flash('success', 'Page Added')
          res.redirect('/admin/pages')
        })
      }
    })
  }
})

// Sort pages function
function sortPages (ids, callback) {
  let count = 0

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    count++;

    (function (count) {
      Page.findById(id, (error, page) => {
        if (error) return console.log(error)
        page.sorting = count
        page.save((error) => {
          if (error) { return console.log(error) }
          ++count
          if (count >= ids.length) {
            callback()
          }
        })
      })
    })(count)
  }
}

/*
* POST reorder pages
*/
router.post('/reorder-pages', (req, res) => {
  const ids = req.body['id[]']

  sortPages(ids, () => {
    Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
      if (err) {
        console.log(err)
      } else {
        req.app.locals.pages = pages
      }
    })
  })
})

/**
 * GET edit page
 */
router.get('/edit-page/:id', isAdmin, (req, res) => {
  Page.findById(req.params.id, (error, page) => {
    if (error) return console.log(error)
    res.render('admin/edit_page', {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id
    })
  })
})

/**
 * POST edit page
 */

router.post('/edit-page/:id', [
  check('title', 'Title must have a value.').notEmpty(),
  check('content', 'Content must have a value.').notEmpty()
], (req, res) => {
  const errors = validationResult(req)
  const title = req.body.title
  const content = req.body.content
  const id = req.params.id
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase()
  if (slug === '') slug = req.body.title.replace(/\s+/g, '-').toLowerCase()
  if (!errors.isEmpty()) {
    res.render('admin/edit_page', {
      errors: errors.array(),
      title,
      slug,
      content,
      id
    })
  } else {
    Page.findOne({ slug, _id: { $ne: id } }, (error, page) => {
      console.log('Edit_2:' + error)
      if (page) {
        req.flash('danger', 'Page slug already exists.')
        res.render('admin/edit_page', {
          title,
          slug,
          content
        })
      } else {
        Page.findById(id, (error, page) => {
          if (error) return console.log(error)
          page.title = title
          page.slug = slug
          page.content = content
          page.save((error) => {
            if (error) return console.log(error)

            Page.find({}).sort({ sorting: 1 }).exec((error, pages) => {
              if (error) {
                console.log(error)
              } else {
                req.app.locals.pages = pages
              }
            })

            req.flash('success', 'Page Edited')
            res.redirect('/admin/pages/edit-page/' + id)
          })
        })
      }
    })
  }
})

/**
 * GET delete pages
 */

router.get('/delete-page/:id', isAdmin, (req, res) => {
  Page.findByIdAndRemove(req.params.id, (error) => {
    if (error) return console.log(error)

    Page.find({}).sort({ sorting: 1 }).exec((error, pages) => {
      if (error) {
        console.log(error)
      } else {
        req.app.locals.pages = pages
      }
    })

    req.flash('success', 'Page deleted')
    res.redirect('/admin/pages/')
  })
})

router.post('/upload', (req, res) => {
  try {
    console.log('here')

    const imageName = req.files.upload.name
    const productImage = req.files.upload
    const path = 'public/page_images/' + imageName

    productImage.mv(path, function (err) {
      if (err) return console.log('Move:' + err)
      const url = '/page_images/' + imageName
      const msg = 'Upload successfully'
      const funcNum = req.query.CKEditorFuncNum
      console.log({ url, msg, funcNum })

      res.status(201).send("<script>window.parent.CKEDITOR.tools.callFunction('" + funcNum + "','" + url + "','" + msg + "');</script>")
    })
  } catch (error) {
    console.log(error.message)
  }
})

/**
 * GET add Info
 */
router.get('/info', isAdmin, (req, res) => {
  console.log('Here')
  const title = ''
  const slug = ''
  const content = ''
  res.render('admin/info', {
    title,
    slug,
    content
  })
})

/**
 * POST add Info
 */

router.post('/add-page', [
  check('title', 'Title must have a value.').notEmpty(),
  check('content', 'Content must have a value.').notEmpty()
], (req, res) => {
  const errors = validationResult(req)
  console.log(errors)
  const title = req.body.title
  const content = req.body.content
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase()
  if (slug === '') slug = title.replace(/\s+/g, '-').toLowerCase()

  if (!errors.isEmpty()) {
    res.render('admin/add_page', {
      errors: errors.array(),
      title,
      slug,
      content
    })
  } else {
    Page.findOne({ slug }, (error, page) => {
      console.log(error)
      if (page) {
        req.flash('danger', 'Page slug already exists.')
        res.render('admin/add_page', {
          title,
          slug,
          content
        })
      } else {
        const page = new Page({
          title,
          slug,
          content,
          sorting: 100
        })

        Page.find({}).sort({ sorting: 1 }).exec((error, pages) => {
          if (error) {
            console.log(error)
          } else {
            req.app.locals.pages = pages
          }
        })

        page.save((error) => {
          if (error) return console.log(error)
          req.flash('success', 'Page Added')
          res.redirect('/admin/pages')
        })
      }
    })
  }
})

module.exports = router
