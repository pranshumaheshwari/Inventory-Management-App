import { BinaryStatus, Prisma } from '@prisma/client'
import express, { Request, Response, Router } from 'express'

import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.invoice

app.get('/', async (req: Request, res: Response) => {
    const args: Prisma.InvoiceFindManyArgs = {}
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
    const args: Prisma.InvoiceDetailsFindManyArgs = {}
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
    const data = await PrismaService.invoiceDetails.findMany(args)
    res.json(data)
})

app.post('/', async (req: Request, res: Response) => {
    const {
        supplierId,
        id,
        invoiceDetails,
        status,
        date,
    }: {
        supplierId: string
        id: string
        status: BinaryStatus
        invoiceDetails: {
            poId: string
            rmId: string
            quantity: number
        }[]
        date: string
    } = req.body

    try {
        const result = await PrismaService.$transaction([
            prisma.create({
                data: {
                    user: req.user ? req.user.username : '',
                    supplierId,
                    id,
                    status,
                    invoiceDetails: {
                        createMany: {
                            data: invoiceDetails.map(({poId, rmId, quantity}) => ({
                                rmId,
                                poId,
                                quantity,
                            })),
                        },
                    },
                    date,
                },
            }),
            ...invoiceDetails.map(({ rmId, quantity }) => {
                return PrismaService.rm.update({
                    where: {
                        id: rmId,
                    },
                    data: {
                        poPendingStock: {
                            increment: quantity,
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

app.put('/', async (req: Request, res: Response) => {
    const { supplierId, id, invoiceDetails, status } = req.body

    try {
        const result = await prisma.update({
            where: {
                id_supplierId: {
                    id,
                    supplierId,
                },
            },
            data: {
                id,
                supplierId,
                status,
                invoiceDetails: {
                    updateMany: await invoiceDetails.map(
                        ({
                            rmId,
                            quantity,
                            poId,
                        }: {
                            poId: string
                            rmId: string
                            quantity: number
                        }) => {
                            return {
                                where: {
                                    invoiceId: id,
                                    supplierId,
                                    rmId,
                                },
                                data: {
                                    quantity,
                                    poId,
                                },
                            }
                        }
                    ),
                    createMany: {
                        data: invoiceDetails,
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
    const { id, supplierId } = req.body
    try {
        const result = await prisma.delete({
            where: {
                id_supplierId: {
                    id: id as string,
                    supplierId: supplierId as string,
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

app.delete('/details', async (req: Request, res: Response) => {
    const { invoiceId, supplierId, rmId } = req.body
    try {
        const result = await PrismaService.invoiceDetails.delete({
            where: {
                invoiceId_supplierId_rmId: {
                    invoiceId: invoiceId as string,
                    supplierId: supplierId as string,
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
