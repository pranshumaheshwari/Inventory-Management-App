import express, { Request, Response, Router } from 'express'
import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.customer


app.get('/', async (req: Request, res: Response) => {
    const data = await prisma.findMany()
    res.json(data)
})

app.post('/', async (req: Request, res: Response) => {
    const {
        id,
        name,
        address1,
        address2,
        city,
        state,
        gst,
    } = req.body

    try {
        const result = await prisma.create({
            data: {
                id,
                name,
                address1,
                address2,
                city,
                state,
                gst,
            }
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

app.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    const data = await prisma.findUnique({
        where: {
            id
        }
    })
    res.json(data)
})

app.put('/:id', async (req: Request, res: Response) => {
    const {
        name,
        address1,
        address2,
        city,
        state,
        gst,
    } = req.body

    const { id } = req.params

    try {
        const result = await prisma.update({
            where: {
                id,
            },
            data: {
                id,
                name,
                address1,
                address2,
                city,
                state,
                gst,
            }
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

app.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const result = await prisma.delete({
            where: {
                id
            }
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

export default app