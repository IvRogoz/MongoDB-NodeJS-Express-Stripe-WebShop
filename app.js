const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const config = require('./config/database')
const bodyParser = require('body-parser')
const session = require('express-session')
const fileUpload = require('express-fileupload')
const passport = require('passport')
const morgan = require('morgan')
const MongoStore = require('connect-mongo')
const fs = require('fs')
const { trimAndSantizeObject } = require('./config/global')
// Connect to db
mongoose.connect(config.database)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
const dbConnection = db.once('open', () => {
  console.log('Connected to MongoDB')
})
// init app
const app = express()

app.use(morgan('dev'))
// View engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Public folder
app.use(express.static(path.join(__dirname, 'public')))
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))

const Info = require('./models/info')
Info.find({}).sort({ sorting: 1 }).exec((error, info) => {
  console.log(info[0])
  info = info[0]
  if (error) console.log(error)
  app.locals.company = info.company
  app.locals.email = info.email
  app.locals.contact = info.contact
  app.locals.addressCountry = info.addressCountry
  app.locals.addressStreet = info.addressStreet
  app.locals.addressCity = info.addressCity
  app.locals.addressZip = info.addressZip
  app.locals.facebook = info.facebook
  app.locals.youtube = info.youtube
  app.locals.linkedin = info.linkedin
  app.locals.twitter = info.twitter
  app.locals.instagram = info.instagram
  app.locals.other = info.other
})

// set global vars
app.locals.errors = null
app.locals.currency = '\u20AC'

// Get Page Model
const Page = require('./models/page')

// Get all pages to pass to header.ejs
Page.find({}).sort({ sorting: 1 }).exec((error, pages) => {
  if (error) {
    console.log(error)
  } else {
    app.locals.pages = pages
  }
})

// Get Category Model
const Category = require('./models/category')

// Get all categories to pass to header.ejs
Category.find((error, categories) => {
  if (error) {
    console.log(error)
  } else {
    app.locals.categories = categories
  }
})

const Services = require('./models/services')
// Get all services to pass to header.ejs
Services.find((error, services) => {
  if (error) {
    console.log(error)
  } else {
    app.locals.services = services
  }
})

// Express fileupload middleware
app.use(fileUpload())

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// app.set('trust proxy', 1)
app.use(session({
  secret: 'w6qbqBVmNfEd3R62CDsKstiF4GVDRt9e',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }, // True only on shttp
  store: MongoStore.create(dbConnection)
}))

// express messages
app.use(require('connect-flash')())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// Passport Config
require('./config/passport')(passport)
// Passport Middleware
app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
  trimAndSantizeObject(req.body)
  return next()
})

app.use('/success', (req, res) => {
  console.log('HERE>>>>')
  console.log(req.session.cart)
  console.log('CART>>>')
  delete req.session.cart
  res.status(200)
  res.redirect('/')
})

app.get('*', (req, res, next) => {
  res.locals.cart = req.session.cart
  res.locals.user = req.user || null
  next()
})

// set routes
const pages = require('./routes/pages')
const products = require('./routes/products.js')
const cart = require('./routes/cart.js')
const users = require('./routes/users.js')
const adminPages = require('./routes/admin_pages')
const adminInfo = require('./routes/admin_info')
const adminCategories = require('./routes/admin_categories')
const adminServices = require('./routes/admin_services')
const adminProducts = require('./routes/admin_products')

app.use('/admin/pages', adminPages)
app.use('/admin/services', adminServices)
app.use('/admin/categories', adminCategories)
app.use('/admin/products', adminProducts)
app.use('/admin/info', adminInfo)
app.use('/products', products)
app.use('/cart', cart)
app.use('/users', users)

app.get('/get-images', (req, res) => {
  const images = getImagesFromDir(path.join(__dirname, '/public/page_images/'))
  const funcNum = req.query.CKEditorFuncNum
  res.render('gallery', { title: 'Node js – Auto Generate a Photo Gallery from a Directory', images, funcNum })
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
      allImages.push('/page_images/' + file) // push all .jpf and .png files to all images
    }
  })

  // return all images in array formate
  // console.log(allImages)
  return allImages
}

app.use('/', pages)

const port = 3000
app.listen(port, () => {
  console.log('Server started on port:' + port)
})
