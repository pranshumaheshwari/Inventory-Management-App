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

app.get('/manualUpdate', async (req: Request, res: Response) => {
    const args: Prisma.FgManualUpdateLogFindManyArgs = {}
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
    const data = await PrismaService.fgManualUpdateLog.findMany(args)
    res.json(data)
})

app.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    const args: Prisma.FgFindUniqueArgs = {
        where: {
            id,
        },
    }
    const { select, include } = req.query
    if (select) {
        args.select = JSON.parse(select as string)
    }
    if (include) {
        args.include = JSON.parse(include as string)
    }
    const data = await prisma.findUnique({
        ...args,
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

app.put('/:id/stock', async (req: Request, res: Response) => {
    const { storeStock, price, oqcPendingStock } = req.body

    const { id } = req.params

    try {
        const resp = await PrismaService.$transaction(async (tq) => {
            const data = await tq.fg.findUniqueOrThrow({
                where: {
                    id,
                },
                select: {
                    storeStock: true,
                    oqcPendingStock: true,
                },
            })
            await tq.fgManualUpdateLog.create({
                data: {
                    user: req.user ? req.user.username : '',
                    fgId: id,
                    ...(storeStock
                        ? {
                              storeStock:
                                  data.storeStock - parseFloat(storeStock),
                          }
                        : {}),
                    ...(oqcPendingStock
                        ? {
                              oqcPendingStock:
                                  data.oqcPendingStock -
                                  parseFloat(oqcPendingStock),
                          }
                        : {}),
                },
            })
            return await tq.fg.update({
                where: {
                    id,
                },
                data: {
                    ...(storeStock
                        ? {
                              storeStock: parseFloat(storeStock),
                          }
                        : {}),
                    ...(oqcPendingStock
                        ? {
                              oqcPendingStock: parseFloat(oqcPendingStock),
                          }
                        : {}),
                    ...(price
                        ? {
                              price: parseFloat(price),
                          }
                        : {}),
                },
            })
        })

        res.json(resp)
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
