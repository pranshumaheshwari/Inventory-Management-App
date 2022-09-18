import { Attendance, Customer, Fg, Inwards, Login, Po, Rm, So, Supplier, Users } from './routes'
import express, { Express, Request, Response } from 'express'

import { AuthService } from './service'
import bodyParser from 'body-parser'
import cookierParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app: Express = express()
const port = process.env.PORT

app.use(express.json())
app.use(cors({
  origin: ["http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))
app.use(cookierParser())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/attendance', AuthService, Attendance)
app.use('/customers', AuthService, Customer)
app.use('/finishedgoods', AuthService, Fg)
app.use('/inwards', AuthService, Inwards)
app.use('/', Login)
app.use('/purchaseorders', AuthService, Po)
app.use('/rawmaterial', AuthService, Rm)
app.use('/salesorders', AuthService, So)
app.use('/suppliers', AuthService, Supplier)
app.use('/users', AuthService, Users)

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})