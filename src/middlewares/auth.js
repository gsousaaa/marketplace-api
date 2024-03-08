const User = require('../models/User')

module.exports = {
    private: async (req, res, next) => {
       // Verificando se o token é enviado no body ou na query
        if(!req.query.token && !req.body.token) {
            res.json({notAllowed: true})
            return
        }

        // Preenchendo a variavel token
        let token = ''
        if(req.body.token) {
            token = req.body.token
        }

        if(req.query.token) {
            token = req.query.token
        }

        // Verificando se o token é vazio
        if(token == '') {
            res.json({notAllowerd: true})
            return
        }

        // verificando se o token é válido
        const user =  await User.findOne({token})

        if(!user) {
            res.json({notAllowed: true})
            return
        }

        next()
    }
} 

