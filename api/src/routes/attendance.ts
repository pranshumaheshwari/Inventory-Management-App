import express, { Request, Response, Router } from 'express'
import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.attendance


app.get('/', async (req: Request, res: Response) => {
    const data = await prisma.findMany()
    res.json(data)
})

app.post('/', async (req: Request, res: Response) => {
    const {
        number,
        date,
    } = req.body

    try {
        const result = await prisma.create({
            data: {
                number,
                date,
            }
        })
        res.json(result)
    } catch (e) {
        res.json({
            status: 500,
            message: (e as Error).message
        })
    }
})

app.get('/:date', async (req: Request, res: Response) => {
    const { date } = req.params
    const data = await prisma.findUnique({
        where: {
            date
        }
    })
    res.json(data)
})

app.put('/:date', async (req: Request, res: Response) => {
    const {
        number
    } = req.body

    const { date } = req.params

    try {
        const result = await prisma.update({
            where: {
                date,
            },
            data: {
                number
            }
        })
        res.json(result)
    } catch (e) {
        res.json({
            status: 500,
            message: (e as Error).message
        })
    }
})

app.delete('/:date', async (req: Request, res: Response) => {
    const { date } = req.params
    try {
        const result = await prisma.delete({
            where: {
                date
            }
        })
        res.json(result)
    } catch (e) {
        res.json({
            status: 500,
            message: (e as Error).message
        })
    }
})

export default app