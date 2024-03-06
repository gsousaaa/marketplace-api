const State = require('../models/State')


module.exports = {
    getStates: async (req, res) => {
        let states = await State.find()
        res.json({ states })
    },

    info: async (req, res) => {

    },

    editInfo: async (req, res) => {

    }, 
}

