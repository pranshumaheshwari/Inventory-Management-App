import express, { Request, Response, Router } from 'express'

import { Prisma } from '@prisma/client'
import { PrismaService } from '../service'

const app: Router = express.Router()


app.get('/invoice', async (req: Request, res: Response) => {
    const args: Prisma.InvoiceInwardsFindManyArgs = {}
    const { select, include } = req.query
    if (select) {
        args.select = JSON.parse(select as string)
    }
    if (include) {
        args.include = JSON.parse(include as string)
    }
    const data = await PrismaService.invoiceInwards.findMany(args)
    res.json(data)
})

app.post('/invoice', async (req: Request, res: Response) => {
    const {
        supplierId,
        invoiceNumber,
        status
    } = req.body

    try {
        const result = await PrismaService.invoiceInwards.create({
            data: {
                user: req.user ? req.user.username : '',
                supplierId,
                invoiceNumber,
                status
            }
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

app.get('/invoice/:supplierId/:invoiceNumber', async (req: Request, res: Response) => {
    const { invoiceNumber, supplierId } = req.params
    const data = await PrismaService.invoiceInwards.findUnique({
        where: {
            supplierId_invoiceNumber: {
                invoiceNumber,
                supplierId
            }
        }
    })
    res.json(data)
})

app.put('/invoice/:supplierId/:invoiceNumber', async (req: Request, res: Response) => {
    const {
        invoiceNumber: invoiceNumberUpdated,
        supplierId: supplierIdUpdated,
        status
    } = req.body

    const { invoiceNumber, supplierId } = req.params

    try {
        const result = await PrismaService.invoiceInwards.update({
            where: {
                supplierId_invoiceNumber: {
                    supplierId,
                    invoiceNumber
                }
            },
            data: {
                invoiceNumber: invoiceNumberUpdated,
                supplierId: supplierIdUpdated,
                status,
                user: req.user ? req.user.username : ''
            }
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

app.delete('/invoice/:supplierId/:invoiceNumber', async (req: Request, res: Response) => {
    const { invoiceNumber, supplierId } = req.params
    try {
        const result = await PrismaService.invoiceInwards.delete({
            where: {
                supplierId_invoiceNumber: {
                    invoiceNumber,
                    supplierId
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