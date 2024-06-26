import express, { Request, Response, Router } from 'express'

import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.po

app.get('/', async (req: Request, res: Response) => {
    const args: Prisma.PoFindManyArgs = {}
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

app.get('/details', async (req: Request, res: Response) => {
    const args: Prisma.PoDetailsFindManyArgs = {}
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
    const data = await PrismaService.poDetails.findMany(args)
    res.json(data)
})

app.post('/', async (req: Request, res: Response) => {
    const { supplierId, id, poDetails, status } = req.body

    try {
        const result = await prisma.create({
            data: {
                user: req.user ? req.user.username : '',
                supplierId,
                id,
                status,
                poDetails: {
                    createMany: {
                        data: poDetails,
                    },
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

app.post('/details', async (req: Request, res: Response) => {
    const { supplierId, rmId, quantity, poId, price } = req.body
    try {
        const result = await PrismaService.poDetails.create({
            data: {
                price: parseFloat(price),
                quantity: parseFloat(quantity),
                po: {
                    connectOrCreate: {
                        where: {
                            id: poId,
                        },
                        create: {
                            id: poId,
                            supplierId,
                            user: req.user ? req.user.username : '',
                        },
                    },
                },
                rm: {
                    connect: {
                        id: rmId,
                    },
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

app.put('/', async (req: Request, res: Response) => {
    const { supplierId, id, poDetails, status } = req.body

    try {
        const result = await prisma.update({
            where: {
                id,
            },
            data: {
                id,
                supplierId,
                status,
                poDetails: {
                    updateMany: await poDetails.map(
                        ({
                            rmId,
                            quantity,
                            price,
                        }: {
                            rmId: string
                            quantity: number
                            price: number
                        }) => {
                            return {
                                where: {
                                    poId: id,
                                    rmId,
                                },
                                data: {
                                    quantity,
                                    price,
                                },
                            }
                        }
                    ),
                    createMany: {
                        data: poDetails,
                        skipDuplicates: true,
                    },
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

app.delete('/', async (req: Request, res: Response) => {
    const { id } = req.body
    try {
        const result = await PrismaService.$transaction(async (tq) => {
            await tq.poDetails.deleteMany({
                where: {
                    poId: id,
                },
            })
            return tq.po.delete({
                where: {
                    id: id as string,
                },
            })
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message,
        })
    }
})

app.delete('/details', async (req: Request, res: Response) => {
    const { poId, rmId } = req.body
    try {
        const result = await PrismaService.poDetails.delete({
            where: {
                poId_rmId: {
                    poId: poId as string,
                    rmId: rmId as string,
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
