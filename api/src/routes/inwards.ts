import { PoInwards, Prisma } from '@prisma/client'
import express, { Request, Response, Router } from 'express'

import { PrismaService } from '../service'

const app: Router = express.Router()


// -------------------------------------
// Invoice
// -------------------------------------

app.get('/invoice', async (req: Request, res: Response) => {
    const args: Prisma.InvoiceInwardsFindManyArgs = {}
    const { select, include, where } = req.query
    if (select) {
        args.select = JSON.parse(select as string)
    }
    if (include) {
        args.include = JSON.parse(include as string)
    }
    if (where) {
        args.where = JSON.parse(where as string)
    }
    const data = await PrismaService.invoiceInwards.findMany(args)
    res.json(data)
})

app.post('/invoice', async (req: Request, res: Response) => {
    const {
        supplierId,
        invoiceNumber,
        rmId,
        quantity,
        status
    } = req.body

    try {
        const result = await PrismaService.invoiceInwards.create({
            data: {
                user: req.user ? req.user.username : '',
                supplierId,
                invoiceNumber,
                rmId,
                quantity,
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

app.post('/invoices', async (req: Request, res: Response) => {
    const data = req.body

    try {
        const updatedData = await data.map((d: Partial<Prisma.InvoiceInwardsCreateManyArgs["data"]>) => ({ ...d, user: req.user ? req.user.username : '' }))
        const result = await PrismaService.invoiceInwards.createMany({
            data: updatedData
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
    const data = await PrismaService.invoiceInwards.findMany({
        where: {
            invoiceNumber,
            supplierId
        }
    })
    res.json(data)
})

app.get('/invoice/:supplierId/:invoiceNumber/:rmId', async (req: Request, res: Response) => {
    const { invoiceNumber, supplierId, rmId } = req.params
    const data = await PrismaService.invoiceInwards.findUnique({
        where: {
            supplierId_invoiceNumber_rmId: {
                invoiceNumber,
                supplierId,
                rmId
            }
        }
    })
    res.json(data)
})

app.put('/invoice/:supplierId/:invoiceNumber', async (req: Request, res: Response) => {
    const data = req.body

    const { invoiceNumber, supplierId } = req.params

    try {
        const updatedData = await data.map((d: Partial<Prisma.InvoiceInwardsCreateManyArgs["data"]>) => ({ ...d, user: req.user ? req.user.username : '' }))
        const results = []
        for(const d of updatedData) {
            const result = await PrismaService.invoiceInwards.upsert({
                update: d,
                create: d,
                where: {
                    supplierId_invoiceNumber_rmId: {
                        invoiceNumber: invoiceNumber,
                        rmId: d.rmId,
                        supplierId: supplierId
                    }
                }
            })
            results.push(result)
        }
        res.json(results)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

app.delete('/invoice/:supplierId/:invoiceNumber/:rmId', async (req: Request, res: Response) => {
    const { invoiceNumber, supplierId, rmId } = req.params
    try {
        const result = await PrismaService.invoiceInwards.delete({
            where: {
                supplierId_invoiceNumber_rmId: {
                    invoiceNumber,
                    supplierId,
                    rmId
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

app.delete('/invoice/:supplierId/:invoiceNumber' , async (req: Request, res: Response) => {
    const { invoiceNumber, supplierId } = req.params
    try {
        const result = await PrismaService.invoiceInwards.deleteMany({
            where: {
                invoiceNumber,
                supplierId,
            }
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

// -------------------------------------
// Purchase Order
// -------------------------------------


app.get('/purchaseOrder', async (req: Request, res: Response) => {
    const args: Prisma.PoInwardsFindManyArgs = {}
    const { select, include, where } = req.query
    if (select) {
        args.select = JSON.parse(select as string)
    }
    if (include) {
        args.include = JSON.parse(include as string)
    }
    if (where) {
        args.where = JSON.parse(where as string)
    }
    const data = await PrismaService.poInwards.findMany(args)
    res.json(data)
})

app.post('/purchaseOrder', async (req: Request, res: Response) => {
    const {
        poId,
        supplierId,
        invoiceNumber,
        rmId,
        quantity,
        status
    } = req.body

    try {
        const result = await PrismaService.poInwards.create({
            data: {
                user: req.user ? req.user.username : '',
                poId,
                supplierId,
                invoiceNumber,
                rmId,
                quantity,
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

app.post('/purchaseOrders', async (req: Request, res: Response) => {
    const { data } = req.body

    try {
        const updatedData = await data.map((d: Partial<Prisma.PoInwardsCreateManyInput>) => ({ ...d, user: req.user ? req.user.username : '' }))
        const result = await PrismaService.poInwards.createMany({
            data: updatedData
        })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            message: (e as Error).message
        })
    }
})

app.get('/purchaseOrder/:supplierId/:invoiceNumber/:rmId', async (req: Request, res: Response) => {
    const { invoiceNumber, supplierId, rmId } = req.params
    const data = await PrismaService.poInwards.findUnique({
        where: {
            supplierId_invoiceNumber_rmId: {
                invoiceNumber,
                supplierId,
                rmId
            }
        }
    })
    res.json(data)
})

app.put('/purchaseOrder/:supplierId/:invoiceNumber/:rmId', async (req: Request, res: Response) => {
    const {
        invoiceNumber: invoiceNumberUpdated,
        supplierId: supplierIdUpdated,
        rmId: updatedRmId,
        poId,
        quantity,
        status
    } = req.body

    const { invoiceNumber, supplierId, rmId } = req.params

    try {
        const result = await PrismaService.poInwards.update({
            where: {
                supplierId_invoiceNumber_rmId: {
                    supplierId,
                    invoiceNumber,
                    rmId
                }
            },
            data: {
                invoiceNumber: invoiceNumberUpdated,
                supplierId: supplierIdUpdated,
                rmId: updatedRmId,
                status,
                poId,
                quantity,
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

app.delete('/purchaseOrder/:supplierId/:invoiceNumber/:rmId', async (req: Request, res: Response) => {
    const { invoiceNumber, supplierId, rmId } = req.params
    try {
        const result = await PrismaService.poInwards.delete({
            where: {
                supplierId_invoiceNumber_rmId: {
                    invoiceNumber,
                    supplierId,
                    rmId
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