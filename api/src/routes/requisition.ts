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

app.post('/issueMany/:requisitionId', async (req: Request, res: Response) => {
    const { requisitionId } = req.params
    interface DetailsInterface {
        rmId: string
        quantity: number
        excessQuantity: number
        issuedQuantity: number
        requisitionQuantity: number
        pendingRequisitions: {
            issuedQuantity: number
            requisitionId: number
            quantity: number
        }[]
    }
    let { details }: { details: DetailsInterface[] } = req.body
    const excessOnLineUpdates: {
        rmId: string
        quantity: number
    }[] = []
    const requisitionOutwards: {
        rmId: string
        quantity: number
        requisitionId: number
    }[] = []
    const requisitionExcessOnLine: {
        rmId: string
        quantity: number
    }[] = []
    // TODO: Fix this for new schema
    try {
        details
            .map((d) => ({
                ...d,
                totalQuantity: d.quantity + d.excessQuantity,
            }))
            .filter((d) => d.totalQuantity > 0)
            .map((d) => {
                if (
                    d.totalQuantity >
                    d.requisitionQuantity - d.issuedQuantity
                ) {
                    // Incase total qty is greater than the qty required by the current requisition
                    // 1. Fulfill the current requisition
                    requisitionOutwards.push({
                        rmId: d.rmId,
                        quantity: d.requisitionQuantity - d.issuedQuantity,
                        requisitionId: parseInt(requisitionId)
                    })
                    let remainingQuantity = d.totalQuantity - d.requisitionQuantity + d.issuedQuantity
                    // 2. Fulfill the previous requisitions
                    for (const req of d.pendingRequisitions) {
                        if (remainingQuantity > 0) {
                            const qty = Math.min(
                                remainingQuantity,
                                req.quantity - req.issuedQuantity
                            )
                            remainingQuantity -= qty
                            requisitionOutwards.push({
                                rmId: d.rmId,
                                quantity: qty,
                                requisitionId: req.requisitionId,
                            })
                        } else {
                            break
                        }
                    }
                    // 3. If qty is still remaining then set excess on line
                    if (remainingQuantity > 0) {
                        excessOnLineUpdates.push({
                            rmId: d.rmId,
                            quantity: remainingQuantity,
                        })
                        requisitionExcessOnLine.push({
                            rmId: d.rmId,
                            quantity: remainingQuantity - d.excessQuantity
                        })
                    } else {
                        // 4. In case excess on line stock was used, update `requisitionExcessOnLine`
                        if (d.excessQuantity !== 0) {
                            // 2. Set excess on line to 0
                            excessOnLineUpdates.push({
                                quantity: 0,
                                rmId: d.rmId,
                            })
                            // 3. In case excess on line stock was used, update `requisitionExcessOnLine`
                            requisitionExcessOnLine.push({
                                rmId: d.rmId,
                                quantity: -1 * d.excessQuantity
                            })
                        }
                    }
                } else {
                    // Incase total qty is required by the current requisition
                    // 1. Update `requisitionOutwards` with total qty
                    requisitionOutwards.push({
                        rmId: d.rmId,
                        quantity: d.totalQuantity,
                        requisitionId: parseInt(requisitionId),
                    })
                    if (d.excessQuantity !== 0) {
                        // 2. Set excess on line to 0
                        excessOnLineUpdates.push({
                            quantity: 0,
                            rmId: d.rmId,
                        })
                        // 3. In case excess on line stock was used, update `requisitionExcessOnLine`
                        requisitionExcessOnLine.push({
                            rmId: d.rmId,
                            quantity: -1 * d.excessQuantity
                        })
                    }
                }
            })
        

        console.log(excessOnLineUpdates)
        console.log(requisitionOutwards)
        console.log(requisitionExcessOnLine)
        // const result = await PrismaService.$transaction([
        //     ...excessOnLineUpdates.map(d => PrismaService.rm.update({
        //         where: {
        //             id: d.rmId,
        //         },
        //         data: {
        //             excessOnLine: d.quantity
        //         }
        //     })),
        //     ...requisitionOutwards.map(d => PrismaService.requisitionOutward.create({
        //         data: {
        //             ...d,
        //             user: req.user ? req.user.username : '',
        //         }
        //     })),
        //     ...requisitionExcessOnLine.map(d => PrismaService.requisitionExcessOnLine.create({
        //         data: {
        //             ...d,
        //             user: req.user ? req.user.username : '',
        //         }
        //     }))
        // ])
        // 
        // res.json(result)
        res.json({})
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
