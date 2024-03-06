const express = require("express")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const cors = require("cors")
const fileUpload = require("express-fileupload")

const apiRoutes = require('./src/routes/apiRoutes')

dotenv.config()

mongoose.connect(process.env.DATABASE)
mongoose.Promise = global.Promise
mongoose.connection.on('error', (error) => {
    console.log(`erro: ${error.message}`)
})

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(fileUpload())

app.use(express.static(__dirname+'/public'))

app.use('/', apiRoutes)

app.listen(process.env.PORT, () => {
    console.log(`Server rodando no endereco ${process.env.BASE}`)
})

