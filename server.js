// importing  all the stuff that will be needed
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js' 

// app config
const app = express()
const port = process.env.PORT || 9000

// middleware
app.use(express.json())

// DB config
const connection_uri = 'mongodb+srv://Alloh:BygQeTkhX9IjOsW4@cluster0.lyyu1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(connection_uri)

// ????

// api routes
app.get('/', (req, res) => res.status(200).send('hello world'))

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if (err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if (err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

//listen
app.listen(port, () => console.log(`listening on localhost:${port}`))



