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
        lineStock
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
                lineStock
            }
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

app.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    const data = await prisma.findUnique({
        where: {
            id
        }
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
        storeStock,
        lineStock
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
                storeStock,
                lineStock
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
                id
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