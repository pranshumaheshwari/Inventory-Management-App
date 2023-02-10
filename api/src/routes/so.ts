import express, { Request, Response, Router } from 'express'

import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.so

app.get('/', async (req: Request, res: Response) => {
    const args: Prisma.SoFindManyArgs = {}
    const { select, include } = req.query
    if (select) {
        args.select = JSON.parse(select as string)
    }
    if (include) {
        args.include = JSON.parse(include as string)
    }
    const data = await prisma.findMany(args)
    res.json(data)
})

app.post('/', async (req: Request, res: Response) => {
    const { id, customerId, soDetails } = req.body

    const details = soDetails.map(
        (fg: Prisma.SoDetailsUncheckedCreateInput) => {
            return {
                fgId: fg.fgId,
                quantity: fg.quantity,
            }
        }
    )

    try {
        const result = await prisma.create({
            data: {
                id,
                customerId,
                soDetails: {
                    create: details,
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

app.get('/:soId', async (req: Request, res: Response) => {
    const { soId } = req.params
    const args: Prisma.SoDetailsFindManyArgs = {}
    const { select, include } = req.query
    if (select) {
        args.select = JSON.parse(select as string)
    }
    if (include) {
        args.include = JSON.parse(include as string)
    }
    const data = await PrismaService.soDetails.findMany({
        where: {
            soId,
        },
        ...args,
    })
    res.json(data)
})

app.put('/:id', async (req: Request, res: Response) => {
    const { id: updatedId, customerId, status, soDetails } = req.body

    const { id } = req.params

    const details = soDetails.map(
        (fg: Prisma.SoDetailsUncheckedCreateInput) => {
            return {
                fgId: fg.fgId,
                quantity: fg.quantity,
            }
        }
    )

    const currentDetails = await PrismaService.soDetails.findMany({
        where: {
            soId: id,
        },
    })
    try {
        const del = await PrismaService.soDetails.deleteMany({
            where: {
                soId: id,
            },
        })
        const result = await prisma.update({
            where: {
                id,
            },
            data: {
                id: updatedId,
                customerId,
                status,
                soDetails: {
                    create: details,
                },
            },
        })
        res.json(result)
    } catch (e) {
        const recreate = await PrismaService.soDetails.createMany({
            data: currentDetails,
        })
        res.status(500).json({
            message: (e as Error).message,
        })
    }
})

app.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const del = await PrismaService.soDetails.deleteMany({
            where: {
                soId: id,
            },
        })
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

app.delete('/:id/:fgId', async (req: Request, res: Response) => {
    const { id, fgId } = req.params
    try {
        const result = await PrismaService.soDetails.delete({
            where: {
                soId_fgId: {
                    soId: id,
                    fgId,
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
