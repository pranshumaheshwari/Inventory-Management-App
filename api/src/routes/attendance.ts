import express, { Request, Response, Router } from 'express'

import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.attendance

app.get('/', async (req: Request, res: Response) => {
    const args: Prisma.AttendanceFindManyArgs = {}
    const { select, where, distinct } = req.query
    if (select) {
        args.select = JSON.parse(select as string)
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
    const { number, date } = req.body

    try {
        const result = await prisma.create({
            data: {
                number,
                date,
            },
        })
        res.json(result)
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

app.put('/:id', async (req: Request, res: Response) => {
    const { number } = req.body

    const { id } = req.params

    try {
        const result = await prisma.update({
            where: {
                id: parseInt(id),
            },
            data: {
                number,
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
