import express, { Request, Response, Router } from 'express'

import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.production


app.get('/', async (req: Request, res: Response) => {
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
    const data = await prisma.findMany(args)
    res.json(data)
})

app.post('/', async (req: Request, res: Response) => {
    const {
        fgId,
        soId,
        quantity,
        createdAt
    } = req.body

    try {
        const bom = await PrismaService.bom.findMany({
            where: {
                fgId
            }
        })
        const result = await PrismaService.$transaction([
            prisma.create({
                data: {
                    soId,
                    fgId,
                    quantity,
                    createdAt,
                    user: req.user ? req.user.username : '',
                }
            }),
            PrismaService.fg.update({
                where: {
                    id: fgId
                },
                data: {
                    oqcPendingStock: {
                        increment: quantity
                    },
                }
            }),
            ...bom.map(bom => {
                return PrismaService.rm.update({
                    where: {
                        id: bom.rmId
                    },
                    data: {
                        lineStock: {
                            decrement: quantity * bom.quantity
                        }
                    }
                })
            })
        ])
        
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

app.put('/:id', async (req: Request, res: Response) => {
    const {
        fgId,
        soId,
        quantity,
        createdAt
    } = req.body

    const { id } = req.params

    try {
        const result = await prisma.update({
            where: {
                id: parseInt(id),
            },
            data: {
                fgId,
                soId,
                quantity,
                createdAt
            }
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

app.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const result = await prisma.delete({
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

export default app