const express = require('express')
const router = express.Router()

const authController = require("../controllers/authController")
const userController = require("../controllers/userController")
const adsController = require("../controllers/adsController")

router.get('/ping', (req, res)=> {
    res.json({pong: true})
})

router.get('/states', userController.getStates)

router.post('/user/signin', authController.signin)
router.post('/user/signup', authController.signup)

router.get('/user/me', userController.info)
router.put('/user/me', userController.editInfo)

router.get('/categories', adsController.getCategories)

router.post('/ad/add', adsController.addAction)
router.get('/ad/list', adsController.getList)
router.get('/ad/item', adsController.getItem) 
router.post('ad/:id', adsController.editAction)

module.exports = router