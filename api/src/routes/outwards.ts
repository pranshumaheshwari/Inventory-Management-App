import express, { Request, Response, Router } from 'express'

import { OutwardsStatus, Prisma } from '@prisma/client'
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

const oqcVerificationHelper = async (fgId: string, productionId: number, quantity: number, status: typeof OutwardsStatus.RejectedOqcVerification | typeof OutwardsStatus.Accepted, username: string) => {
    return await PrismaService.$transaction(async (tx) => {
        const production = await tx.production.findUniqueOrThrow({
                where: {
                id: productionId
                },
            select: {
                status: true
            }
        })
        if (production.status !== OutwardsStatus.PendingOqcVerification) {
            throw new Error(`${productionId} for ${fgId} status is not ${OutwardsStatus.PendingOqcVerification}`)
        }
        const data = await tx.production.update({
                where: {
                id: productionId
                },
                data: {
                status: status,
                fg: {
                    update: {
                    oqcPendingStock: {
                        decrement: quantity,
                    },
                        oqcRejectedStock: {
                            increment: status === OutwardsStatus.RejectedOqcVerification ? quantity : 0,
                        },
                    storeStock: {
                            increment: status === OutwardsStatus.Accepted ? quantity : 0,
                    },
                },
                },
                outwardsQualityCheck: {
                    create: {
                        quantity,
                        fgId,
                        user: username,
                        status,
                    }
                }
            },
            select: {
                fg: {
                    select: {
                        oqcPendingStock: true,
                    }
                }
            }
        })
        if (data.fg.oqcPendingStock < 0) {
            throw new Error(`When setting ${productionId} status to ${status}, ${fgId} oqcPendingStock will be not valid ${data.fg.oqcPendingStock}`)
        }
        return data
    })
}

app.post('/oqc/accept', async (req: Request, res: Response) => {
    const { fgId, quantity, productionId } = req.body

    try {
        const result = await oqcVerificationHelper(fgId, productionId, quantity, OutwardsStatus.Accepted, req.user ? req.user.username : '')
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
        const result = await oqcVerificationHelper(fgId, productionId, quantity, OutwardsStatus.RejectedOqcVerification, req.user ? req.user.username : '')
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

app.delete('/oqc/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    try {
        const {fgId, quantity, status, productionId} = await PrismaService.outwardsQualityCheck.findUniqueOrThrow({
            where: {
                id
            }
        })
        const result = await PrismaService.$transaction([
            PrismaService.production.update({
                where: {
                    id: productionId
                },
                data: {
                    status: "PendingOqcVerification"
                }
            }),
            PrismaService.outwardsQualityCheck.delete({
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
                        increment: quantity,
                    },
                    ...(status === "Accepted" ? {
                        storeStock: {
                            decrement: quantity
                        }
                    } : {
                        oqcRejectedStock: {
                            decrement: quantity
                        }
                    }) 
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

app.delete('/dispatch/:invoiceNumber', async (req: Request, res: Response) => {
    const {invoiceNumber} = req.params
    try {
        const details = await PrismaService.dispatch.findMany({
            where: {
                invoiceNumber
            },
            select: {
                fgId: true,
                quantity: true
            }
        })
        if (details.length === 0) {
            throw new Error("Invalid invoice for dispatch")
        }
        const result = await PrismaService.$transaction([
            PrismaService.dispatch.deleteMany({
                where: {
                    invoiceNumber
                }
            }),
            ...(await details.map(
                ({ fgId, quantity }: { fgId: string; quantity: number }) =>
                    PrismaService.fg.update({
                        where: {
                            id: fgId,
                        },
                        data: {
                            storeStock: {
                                increment: quantity,
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


app.delete('/dispatch/:invoiceNumber/:fgId', async (req: Request, res: Response) => {
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
})

export default app
