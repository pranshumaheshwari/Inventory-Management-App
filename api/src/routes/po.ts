import express, { Request, Response, Router } from 'express'

import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.po


app.get('/', async (req: Request, res: Response) => {
    const args: Prisma.PoFindManyArgs = {}
    const { select, include, where } = req.query
    if (select) {
        args.select = JSON.parse(select as string)
    }
    if (include) {
        args.include = JSON.parse(include as string)
    }
    if (where) {
        args.where = JSON.parse(where as string)
    }
    const data = await prisma.findMany(args)
    res.json(data)
})

app.post('/', async (req: Request, res: Response) => {
    const {
        id,
        supplierId,
        status,
        poDetails
    } = req.body

    const details = poDetails.map((rm: Prisma.PoDetailsUncheckedCreateInput) => {
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
                    create: details
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
        id: updatedId,
        supplierId,
        status,
        poDetails
    } = req.body

    const { id } = req.params

    const details = poDetails.map((rm: Prisma.PoDetailsUncheckedCreateInput) => {
        return {
            rmId: rm.rmId,
            quantity: rm.quantity
        }
    })

    const currentDetails = await PrismaService.poDetails.findMany({
        where: {
            poId: id
        }
    })

    try {
        const del = await PrismaService.poDetails.deleteMany({
            where: {
                poId: id
            }
        })
        const result = await prisma.update({
            where: {
                id,
            },
            data: {
                id: updatedId,
                supplierId,
                status,
                poDetails: {
                    create: details
                }
            }
        })
        res.json(result)
    } catch (e) {
        const recreate = await PrismaService.poDetails.createMany({
            data: currentDetails
        })
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