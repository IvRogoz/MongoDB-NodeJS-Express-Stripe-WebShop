const express = require('express')
const router = express.Router()

const publishableKey = 'pk_test_51IagbrD7zAjPOphJIwaUqWsNECG9kPWd04mBPxgDT17YZOmYOd6HfVXzkAmRAcsSkkB9CPlknAp52GYVfOJYSKH300nF9aOXe5'
const secretKey = 'sk_test_51IagbrD7zAjPOphJ0qWSqupwB49wXzBYvyfgtZi7OEIBOvdz3Fy1k8lJTFT5PBOXmwt06i652BZUHNcSWef0ySKx00sGTTQD3W'

const stripe = require('stripe')(secretKey)

// Get Product model
const Product = require('../models/product')

/*
 * GET add product to cart
 */
router.get('/add/:product', (req, res) => {
  const slug = req.params.product

  Product.findOne({ slug }, (error, p) => {
    if (error) { console.log(error) }

    if (typeof req.session.cart === 'undefined') {
      req.session.cart = []
      req.session.cart.push({
        title: slug,
        qty: 1,
        price: parseFloat(p.price).toFixed(2),
        image: '/product_images/' + p._id + '/' + p.image
      })
    } else {
      const cart = req.session.cart
      let newItem = true

      for (let i = 0; i < cart.length; i++) {
        if (cart[i].title === slug) {
          cart[i].qty++
          newItem = false
          break
        }
      }

      if (newItem) {
        cart.push({
          title: slug,
          qty: 1,
          price: parseFloat(p.price).toFixed(2),
          image: '/product_images/' + p._id + '/' + p.image
        })
      }
    }

    //        console.log(req.session.cart);
    req.flash('success', 'Product added!')
    res.redirect('back')
  })
})

/*
 * GET checkout page
 */
router.get('/checkout', (req, res) => {
  if (req.session.cart && req.session.cart.length === 0) {
    delete req.session.cart
    res.redirect('/cart/checkout')
  } else {
    res.render('checkout', {
      title: 'Checkout',
      cart: req.session.cart,
      key: publishableKey
    })
  }
})

const YOUR_DOMAIN = 'http://localhost:3000'

router.post('/payment', async (req, res) => {
  const product = req.body
  console.log('Products:', product)
  console.log('Array>>>')

  const lineItems = []
  product.forEach(element => {
    const items = { price_data: { currency: '', product_data: { name: '', images: [] }, unit_amount_decimal: 0.0 }, quantity: 0 }
    items.price_data.currency = 'eur'
    items.price_data.product_data.name = element.Title
    items.price_data.product_data.images.push(element.Image)
    items.price_data.unit_amount_decimal = element.Price.substring(1) * 100
    items.quantity = element.Quantity
    lineItems.push(items)
  })
  console.log('Test>', lineItems)
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/success`,
    cancel_url: `${YOUR_DOMAIN}/failed.ejs`
  })

  res.json({ id: session.id })
})

/*
 * GET update product
 */
router.get('/update/:product', (req, res) => {
  const slug = req.params.product
  const cart = req.session.cart
  const action = req.query.action

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].title === slug) {
      switch (action) {
        case 'add':
          cart[i].qty++
          break
        case 'remove':
          cart[i].qty--
          if (cart[i].qty < 1) { cart.splice(i, 1) }
          break
        case 'clear':
          cart.splice(i, 1)
          if (cart.length === 0) { delete req.session.cart }
          break
        default:
          console.log('update problem')
          break
      }
      break
    }
  }

  req.flash('success', 'Cart updated!')
  res.redirect('/cart/checkout')
})

/*
 * GET clear cart
 */
router.get('/clear', (req, res) => {
  delete req.session.cart

  req.flash('success', 'Cart cleared!')
  res.redirect('/cart/checkout')
})

/*
 * GET buy now
 */
router.get('/buynow', (req, res) => {
  delete req.session.cart

  res.sendStatus(200)
})

// Exports
module.exports = router
