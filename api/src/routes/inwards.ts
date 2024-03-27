import express, { Request, Response, Router } from 'express'

import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()

app.get('/po', async (req: Request, res: Response) => {
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

app.get('/iqc', async (req: Request, res: Response) => {
    const args: Prisma.InwardsIQCPendingFindManyArgs = {}
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
    const data = await PrismaService.inwardsIQCPending.findMany(args)
    res.json(data)
})

app.get('/verified', async (req: Request, res: Response) => {
    const args: Prisma.InwardsVerifiedFindManyArgs = {}
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
    const data = await PrismaService.inwardsVerified.findMany(args)
    res.json(data)
})

app.put('/rejectPO', async (req: Request, res: Response) => {
    const {
        supplierId,
        invoiceId,
        details,
    }: {
        supplierId: string
        invoiceId: string
        details: {
            rmId: string
            quantity: number
        }[]
    } = req.body
    try {
        const result = await PrismaService.$transaction([
            ...details.map(({ rmId, quantity }) => {
                return PrismaService.invoiceDetails.update({
                    where: {
                        invoiceId_supplierId_rmId: {
                            rmId,
                            supplierId,
                            invoiceId,
                        },
                    },
                    data: {
                        status: 'RejectedPoVerification',
                        rm: {
                            update: {
                                poPendingStock: {
                                    decrement: quantity,
                                },
                                poRejectedStock: {
                                    increment: quantity,
                                },
                            },
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

app.put('/acceptPO', async (req: Request, res: Response) => {
    const {
        supplierId,
        invoiceId,
        details,
    }: {
        supplierId: string
        invoiceId: string
        details: {
            rmId: string
            quantity: number
        }[]
    } = req.body
    try {
        const result = await PrismaService.$transaction([
            ...details.map(({ rmId, quantity }) => {
                return PrismaService.invoiceDetails.update({
                    where: {
                        invoiceId_supplierId_rmId: {
                            rmId,
                            supplierId,
                            invoiceId,
                        },
                    },
                    data: {
                        status: 'Accepted',
                        inwardsIQCPending: {
                            create: {
                                quantity,
                                rmId,
                                user: req.user?.username as string,
                            },
                        },
                        rm: {
                            update: {
                                poPendingStock: {
                                    decrement: quantity,
                                },
                                iqcPendingStock: {
                                    increment: quantity,
                                },
                            },
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

app.put('/rejectIQCs', async (req: Request, res: Response) => {
    const {
        details,
    }: {
        id: number
        details: {
            rmId: string
            quantity: number
            inwardsIQCPendingId: number
        }[]
    } = req.body

    try {
        const result = await PrismaService.$transaction([
            ...details.map(({ quantity, inwardsIQCPendingId }) => {
                return PrismaService.inwardsIQCPending.update({
                    where: {
                        id: inwardsIQCPendingId,
                    },
                    data: {
                        status: 'RejectedIqcVerification',
                        rm: {
                            update: {
                                iqcPendingStock: {
                                    decrement: quantity,
                                },
                                iqcRejectedStock: {
                                    increment: quantity,
                                },
                            },
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

app.put('/acceptIQCs', async (req: Request, res: Response) => {
    const {
        details,
    }: {
        details: {
            rmId: string
            quantity: number
            inwardsIQCPendingId: number
        }[]
    } = req.body

    try {
        const result = await PrismaService.$transaction([
            ...details.map(({ rmId, quantity, inwardsIQCPendingId }) => {
                return PrismaService.inwardsIQCPending.update({
                    where: {
                        id: inwardsIQCPendingId,
                    },
                    data: {
                        status: 'Accepted',
                        rm: {
                            update: {
                                iqcPendingStock: {
                                    decrement: quantity,
                                },
                                storeStock: {
                                    increment: quantity,
                                },
                            },
                        },
                        inwardsVerified: {
                            create: {
                                quantity,
                                rmId,
                                user: req.user?.username as string,
                            },
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

app.put('/acceptIQC', async (req: Request, res: Response) => {
    const {
        rmId,
        quantity,
        inwardsPoPendingId,
    }: {
        rmId: string
        quantity: number
        inwardsPoPendingId: number
    } = req.body

    try {
        const result = await PrismaService.inwardsIQCPending.update({
            where: {
                id: inwardsPoPendingId,
            },
            data: {
                status: 'Accepted',
                rm: {
                    update: {
                        iqcPendingStock: {
                            decrement: quantity,
                        },
                        storeStock: {
                            increment: quantity,
                        },
                    },
                },
                inwardsVerified: {
                    create: {
                        quantity,
                        rmId,
                        user: req.user?.username as string,
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

app.put('/rejectIQC', async (req: Request, res: Response) => {
    const {
        rmId,
        quantity,
        inwardsPoPendingId,
    }: {
        rmId: string
        quantity: number
        inwardsPoPendingId: number
    } = req.body

    try {
        const result = await PrismaService.inwardsIQCPending.update({
            where: {
                id: inwardsPoPendingId,
            },
            data: {
                status: 'RejectedIqcVerification',
                rm: {
                    update: {
                        iqcPendingStock: {
                            decrement: quantity,
                        },
                        iqcRejectedStock: {
                            increment: quantity,
                        },
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

export default app
