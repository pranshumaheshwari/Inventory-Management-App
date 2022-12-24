import express, { Request, Response, Router } from 'express'

import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()

app.get('/po', async (req: Request, res: Response) => {
    const args: Prisma.InwardsPoPendingFindManyArgs = {}
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
    const data = await PrismaService.inwardsPoPending.findMany(args)
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
// TODO - Check if PO is complete
app.put('/rejectPO', async (req: Request, res: Response) => {
    const {
        supplierId,
        invoiceId,
        poId,
        details,
    }: {
        supplierId: string
        invoiceId: string
        poId: string
        details: {
            rmId: string
            quantity: number
        }[]
    } = req.body
    try {
        const result = await PrismaService.$transaction([
            PrismaService.invoicePO.create({
                data: {
                    supplierId,
                    invoiceId,
                    poId,
                },
                select: {
                    id: true,
                },
            }),
            ...details.map(({ rmId, quantity }) => {
                return PrismaService.inwardsPoPending.update({
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
        poId,
        details,
    }: {
        supplierId: string
        invoiceId: string
        poId: string
        details: {
            rmId: string
            quantity: number
        }[]
    } = req.body
    try {
        const result = await PrismaService.$transaction([
            PrismaService.invoicePO.create({
                data: {
                    supplierId,
                    invoiceId,
                    poId,
                },
            }),
            ...details.map(({ rmId, quantity }) => {
                return PrismaService.inwardsPoPending.update({
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
        id,
        details,
    }: {
        id: number
        details: {
            rmId: string
            quantity: number
        }[]
    } = req.body

    try {
        const result = await PrismaService.$transaction([
            ...details.map(({ rmId, quantity }) => {
                return PrismaService.inwardsIQCPending.update({
                    where: {
                        id,
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
        id,
        details,
    }: {
        id: number
        details: {
            rmId: string
            quantity: number
        }[]
    } = req.body

    try {
        const result = await PrismaService.$transaction([
            ...details.map(({ rmId, quantity }) => {
                return PrismaService.inwardsIQCPending.update({
                    where: {
                        id,
                    },
                    data: {
                        status: 'RejectedIqcVerification',
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
                status: 'RejectedIqcVerification',
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
