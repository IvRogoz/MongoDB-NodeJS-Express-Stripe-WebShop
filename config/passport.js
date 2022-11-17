const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcrypt')

module.exports = (passport) => {
  passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({ username }, (error, user) => {
      if (error) { console.log(error) }

      if (!user) {
        return done(null, false, { message: 'No user found!' })
      }

      bcrypt.compare(password, user.password, (error, isMatch) => {
        if (error) { console.log(error) }

        if (isMatch) {
          return done(null, user)
        } else {
          return done(null, false, { message: 'Wrong password.' })
        }
      })
    })
  }))

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (error, user) => {
      done(error, user)
    })
  })
}
