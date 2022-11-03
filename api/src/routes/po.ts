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

app.post('/', async (req: Request, res: Response) => {
    const {
        supplierId,
        id,
        poDetails,
        status
    } = req.body

    try {
        const result = await prisma.upsert({
            where: {
                id
            },
            create: {
                user: req.user ? req.user.username : '',
                supplierId,
                id,
                status,
                poDetails: {
                    createMany: {
                        data: poDetails
                    }
                }
            },
            update: {
                poDetails: {
                    createMany: {
                        data: poDetails,
                        skipDuplicates: true
                    }
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

app.put('/', async (req: Request, res: Response) => {
    const {
        supplierId,
        id,
        poDetails,
        status
    } = req.body

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
                    updateMany: await poDetails.map(({rmId, quantity}: {
                        rmId: string, quantity: number
                    }) => {
                        return {
                            where: {
                                poId: id,
                                rmId
                            },
                            data: {
                                quantity
                            }
                        }
                    }),
                    createMany: {
                        data: poDetails,
                        skipDuplicates: true
                    }
                },
            }
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

app.delete('/', async (req: Request, res: Response) => {
    const { id } = req.body
    try {
        const result = await prisma.delete({
            where: {
                id: id as string,
            }
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
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
                    rmId: rmId as string
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