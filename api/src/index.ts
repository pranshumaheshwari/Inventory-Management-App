import {
    Attendance,
    Customer,
    Fg,
    Invoice,
    Inwards,
    Login,
    Outwards,
    Po,
    Requisition,
    Rm,
    So,
    Supplier,
    Users,
} from './routes'
import express, { Express } from 'express'

import { AuthService } from './service'
import bodyParser from 'body-parser'
import cookierParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import https from 'https'
import morganBody from 'morgan-body'
import path from 'path'

dotenv.config()

const app: Express = express()
const port = process.env.PORT

const log = fs.createWriteStream(
    path.join(__dirname, "logs", "express.log"), { flags: "a" }
  );
  

app.use(express.json())
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
)
app.use(cookierParser())
app.use(bodyParser.urlencoded({ extended: true }))
morganBody(app, {
    timezone: "Asia/Kolkata"
})
morganBody(app, {
    stream: log,
    noColors: true
})

app.use('/attendance', AuthService, Attendance)
app.use('/customers', AuthService, Customer)
app.use('/finishedgoods', AuthService, Fg)
app.use('/inwards', AuthService, Inwards)
app.use('/', Login)
app.use('/outwards', AuthService, Outwards)
app.use('/purchaseorders', AuthService, Po)
app.use('/requisition', AuthService, Requisition)
app.use('/invoice', AuthService, Invoice)
app.use('/rawmaterial', AuthService, Rm)
app.use('/salesorders', AuthService, So)
app.use('/suppliers', AuthService, Supplier)
app.use('/users', AuthService, Users)

if (process.env.KEY && process.env.CERT) {
    let credentials = {
        key: fs.readFileSync(process.env.KEY, 'utf-8'),
        cert: fs.readFileSync(process.env.CERT, 'utf-8'),
    }
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
    let httpsServer = https.createServer(credentials, app)
    httpsServer.listen(port)
} else {
    app.listen(port, () => {
        console.log(
            `⚡️[server]: Server is running at https://localhost:${port}`
        )
    })
}
