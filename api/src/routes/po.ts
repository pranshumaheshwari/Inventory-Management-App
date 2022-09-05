import express, { Request, Response, Router } from 'express'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.po


app.get('/', async (req: Request, res: Response) => {
    const data = await prisma.findMany()
    res.json(data)
})

app.post('/', async (req: Request, res: Response) => {
    const {
        id,
        supplierId,
        status,
        details
    } = req.body

    const poDetails = details.map((rm: Prisma.PoDetailsUncheckedCreateInput) => {
        return {
            rmId: rm.rmId,
            quantity: rm.quantity
        }
    })

    try {
        const result = await prisma.create({
            data: {
                id,
                supplierId,
                status,
                poDetails: {
                    create: poDetails
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
        supplierId,
        status,
        details
    } = req.body

    const { id } = req.params

    const poDetails = details.map((rm: Prisma.PoDetailsUncheckedCreateInput) => {
        return {
            rmId: rm.rmId,
            quantity: rm.quantity
        }
    })

    try {
        const result = await prisma.update({
            where: {
                id,
            },
            data: {
                supplierId,
                status,
                poDetails: {
                    upsert: poDetails
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