import express, { Request, Response, Router } from 'express'

import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()

app.get('/production', async (req: Request, res: Response) => {
    const args: Prisma.ProductionFindManyArgs = {}
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
    const data = await PrismaService.production.findMany(args)
    res.json(data)
})

app.get('/productionlog', async (req: Request, res: Response) => {
    const args: Prisma.ProductionLogFindManyArgs = {}
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
    const data = await PrismaService.productionLog.findMany(args)
    res.json(data)
})

app.post('/production', async (req: Request, res: Response) => {
    const { fgId, soId, quantity } = req.body

    try {
        const bom = await PrismaService.bom.findMany({
            where: {
                fgId,
            },
        })
        const result = await PrismaService.$transaction([
            PrismaService.production.create({
                data: {
                    soId,
                    fgId,
                    quantity,
                    user: req.user ? req.user.username : '',
                    productionLog: {
                        createMany: {
                            data: bom.map((bom) => ({
                                fgId,
                                rmId: bom.rmId,
                                quantity: bom.quantity * quantity,
                                user: req.user ? req.user.username : '',
                            })),
                        },
                    },
                },
            }),
            PrismaService.fg.update({
                where: {
                    id: fgId,
                },
                data: {
                    oqcPendingStock: {
                        increment: quantity,
                    },
                },
            }),
            ...bom.map((bom) => {
                return PrismaService.rm.update({
                    where: {
                        id: bom.rmId,
                    },
                    data: {
                        lineStock: {
                            decrement: quantity * bom.quantity,
                        },
                    },
                })
            }),
        ])

        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message,
        })
    }
})

app.delete('/production/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    try {
        const {fgId, quantity, status} = await PrismaService.production.findUniqueOrThrow({
            where: {
                id
            },
            select: {
                fgId: true,
                quantity: true,
                status: true
            }
        })
        if (status !== "PendingOqcVerification") {
            throw new Error("Production status is not 'PendingOqcVerification'")
        }
        const bom = await PrismaService.bom.findMany({
            where: {
                fgId: fgId,
            },
        })
        const result = await PrismaService.$transaction([
            PrismaService.production.delete({
                where: {
                    id
                }
            }),
            PrismaService.fg.update({
                where: {
                    id: fgId,
                },
                data: {
                    oqcPendingStock: {
                        decrement: quantity,
                    },
                },
            }),
            ...bom.map((bom) => {
                return PrismaService.rm.update({
                    where: {
                        id: bom.rmId,
                    },
                    data: {
                        lineStock: {
                            increment: quantity * bom.quantity,
                        },
                    },
                })
            }),
        ])
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message,
        })
    }
})

app.get('/oqc', async (req: Request, res: Response) => {
    const args: Prisma.OutwardsQualityCheckFindManyArgs = {}
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
    const data = await PrismaService.outwardsQualityCheck.findMany(args)
    res.json(data)
})

app.get('/dispatch', async (req: Request, res: Response) => {
    const args: Prisma.DispatchFindManyArgs = {}
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
    const data = await PrismaService.dispatch.findMany(args)
    res.json(data)
})

app.post('/oqc/accept', async (req: Request, res: Response) => {
    const { fgId, quantity, productionId, createdAt } = req.body

    try {
        const result = await PrismaService.$transaction([
            PrismaService.outwardsQualityCheck.create({
                data: {
                    quantity,
                    createdAt,
                    fgId,
                    productionId,
                    user: req.user ? req.user.username : '',
                },
            }),
            PrismaService.production.update({
                where: {
                    id: productionId,
                },
                data: {
                    status: 'Accepted',
                },
            }),
            PrismaService.fg.update({
                where: {
                    id: fgId,
                },
                data: {
                    oqcPendingStock: {
                        decrement: quantity,
                    },
                    storeStock: {
                        increment: quantity,
                    },
                },
            }),
        ])

        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message,
        })
    }
})

app.post('/oqc/reject', async (req: Request, res: Response) => {
    const { fgId, quantity, productionId, createdAt } = req.body

    try {
        const result = await PrismaService.$transaction([
            PrismaService.outwardsQualityCheck.create({
                data: {
                    quantity,
                    createdAt,
                    fgId,
                    productionId,
                    user: req.user ? req.user.username : '',
                    status: 'RejectedOqcVerification',
                },
            }),
            PrismaService.production.update({
                where: {
                    id: productionId,
                },
                data: {
                    status: 'Accepted',
                },
            }),
            PrismaService.fg.update({
                where: {
                    id: fgId,
                },
                data: {
                    oqcPendingStock: {
                        decrement: quantity,
                    },
                    oqcRejectedStock: {
                        increment: quantity,
                    },
                },
            }),
        ])

        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message,
        })
    }
})

app.post('/dispatch', async (req: Request, res: Response) => {
    const { invoiceNumber, soId, details, createdAt } = req.body

    try {
        const result = await PrismaService.$transaction([
            ...(await details.map(
                ({ fgId, quantity }: { fgId: string; quantity: number }) =>
                    PrismaService.dispatch.create({
                        data: {
                            quantity,
                            createdAt,
                            fgId,
                            user: req.user ? req.user.username : '',
                            soId,
                            invoiceNumber,
                        },
                    })
            )),
            ...(await details.map(
                ({ fgId, quantity }: { fgId: string; quantity: number }) =>
                    PrismaService.fg.update({
                        where: {
                            id: fgId,
                        },
                        data: {
                            storeStock: {
                                decrement: quantity,
                            },
                        },
                    })
            )),
        ])

        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message,
        })
    }
})

app.put('/oqc/:id', async (req: Request, res: Response) => {
    const { fgId, quantity, productionId, createdAt } = req.body

    const { id } = req.params

    try {
        const result = await PrismaService.outwardsQualityCheck.update({
            where: {
                id: parseInt(id),
            },
            data: {
                fgId,
                quantity,
                createdAt,
                productionId,
            },
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message,
        })
    }
})

app.put(
    '/dispatch/:invoiceNumber/:fgId',
    async (req: Request, res: Response) => {
        const {
            quantity,
            createdAt,
            fgId: updatedFgId,
            invoiceNumber: updatedInvoiceNumber,
        } = req.body

        const { fgId, invoiceNumber } = req.params

        try {
            const result = await PrismaService.dispatch.update({
                where: {
                    invoiceNumber_fgId: {
                        fgId,
                        invoiceNumber,
                    },
                },
                data: {
                    quantity,
                    createdAt,
                    fgId: updatedFgId,
                    invoiceNumber: updatedInvoiceNumber,
                },
            })
            res.json(result)
        } catch (e) {
            res.status(500).json({
                message: (e as Error).message,
            })
        }
    }
)

app.delete('/oqc/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const result = await PrismaService.outwardsQualityCheck.delete({
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

app.delete(
    '/dispatch/:invoiceNumber/:fgId',
    async (req: Request, res: Response) => {
        const { invoiceNumber, fgId } = req.params
        try {
            const result = await PrismaService.dispatch.delete({
                where: {
                    invoiceNumber_fgId: {
                        fgId,
                        invoiceNumber,
                    },
                },
            })
            res.json(result)
        } catch (e) {
            res.status(500).json({
                message: (e as Error).message,
            })
        }
    }
)

export default app
