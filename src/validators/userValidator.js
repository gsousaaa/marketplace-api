const { checkSchema } = require('express-validator')

module.exports = {
    editInfo: checkSchema({
        token: {
            notEmpty: true
        },
        name: {
            optional: true,
            trim: true,
            notEmpty: true,
            isLength: {
                options: { min: 2 }
            },
            errorMessage: 'Nome precisa ter no mínimo 2 caraacteres'
        },
        email: {
            optional: true,
            notEmpty: true,
            isEmail: true,
            normalizeEmail: true, 
            errorMessage: 'Email inválido.'
        },
        password: {
            optional: true,
            isLength: {
                options: { min: 5 }
            },
            errorMessage: 'A senha deve ter pelo menos 5 caracteres'
        },
        state: {
            optional: true,
            notEmpty: true,
            errorMessage: 'Estado não preenchido'
        }

    })
}

