import express, { Request, Response, Router } from 'express'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.fg


app.get('/', async (req: Request, res: Response) => {
    const data = await prisma.findMany()
    res.json(data)
})

app.post('/', async (req: Request, res: Response) => {
    const {
        id,
        description,
        customerId,
        category,
        manPower,
        price,
        storeStock,
        overheads,
        bom
    } = req.body

    const BOM = bom?.map((rm: Prisma.BomUncheckedCreateInput) => {
        return {
            RMId: rm.rmId,
            quantity: rm.quantity
        }
    })

    try {
        const result = await prisma.create({
            data: {
                id,
                description,
                customerId,
                category,
                manPower,
                price,
                storeStock,
                overheads,
                bom: {
                    create: BOM
                }
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

app.get('/:id/bom', async (req: Request, res: Response) => {
    const { id } = req.params
    const data = await prisma.findUnique({
        where: {
            id
        },
        include: {
            bom: true
        }
    })
    res.json(data)
})

app.put('/:id', async (req: Request, res: Response) => {
    const {
        description,
        customerId,
        category,
        manPower,
        price,
        storeStock,
        overheads,
        bom
    } = req.body

    const { id } = req.params
    const BOM = bom?.map((rm: Prisma.BomUncheckedCreateInput) => {
        return {
            RMId: rm.rmId,
            quantity: rm.quantity
        }
    })

    try {
        const result = await prisma.update({
            where: {
                id,
            },
            data: {
                description,
                customerId,
                category,
                manPower,
                price,
                storeStock,
                overheads,
                bom: {
                    upsert : bom
                }
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
            },
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