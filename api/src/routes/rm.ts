import express, { Request, Response, Router } from 'express'

import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.rm

app.get('/', async (req: Request, res: Response) => {
    const args: Prisma.RmFindManyArgs = {}
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
        id,
        description,
        dtplCode,
        supplierId,
        category,
        unit,
        price,
        storeStock,
        lineStock,
        mpq,
        moq,
    } = req.body

    try {
        const result = await prisma.create({
            data: {
                id,
                description,
                dtplCode,
                supplierId,
                category,
                unit,
                price,
                storeStock,
                lineStock,
                mpq,
                moq,
            },
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message,
        })
    }
})

app.get('/manualUpdate', async (req: Request, res: Response) => {
    const args: Prisma.RmFindManyArgs = {}
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

app.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    const data = await prisma.findUnique({
        where: {
            id,
        },
    })
    res.json(data)
})

app.put('/:id', async (req: Request, res: Response) => {
    const {
        description,
        dtplCode,
        supplierId,
        category,
        unit,
        price,
        moq,
        mpq,
    } = req.body

    const { id } = req.params

    try {
        const result = await prisma.update({
            where: {
                id,
            },
            data: {
                description,
                dtplCode,
                supplierId,
                category,
                unit,
                price,
                moq,
                mpq,
            },
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message,
        })
    }
})

app.put('/:id/stock', async (req: Request, res: Response) => {
    const { lineStock, storeStock, price } = req.body

    const { id } = req.params

    try {
        const data = await prisma.findUniqueOrThrow({
            where: {
                id,
            },
            select: {
                storeStock,
                lineStock,
            },
        })
        const result = await PrismaService.rmManualUpdateLog.create({
            data: {
                user: req.user ? req.user.username : '',
                rmId: id,
                ...(storeStock
                    ? {
                          storeStock: data.storeStock - parseFloat(storeStock),
                      }
                    : {}),
                ...(lineStock
                    ? {
                          lineStock: data.lineStock - parseFloat(lineStock),
                      }
                    : {}),
            },
        })
        await prisma.update({
            where: {
                id,
            },
            data: {
                ...(storeStock
                    ? {
                          storeStock,
                      }
                    : {}),
                ...(lineStock
                    ? {
                          lineStock,
                      }
                    : {}),
                ...(price
                    ? {
                          price,
                      }
                    : {}),
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
                id,
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
