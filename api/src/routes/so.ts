import express, { Request, Response, Router } from 'express'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.so


app.get('/', async (req: Request, res: Response) => {
    const data = await prisma.findMany()
    res.json(data)
})

app.post('/', async (req: Request, res: Response) => {
    const {
        id,
        customerId,
        status,
        details
    } = req.body

    const soDetails = details.map((fg: Prisma.SoDetailsUncheckedCreateInput) => {
        return {
            fgId: fg.fgId,
            quantity: fg.quantity
        }
    })

    try {
        const result = await prisma.create({
            data: {
                id,
                customerId,
                status,
                soDetails: {
                    create: soDetails
                }
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
        customerId,
        status,
        details
    } = req.body

    const { id } = req.params

    const soDetails = details.map((fg: Prisma.SoDetailsUncheckedCreateInput) => {
        return {
            fgId: fg.fgId,
            quantity: fg.quantity
        }
    })

    try {
        const result = await prisma.update({
            where: {
                id,
            },
            data: {
                customerId,
                status,
                soDetails: {
                    upsert: soDetails
                }
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