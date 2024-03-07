import express, { Request, Response, Router } from 'express'

import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.requisition

app.get('/', async (req: Request, res: Response) => {
    const args: Prisma.RequisitionFindManyArgs = {}
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
    const args: Prisma.RequisitionDetailsFindManyArgs = {}
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
    const data = await PrismaService.requisitionDetails.findMany(args)
    res.json(data)
})

app.get('/issue', async (req: Request, res: Response) => {
    const args: Prisma.RequisitionOutwardFindManyArgs = {}
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
    const data = await PrismaService.requisitionOutward.findMany(args)
    res.json(data)
})

app.post('/', async (req: Request, res: Response) => {
    const { quantity, fgId, soId, createdAt } = req.body

    try {
        const bom = await PrismaService.fg
            .findUniqueOrThrow({
                where: {
                    id: fgId,
                },
                select: {
                    bom: true,
                },
            })
            .then((fg) => fg?.bom)
        const result = await prisma.create({
            data: {
                quantity,
                fgId,
                soId,
                user: req.user ? req.user.username : '',
                createdAt,
                details: {
                    createMany: {
                        data: bom?.map((rm) => ({
                            rmId: rm.rmId,
                            quantity: quantity * rm.quantity,
                            user: req.user ? req.user.username : '',
                        })),
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

app.post('/issueMany', async (req: Request, res: Response) => {
    const { details }: {
        details: {
            rmId: string
            quantity: number
            requisitionId: number
        }[]
    } = req.body
    // TODO: Test this
    try {
        const excessOnLine = await Promise.all(details.filter(({requisitionId}) => requisitionId === 0).map(async ({rmId}) => {
            return await PrismaService.requisitionExcessOnLine.findUnique({
                where: {
                    rmId
                },
                select: {
                    rmId: true,
                    quantity: true
                }
            })
        }))
        const result = await PrismaService.$transaction([
            ...details.map(
                ({
                    rmId,
                    quantity,
                    requisitionId,
                }) =>
                    requisitionId === 0
                        ? PrismaService.requisitionExcessOnLine.upsert({
                              where: {
                                  rmId,
                              },
                              update: {
                                  quantity,
                              },
                              create: {
                                  rmId,
                                  quantity,
                              },
                          })
                        : PrismaService.requisitionOutward.create({
                              data: {
                                  rmId,
                                  quantity,
                                  user: req.user ? req.user.username : '',
                                  requisitionId,
                              },
                          })
            ),
            ...excessOnLine.map((rm) => PrismaService.rm.update({
                where: {
                    id: rm?.rmId
                },
                data: {
                    storeStock: {
                        increment: rm?.quantity
                    },
                    lineStock: {
                        decrement: rm?.quantity
                    }
                }
            })),
            ...details.map(
                ({ rmId, quantity }) =>
                    PrismaService.rm.update({
                        where: {
                            id: rmId,
                        },
                        data: {
                            lineStock: {
                                increment: quantity,
                            },
                            storeStock: {
                                decrement: quantity,
                            },
                        },
                    })
            ),
        ])

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
            id: parseInt(id),
        },
    })
    res.json(data)
})

app.get('/issue/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    const data = await PrismaService.requisitionOutward.findUnique({
        where: {
            id: parseInt(id),
        },
    })
    res.json(data)
})

app.put('/:id', async (req: Request, res: Response) => {
    const { quantity, fgId, soId } = req.body

    const { id } = req.params

    try {
        const result = await prisma.update({
            where: {
                id: parseInt(id),
            },
            data: {
                quantity,
                fgId,
                soId,
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
                id: parseInt(id),
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
