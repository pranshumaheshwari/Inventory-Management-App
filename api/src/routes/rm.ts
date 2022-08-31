import express, { Request, Response, Router } from 'express'
import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.rm


app.get('/', async (req: Request, res: Response) => {
    const data = await prisma.findMany()
    res.json(data)
})

app.post('/', async (req: Request, res: Response) => {
    const {
        id,
        description,
        dtplCode,
        supplierId,
        category,
        unit,
        price,
        storeStock,
        lineStock
    } = req.body

    try {
        const result = await prisma.create({
            data: {
                id,
                description,
                dtplCode,
                supplierId,
                category,
                unit,
                price,
                storeStock,
                lineStock
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
        description,
        dtplCode,
        supplierId,
        category,
        unit,
        price,
        storeStock,
        lineStock
    } = req.body

    const { id } = req.params

    try {
        const result = await prisma.update({
            where: {
                id,
            },
            data: {
                description,
                dtplCode,
                supplierId,
                category,
                unit,
                price,
                storeStock,
                lineStock
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
        res.json({
            status: 500,
            message: (e as Error).message
        })
    }
})

export default app