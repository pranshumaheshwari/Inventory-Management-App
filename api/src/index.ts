import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookierParser from 'cookie-parser'
import bodyParser from 'body-parser'
import { AuthService } from './service'
import { Attendance, Customer, Fg, Login, Po, Rm, So, Supplier, Users } from './routes'

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
app.use('/customer', AuthService, Customer)
app.use('/finishedgoods', AuthService, Fg)
app.use('/', Login)
app.use('/po', AuthService, Po)
app.use('/rawmaterial', AuthService, Rm)
app.use('/so', AuthService, So)
app.use('/supplier', AuthService, Supplier)
app.use('/users', AuthService, Users)

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})