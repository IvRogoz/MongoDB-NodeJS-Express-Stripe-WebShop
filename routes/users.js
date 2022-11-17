const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator')

// Get Users model
const User = require('../models/user')

/*
 * GET register
 */
router.get('/register', (req, res) => {
  res.render('register', {
    title: 'Register'
  })
})

/*
 * POST register
*checkSchema(registrationSchema),
 */
router.post('/register', [
  check('name', 'Name is required!').notEmpty(),
  check('email', 'Email is required!').isEmail(),
  check('username', 'Username is required!').notEmpty(),
  check('password', 'Password is required!').notEmpty(),
  check('password').custom((password, { req }) => {
    const password2 = req.body.password2
    if (!(password === password2)) {
      throw new Error('Passwords must be same')
    } else {
      return true
    }
  })
], (req, res) => {
  console.log('Here2')
  const name = req.body.name
  const email = req.body.email
  const username = req.body.username
  const password = req.body.password

  const errors = validationResult(req)
  console.log(errors)

  if (!errors.isEmpty()) {
    res.render('register', {
      errors: errors.array(),
      user: null,
      title: 'Register'
    })
  } else {
    User.findOne({ username }, (err, user) => {
      if (err) { console.log(err) }

      if (user) {
        console.log('Here3')
        req.flash('danger', 'Username exists, choose another!')
        res.redirect('/users/register')
      } else {
        console.log('Here4')
        const user = new User({
          name,
          email,
          username,
          password,
          admin: 0
        })

        bcrypt.genSalt(10, (err, salt) => {
          if (err) { console.log(err) }
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) { console.log(err) }

            user.password = hash

            user.save((err) => {
              if (err) {
                console.log(err)
              } else {
                req.flash('success', 'You are now registered!')
                res.redirect('/users/login')
              }
            })
          })
        })
      }
    })
  }
})

/*
 * GET login
 */
router.get('/login', (req, res) => {
  if (res.locals.user) return res.redirect('/')

  res.render('login', {
    title: 'Log in'
  })
})

/*
 * POST login
 */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})

/*
 * GET logout
 */
router.get('/logout', (req, res, next) => {
  req.logout((error) => {
    if (error) { return next(error) }
    delete req.session.cart
    req.flash('success', 'You are logged out!')
    res.redirect('/users/login')
  })
})

// Exports
module.exports = router
