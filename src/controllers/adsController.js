const { v4: uuid } = require('uuid')
const jimp = require('jimp')
const ObjectId = require('mongoose').Types.ObjectId;

const Category = require('../models/Category')
const User = require('../models/User')
const Ad = require('../models/Ad')
const State = require('../models/State')

const addImage = async (buffer) => {
    let newName = `${uuid()}.jpg`
    let tmpImg = await jimp.read(buffer)
    tmpImg.cover(500, 500).quality(80).write(`./public/media/${newName}`)
    return newName
}

const isValidObjectId = (id) => {
    if (ObjectId.isValid(id)) {
        if ((new ObjectId(id).toString()) === id) {
            return true;
        }
        return false;
    }
    return false;
}

module.exports = {
    getCategories: async (req, res) => {
        const cats = await Category.find()

        let categories = []

        for (let i in cats) {
            categories.push({
                ...cats[i]._doc,
                img: `${process.env.BASE}/assets/images/${cats[i].slug}.png`
            })
        }

        res.json({ categories })
    },

    addAction: async (req, res) => {
        let { title, price, priceneg, desc, cat, token } = req.body
        const user = await User.findOne({ token }).exec()

        if (!title || !cat) {
            res.json({ error: 'Título e/ou categoria não foram preenchidos' })
            return
        }

        const category = await Category.findById(cat)
        if (category.length < 12) {
            res.json({ error: 'id da categoria inválido' })
            return
        }

        if (!category) {
            res.json({ Error: 'categoria inexistente' })
            return
        }

        if (price) {
            //Tratando o valor de price para inserir no banco de dados
            price = price.replace('.', '').replace(',', '.').replace('R$ ', '')
            price = parseFloat(price)
        } else {
            price = 0
        }

        const newAd = new Ad()
        newAd.id_user = user._id
        newAd.state = user.state
        newAd.dateCreated = new Date()
        newAd.category = cat
        newAd.title = title
        newAd.price = price
        newAd.priceNegotiable = (priceneg == 'true') ? true : false
        newAd.description = desc
        newAd.status = true
        newAd.views = 0

        if (req.files && req.files.img) {
            //verificando se foi enviada apenas uma imagem
            if (req.files.img.length == undefined) {
                if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img.mimetype)) {
                    let url = await addImage(req.files.img.data)
                    newAd.images.push({
                        url,
                        default: false
                    })
                } else {
                    for (let i = 0; i < req.files.img.length; i++) {
                        if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img[i].mimetype)) {
                            let url = await addImage(req.files.img[i].data)
                            newAd.images.push({
                                url,
                                default: false
                            })
                        }
                    }
                }
            }
        }

        if (newAd.images.length > 0) {
            newAd.images[0].default = true
        }


        const info = await newAd.save()
        res.json({ id: info._id })


    },

    getList: async (req, res) => {
        let { sort = 'asc', offset = 0, limit = 8, q, cat, state } = req.query
        let filters = { status: true }
        let total = 0

        //filtro de pesquisa
        if (q) {
            filters.title = { '$regex': q, '$options': 'i' }
        }
        //filtro por categoria
        if (cat) {
            const c = await Category.findOne({ slug: cat }).exec()
            if (c) {
                let idToString = c._id.toString()
                filters.category = idToString
            }
        }
        //filtro por estado
        if (state) {
            const stateName = state.toUpperCase()
            const s = await State.findOne({ name: stateName }).exec()
            if (s) {
                let idToString = s._id.toString()
                filters.state = idToString
            }
        }

        let adsTotal = await Ad.find(filters).exec()
        total = adsTotal.length

        const adsData = await Ad.find(filters)
            .sort({ dateCreated: (sort == 'desc' ? -1 : 1) })
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .exec()
        let ads = []

        for (let i in adsData) {
            let image
            let defaultImage = adsData[i].images.find(e => e.default)
            if (defaultImage) {
                image = `${process.env.BASE}/media/${defaultImage.url}`
            } else {
                image = `${process.env.BASE}/media/default.jpg`
            }

            ads.push({
                id: adsData[i]._id,
                title: adsData[i].title,
                price: adsData[i].price,
                priceNegotiable: adsData[i].priceNegotiable,
                image
            })
        }

        res.json({ ads, total })
    },

    getItem: async (req, res) => {
        let { id, other = null } = req.query

        if (!id) {
            res.json({ error: 'Sem anuncio' })
            return
        }

        if (!isValidObjectId(id)) {
            res.json({ error: 'Id inválido' })
            return
        }

        const ad = await Ad.findById(id).exec()
        if (!ad) {
            res.json({ error: 'Anúncio inexistente' })
            return
        }

        ad.views++
        await ad.save()

        let images = []
        for (let i in ad.images) {
            images.push(`${process.env.BASE}/media/${ad.images[i].url}`)
        }

        let category = await Category.findById(ad.category).exec()
        let userInfo = await User.findById(ad.id_user).exec()
        let stateInfo = await State.findById(ad.state).exec()

        let others = []
        if (other) {
            const otherData = await Ad.find({ status: true, id_user: ad.id_user }).exec()

            for (let i in otherData) {
                let otherIdString = otherData[i]._id.toString()
                let adIdString = ad._id.toString()

                if (otherIdString != adIdString) {

                    let image = `${process.env.BASE}/media/default.jpg`

                    let defaultImg = otherData[i].images.find(e => e.default)
                    if (defaultImg) {
                        image = `${process.env.BASE}/media/${defaultImg.url}`
                    }

                    others.push({
                        id: otherData[i]._id,
                        title: otherData[i].title,
                        price: otherData[i].price,
                        priceNegotiable: otherData[i].priceNegotiable,
                        image
                    })
                }
            }
        }

        res.json({
            id: ad._id,
            title: ad.title,
            price: ad.price,
            priceNegotiable: ad.priceNegotiable,
            description: ad.description,
            dateCreated: ad.dateCreated,
            views: ad.views,
            images,
            category,
            userInfo: {
                name: userInfo.name,
                email: userInfo.email
            },
            stateName: stateInfo.name,
            others
        })
    },

    editAction: async (req, res) => {
        let { id } = req.params
        let { title, status, price, priceneg, desc, cat, img, token } = req.body

        if (!id) {
            res.json({ error: 'Sem anuncio' })
            return
        }

        if (!isValidObjectId(id)) {
            res.json({ error: 'Id inválido' })
            return
        }

        const ad = await Ad.findById(id).exec()

        if (!ad) {
            res.json({ error: 'Anúncio inexistente' })
            return
        }

        const user = await User.findOne({ token }).exec()
        let userIdString = user._id.toString()
        let adIdUserString = ad.id_user.toString()

        if (userIdString !== adIdUserString) {
            res.json({ error: 'Esse anúncio não é seu' })
            return
        }

        let updates = {}

        if (title) {
            updates.title = title
        }
        if (price) {
            //Tratando o valor de price para inserir no banco de dados
            price = price.replace('.', '').replace(',', '.').replace('R$ ', '')
            price = parseFloat(price)
            updates.price = price
        }
        if (priceneg) {
            updates.priceNegotiable = priceneg
        }
        if (status) {
            updates.status = status
        }
        if (desc) {
            updates.description = desc
        }
        if (cat) {
            const category = await Category.findOne({ slug: cat }).exec()
            if (!category) {
                res.json({ error: 'Categoria não encontrada' })
                return
            }
            let idCategoryString = category._id.toString()
            updates.category = idCategoryString
        }

        if(img) {
            updates.images = img
        }

        await Ad.findByIdAndUpdate(id, {$set: updates})

       //Adicionando nova imagem
       const product = await Ad.findById(id).exec();        
       let imagesUpdates = product.images;

       if (req.files && req.files.img) {
            if (req.files.img.length == undefined) {
                 if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img.mimetype)) {
                      let url = await addImage(req.files.img.data);
                      imagesUpdates.push({
                      url,
                      default: false
                      });
                 }
            } else {
                 for (let i = 0; i < req.files.img.length; i++) {
                      if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img[i].mimetype)) {
                           let url = await addImage(req.files.img[i].data);
                                 imagesUpdates.push({
                                url,
                                default: false
                           })
                           };
                      }
                 }
                 console.log(imagesUpdates);
                 await Ad.findByIdAndUpdate(id, {$set: { images: imagesUpdates }});
                
            }
        res.json({message: 'Anúncio editado'})
    }
}

