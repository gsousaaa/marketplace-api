const express = require('express')
const router = express.Router()

const Auth = require('../middlewares/auth')

const authController = require("../controllers/authController")
const userController = require("../controllers/userController")
const adsController = require("../controllers/adsController")
const authValidator = require("../validators/authValidator")

router.get('/ping', (req, res)=> {
    res.json({pong: true})
})

router.get('/states', userController.getStates)

router.post('/user/signin', authValidator.signin, authController.signin)
router.post('/user/signup', authValidator.signup, authController.signup)

router.get('/user/me', Auth.private, userController.info)
router.put('/user/me', Auth.private, userController.editInfo)

router.get('/categories', adsController.getCategories)

router.post('/ad/add', Auth.private, adsController.addAction)
router.get('/ad/list', adsController.getList)
router.get('/ad/item', adsController.getItem) 
router.post('ad/:id', Auth.private, adsController.editAction)

module.exports = router

