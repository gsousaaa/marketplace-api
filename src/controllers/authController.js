const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { validationResult, matchedData } = require('express-validator')
const User = require('../models/User')
const State = require('../models/State')

module.exports = {
    signin: async (req, res) => {

    },

    signup: async (req, res) => {
        const errors = validationResult(req)
        // Verificando se errors não está vazio
        if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() })
            return
        }
        const data = matchedData(req)

        // Verificando se o e-mail já existe
        const user = await User.findOne({
            email: data.email
        })
        if (user) {
            res.json({
                error: {
                    email: {
                        msg: 'E-mail já cadastrado'
                    }
                }
            })
            return
        }

        //Verificando se o estado existe
        if (mongoose.Types.ObjectId.isValid(data.state)) {
            const stateItem = await State.findById(data.state)
            if (!stateItem) {
                res.json({
                    error: {
                        state: { msg: 'Estado náo existe' }
                    }
                })
                return
            }
        } else {
            res.json({ state: { msg: 'Codigo de estado invalido' } })
            return
        }

        const passwordHash = await bcrypt.hash(data.password, 10)
        //criando um token aleatorio
        const payload = (Date.now() + Math.random()).toString()
        const token = await bcrypt.hash(payload, 10)

        // Criando o usuário
        const newUser = new User({
            name: data.name,
            email: data.email,
            passwordHash: passwordHash,
            token,
            state: data.state
        })

        await newUser.save()

        res.status(201).json({ token })
    }
}

