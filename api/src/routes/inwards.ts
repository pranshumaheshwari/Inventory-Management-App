import express, { Request, Response, Router } from 'express'

import { InwardsStatus, Prisma } from '@prisma/client'
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

const poVerificationHelper = async (supplierId: string, invoiceId: string, details: {
    rmId: string
    quantity: number
}[], status: typeof InwardsStatus.RejectedPoVerification | typeof InwardsStatus.Accepted) => {
    return await PrismaService.$transaction(async (tx) => {
        return details.map(async ({ rmId, quantity }) => {
            const invoiceDetails = await tx.invoiceDetails.findUniqueOrThrow({
                where: {
                    invoiceId_supplierId_rmId: {
                        invoiceId,
                        supplierId,
                        rmId,
                    }
                },
                select: {
                    status: true
                }
            })
            if (invoiceDetails.status !== InwardsStatus.PendingPoVerification) {
                throw new Error(`${invoiceId} status is not ${InwardsStatus.PendingPoVerification}`)
            }
            const data = await tx.invoiceDetails.update({
                where: {
                    invoiceId_supplierId_rmId: {
                        rmId,
                        supplierId,
                        invoiceId,
                    },
                },
                data: {
                    status: status,
                    rm: {
                        update: {
                            poPendingStock: {
                                decrement: quantity,
                            },
                            poRejectedStock: {
                                increment: status === InwardsStatus.RejectedPoVerification ? quantity : 0,
                            },
                            iqcPendingStock: {
                                increment: status === InwardsStatus.Accepted ? quantity : 0,
                            },
                        },
                    },
                },
                select: {
                    rm: {
                        select: {
                            poPendingStock: true,
                        }
                    }
                }
            })
            if (data.rm.poPendingStock < 0) {
                throw new Error(`When setting ${invoiceId} status to ${status}, ${rmId} poPendingStock will be not valid ${data.rm.poPendingStock}`)
            }
            return data
        })
    })
}

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
        const result = await poVerificationHelper(supplierId, invoiceId, details, InwardsStatus.RejectedPoVerification)
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
        const result = await poVerificationHelper(supplierId, invoiceId, details, InwardsStatus.Accepted)
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message,
        })
    }
})

const iqcVerificationHelper = async (details: {
    rmId: string
    quantity: number
    inwardsIQCPendingId: number
}[], status: typeof InwardsStatus.RejectedIqcVerification | typeof InwardsStatus.Accepted, username: string) => {
    return await PrismaService.$transaction(async (tx) => {
        return details.map(async ({ rmId, quantity, inwardsIQCPendingId }) => {
            const inwardsIQCPending = await tx.inwardsIQCPending.findUniqueOrThrow({
                where: {
                    id: inwardsIQCPendingId,
                },
                select: {
                    status: true,
                }
            })
            if (inwardsIQCPending.status !== InwardsStatus.PendingIqcVerification) {
                throw new Error(`${inwardsIQCPendingId} for ${rmId} status is not ${InwardsStatus.PendingIqcVerification}`)
            }
            const data = await tx.inwardsIQCPending.update({
                where: {
                    id: inwardsIQCPendingId,
                },
                data: {
                    status: status,
                    rm: {
                        update: {
                            iqcPendingStock: {
                                decrement: quantity,
                            },
                            iqcRejectedStock: {
                                increment: status === InwardsStatus.RejectedIqcVerification ? quantity : 0,
                            },
                            storeStock: {
                                increment: status === InwardsStatus.Accepted ? quantity : 0,
                            },
                        },
                    },
                    ...(status === InwardsStatus.Accepted ? {
                        inwardsVerified: {
                            create: {
                                quantity,
                                rmId,
                                user: username
                            },
                        },
                    } : {})
                },
                select: {
                    rm: {
                        select: {
                            iqcPendingStock: true,
                        }
                    }
                }
            })
            if (data.rm.iqcPendingStock < 0) {
                throw new Error(`When setting ${inwardsIQCPendingId} status to ${status}, ${rmId} iqcPendingStock will be not valid ${data.rm.iqcPendingStock}`)
            }
            return data
        })
    })
}

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
        const result = await iqcVerificationHelper(details, InwardsStatus.RejectedIqcVerification, req.user?.username as string)
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
        const result = await iqcVerificationHelper(details, InwardsStatus.Accepted, req.user?.username as string)
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message,
        })
    }
})

export default app
