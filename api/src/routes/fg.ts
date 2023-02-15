import express, { Request, Response, Router } from 'express'

import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.fg

app.get('/', async (req: Request, res: Response) => {
    const args: Prisma.FgFindManyArgs = {}
    const { select, include, where, distinct } = req.query
    if (select) {
        args.select = JSON.parse(select as string)
    }
    if (include) {
        args.include = JSON.parse(include as string)
    }
    if (where) {
        args.where = JSON.parse(where as string)
    }
    if (distinct) {
        args.distinct = JSON.parse(distinct as string)
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
        bom,
    } = req.body

    const BOM = bom?.map((rm: Prisma.BomUncheckedCreateInput) => {
        return {
            rmId: rm.rmId,
            quantity: rm.quantity,
        }
    })

    try {
        const result = await prisma.create({
            data: {
                id,
                description,
                customer: {
                    connect: {
                        id: customerId,
                    },
                },
                category,
                manPower,
                price,
                storeStock,
                overheads,
                bom: {
                    create: BOM,
                },
            },
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message,
        })
    }
})

app.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    const data = await prisma.findUnique({
        where: {
            id,
        },
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
        bom,
    } = req.body

    const { id } = req.params
    const BOM = bom?.map(
        (
            b: Prisma.BomUncheckedCreateInput
        ): Prisma.BomUpsertWithWhereUniqueWithoutFgInput => {
            return {
                where: {
                    fgId_rmId: {
                        fgId: id,
                        rmId: b.rmId,
                    },
                },
                update: {
                    quantity: b.quantity,
                },
                create: {
                    quantity: b.quantity,
                    rmId: b.rmId,
                },
            }
        }
    )

    try {
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
                    upsert: BOM,
                },
            },
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message,
        })
    }
})

app.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const result = await prisma.delete({
            where: {
                id,
            },
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message,
        })
    }
})

app.delete('/:fgId/:rmId', async (req: Request, res: Response) => {
    const { fgId, rmId } = req.params
    try {
        const result = await PrismaService.bom.delete({
            where: {
                fgId_rmId: {
                    rmId,
                    fgId,
                },
            },
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message,
        })
    }
})

export default app
