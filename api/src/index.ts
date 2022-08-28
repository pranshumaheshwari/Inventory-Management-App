import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import Supplier from './supplier'
import Customer from './customer'
import Rm from './rm'
import Fg from './fg'
import Po from './po'
import Attendance from './attendance'
import Users from './user'
import So from './so'

dotenv.config()

const app: Express = express()
const port = process.env.PORT

app.use(express.json())
app.use('/attendance', Attendance)
app.use('/customer', Customer)
app.use('/fg', Fg)
app.use('/po', Po)
app.use('/rm', Rm)
app.use('/so', So)
app.use('/supplier', Supplier)
app.use('/users', Users)

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})