import express, { Request, Response, Router } from 'express'

import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()

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
    const {
        fgId,
        quantity,
        productionId,
        createdAt
    } = req.body

    try {
        const result = await PrismaService.$transaction([
            PrismaService.outwardsQualityCheck.create({
                data: {
                    quantity,
                    createdAt,
                    fgId,
                    productionId,
                    user: req.user ? req.user.username : '',
                }
            }),
            PrismaService.production.update({
                where: {
                    id: productionId
                },
                data: {
                    status: 'Accepted'
                }
            }),
            PrismaService.fg.update({
                where: {
                    id: fgId
                },
                data: {
                    oqcPendingStock: {
                        decrement: quantity
                    },
                    storeStock: {
                        increment: quantity
                    }
                }
            }),
        ])
        
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

app.post('/oqc/reject', async (req: Request, res: Response) => {
    const {
        fgId,
        quantity,
        productionId,
        createdAt
    } = req.body

    try {
        const result = await PrismaService.$transaction([
            PrismaService.outwardsQualityCheck.create({
                data: {
                    quantity,
                    createdAt,
                    fgId,
                    productionId,
                    user: req.user ? req.user.username : '',
                    status: 'RejectedOqcVerification'
                }
            }),
            PrismaService.production.update({
                where: {
                    id: productionId
                },
                data: {
                    status: 'RejectedOqcVerification'
                }
            }),
            PrismaService.fg.update({
                where: {
                    id: fgId
                },
                data: {
                    oqcPendingStock: {
                        decrement: quantity
                    },
                    oqcRejectedStock: {
                        increment: quantity
                    }
                }
            }),
        ])
        
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

app.post('/dispatch', async (req: Request, res: Response) => {
    const {
        invoiceNumber,
        fgId,
        quantity,
        outwardQualityCheckId,
        createdAt
    } = req.body

    try {
        const result = await PrismaService.$transaction([
            PrismaService.dispatch.create({
                data: {
                    quantity,
                    createdAt,
                    fgId,
                    outwardQualityCheckId,
                    user: req.user ? req.user.username : '',
                    invoiceNumber
                }
            }),
            PrismaService.outwardsQualityCheck.update({
                where: {
                    id: outwardQualityCheckId
                },
                data: {
                    status: 'Dispatched',
                    production: {
                        update: {
                            status: 'Dispatched'
                        }
                    }
                }
            }),
            PrismaService.fg.update({
                where: {
                    id: fgId
                },
                data: {
                    storeStock: {
                        decrement: quantity
                    }
                }
            }),
        ])
        
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

app.put('/oqc/:id', async (req: Request, res: Response) => {
    const {
        fgId,
        quantity,
        productionId,
        createdAt
    } = req.body

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
                productionId
            }
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

app.put('/dispatch/:invoiceNumber/:fgId', async (req: Request, res: Response) => {
    const {
        quantity,
        createdAt,
        outwardQualityCheckId,
        fgId: updatedFgId,
        invoiceNumber: updatedInvoiceNumber
    } = req.body

    const { fgId, invoiceNumber } = req.params

    try {
        const result = await PrismaService.dispatch.update({
            where: {
                invoiceNumber_fgId: {
                    fgId,
                    invoiceNumber
                }
            },
            data: {
                quantity,
                createdAt,
                outwardQualityCheckId,
                fgId: updatedFgId,
                invoiceNumber: updatedInvoiceNumber
            }
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

app.delete('/oqc/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const result = await PrismaService.outwardsQualityCheck.delete({
            where: {
                id: parseInt(id)
            }
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

app.delete('/dispatch/:invoiceNumber/:fgId', async (req: Request, res: Response) => {
    const { invoiceNumber, fgId } = req.params
    try {
        const result = await PrismaService.dispatch.delete({
            where: {
                invoiceNumber_fgId: {
                    fgId,
                    invoiceNumber
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

export default app