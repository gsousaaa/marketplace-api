const mongoose = require("mongoose")
const { stringify } = require("uuid")
mongoose.Promise = global.Promise

const modelSchema =  new mongoose.Schema({
    name: String, 
    email: String,
    state: String,
    passwordHash: String, 
    token: String
})

const modelName = 'User'

if (mongoose.connection && mongoose.connections.models[modelName]) {
    module.exports = mongoose.connection.models[modelName]
} else {
    module.exports = mongoose.model(modelName, modelSchema)
}
