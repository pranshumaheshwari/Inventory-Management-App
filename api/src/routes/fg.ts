import express, { Request, Response, Router } from 'express'

import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.fg


app.get('/', async (req: Request, res: Response) => {
    const args: Prisma.FgFindManyArgs = {}
    const { select, include } = req.query
    if (select) {
        args.select = JSON.parse(select as string)
    }
    if (include) {
        args.include = JSON.parse(include as string)
    }
    const data = await prisma.findMany(args)
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
            rmId: rm.rmId,
            quantity: rm.quantity
        }
    })

    try {
        const result = await prisma.create({
            data: {
                id,
                description,
                customer: {
                    connect: {
                        id: customerId
                    }
                },
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
            rmId: rm.rmId,
            quantity: rm.quantity
        }
    })
    
    const currentBOM = await PrismaService.bom.findMany({
        where: {
            fgId: id
        }
    })
    try {
        const del = await PrismaService.bom.deleteMany({
            where: {
                fgId: id
            }
        })
        const result = await prisma.update({
            where: {
                id,
            },
            data: {
                id: updatedId,
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
        const recreate = await PrismaService.bom.createMany({
            data: currentBOM
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
            },
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

export default app