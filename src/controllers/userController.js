const State = require('../models/State')
const User = require('../models/User')
const Ad = require('../models/Ad')
const Category = require('../models/Category')


module.exports = {
    getStates: async (req, res) => {
        let states = await State.find()
        res.json({ states })
    },

    info: async (req, res) => {
        let token = req.body.token

        const user = await User.findOne({ token })
        const state = await State.findById(user.state)
        const ads = await Ad.find({id_user: user._id.toString()})
        
        let adList = []
        for(let i in ads) {
            const cat = await Category.findById(ads[i].category)

            adList.push({
                id: ads[i]._id,
                status: ads[i].status,
                images: ads[i].images,
                dateCreated: ads[i].dateCreated,
                title: ads[i].title,
                price: ads[i].price,
                priceNegotiable: ads[i].priceNegotiable,
                views: ads[i].views,
                category: cat.slug
            })
        }

        res.json({
            name: user.name,
            email: user.email,
            state: state.name,
            ads: adList
        })
    },

    editInfo: async (req, res) => {

    }, 
}

