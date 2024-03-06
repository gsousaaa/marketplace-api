const { checkSchema } = require('express-validator')

module.exports = {
    signup: checkSchema({
        name: {
            trim: true,
            notEmpty: true,
            isLength: {
                options: {min: 2}
            },
            errorMessage: 'Nome precisa ter no mínimo 2 caraacteres'
        }, 
        email: {
            notEmpty: true,
            isEmail: true,
            normalizeEmail: true, 
            errorMessage: 'Email inválido.'
        }, 
        password: {
            isLength: {
                options: {min: 5}
            },
            errorMessage: 'A senha deve ter pelo menos 5 caracteres'
        },
        state: {
            notEmpty: true,
            errorMessage: 'Estado não preenchido'
        }

    })
}

