const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const auth = require('../config/auth')
const isAdmin = auth.isAdmin

/**
 * Get Services models
 */
const Services = require('../models/services')
/**
 * GET Services index
 */

router.get('/', isAdmin, (req, res) => {
  Services.find((error, services) => {
    if (error) return console.log(error)
    console.log(services)
    return res.render('admin/services', {
      services
    })
  })
})

/**
 * GET add Service
 */
router.get('/add-service', isAdmin, (req, res) => {
  const title = ''
  const text = ''
  const description = ''
  const icon = ''
  res.render('admin/add_service', {
    title,
    text,
    description,
    icon
  })
})

/**
 * POST add category
 */

router.post('/add-service', [
  check('title', 'Title must have a value.').notEmpty()
], (req, res) => {
  const errors = validationResult(req)
  console.log(errors)
  const title = req.body.title
  const text = req.body.text
  const description = req.body.description
  const icon = req.body.icon

  if (!errors.isEmpty()) {
    res.render('admin/add_service', {
      errors: errors.array(),
      title,
      text,
      description,
      icon
    })
  } else {
    Services.findOne({ title }, (error, service) => {
      console.log(error)
      if (service) {
        req.flash('danger', 'Service title already exists.')
        res.render('admin/add_service', {
          title,
          text,
          description,
          icon
        })
      } else {
        const service = new Services({
          title,
          text,
          description,
          icon
        })
        service.save((error) => {
          if (error) return console.log(error)

          // Get all services to pass to header.ejs
          Services.find((error, services) => {
            if (error) {
              console.log(error)
            } else {
              req.app.locals.services = services
            }
          })
          req.flash('success', 'Servicec Added')
          res.redirect('/admin/services')
        })
      }
    })
  }
})

/**
 * GET edit services
 */
router.get('/edit-service/:id', isAdmin, (req, res) => {
  Services.findById(req.params.id, (error, service) => {
    if (error) return console.log(error)
    console.log(service)
    res.render('admin/edit_service', {
      title: service.title,
      text: service.text,
      description: service.description,
      icon: service.icon,
      id: service._id
    })
  })
})

/**
 * POST edit services
 */

router.post('/edit-service/:id', [
  check('title', 'Title must have a value.').notEmpty()
], (req, res) => {
  const errors = validationResult(req)

  const title = req.body.title
  const text = req.body.text
  const description = req.body.description
  const icon = req.body.icon
  const id = req.params.id

  if (!errors.isEmpty()) {
    res.render('admin/edit_service', {
      errors: errors.array(),
      title,
      text,
      description,
      icon,
      id
    })
  } else {
    Services.findById(id, async (error, service) => {
      if (error) return console.log(error)
      console.log(id)
      console.log(service)
      console.log(title)
      service.title = title
      service.text = text
      service.description = description
      service.icon = icon

      await service.save((error) => {
        if (error) return console.log(error)

        // Get all services to pass to header.ejs
        Services.find((error, services) => {
          if (error) {
            console.log(error)
          } else {
            req.app.locals.services = services
          }
        })

        req.flash('success', 'Service Edited')
        res.redirect('/admin/services/edit-service/' + id)
      })
    })
  }
})

/**
 * GET delete service
 */

router.get('/delete-service/:id', (req, res) => {
  Services.findByIdAndRemove(req.params.id, (error) => {
    if (error) return console.log(error)

    // Get all services to pass to header.ejs
    Services.find((error, services) => {
      if (error) {
        console.log(error)
      } else {
        req.app.locals.services = services
      }
    })

    req.flash('success', 'Service deleted')
    res.redirect('/admin/services/')
  })
})

module.exports = router
