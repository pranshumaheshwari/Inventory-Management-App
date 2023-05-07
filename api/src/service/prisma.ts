import { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface InwardsPoPending {
    id: number
    rmId: string
    quantity: number
    invoiceId: string
    supplierId: string
    user: string
    poId: string
}

prisma.$use(async (params, next) => {
    try {
        if (
            params.model === 'RequisitionOutward' &&
            params.action === 'create' &&
            params.args.data
        ) {
            const requisitionOutwards = params.args
                .data as Prisma.RequisitionOutwardUncheckedCreateInput
            const issuedQty =
                (await prisma.requisitionOutward
                    .aggregate({
                        where: {
                            requisitionId: requisitionOutwards.requisitionId,
                            rmId: requisitionOutwards.rmId,
                        },
                        _sum: {
                            quantity: true,
                        },
                    })
                    .then((d) => d._sum.quantity)) || 0

            const details = await prisma.requisitionDetails.findUniqueOrThrow({
                where: {
                    requisitionId_rmId: {
                        rmId: requisitionOutwards.rmId,
                        requisitionId: requisitionOutwards.requisitionId,
                    },
                },
            })
            if (details.quantity <= requisitionOutwards.quantity + issuedQty) {
                await prisma.requisitionDetails.update({
                    where: {
                        requisitionId_rmId: {
                            rmId: requisitionOutwards.rmId,
                            requisitionId: requisitionOutwards.requisitionId,
                        },
                    },
                    data: {
                        status: 'Closed',
                    },
                })
                let remainingQuantity =
                    requisitionOutwards.quantity + issuedQty - details.quantity
                const openRequisitions =
                    await prisma.requisitionDetails.findMany({
                        where: {
                            rmId: requisitionOutwards.rmId,
                            status: 'Open',
                        },
                        orderBy: {
                            requisitionId: 'asc',
                        },
                    })
                for (const r of openRequisitions) {
                    if (remainingQuantity <= 0) {
                        break
                    }
                    const issuedQty =
                        (await prisma.requisitionOutward
                            .aggregate({
                                where: {
                                    requisitionId: r.requisitionId,
                                    rmId: r.rmId,
                                },
                                _sum: {
                                    quantity: true,
                                },
                            })
                            .then((d) => d._sum.quantity)) || 0
                    const quantity = Math.min(
                        remainingQuantity,
                        r.quantity - issuedQty
                    )
                    if (quantity > 0) {
                        await prisma.requisitionOutward.create({
                            data: {
                                requisitionId: r.requisitionId,
                                rmId: r.rmId,
                                quantity,
                                user: requisitionOutwards.user,
                            },
                        })
                        remainingQuantity -= quantity
                    }
                }
                const result = await prisma.requisitionOutward.create({
                    data: {
                        ...requisitionOutwards,
                        quantity: Math.min(
                            details.quantity - issuedQty,
                            requisitionOutwards.quantity
                        ),
                    },
                })
                return result
            }
        }
    } catch {}
    const result: any = await next(params)
    return result
})

prisma.$use(async (params, next) => {
    const result: any = await next(params)
    try {
        if (
            params.model === 'InvoiceDetails' &&
            params.action === 'update' &&
            params.args.data &&
            params.args.data.status
        ) {
            if (params.args.data.status === 'Accepted') {
                // Check if PO need to be closed
                const acceptedPoQtys = await prisma.invoiceDetails.groupBy({
                    by: ['rmId'],
                    where: {
                        poId: (result as InwardsPoPending).poId,
                        status: 'Accepted',
                    },
                    _sum: {
                        quantity: true,
                    },
                })
                const poQtys = await prisma.poDetails.findMany({
                    where: {
                        poId: (result as InwardsPoPending).poId,
                    },
                    select: {
                        rmId: true,
                        quantity: true,
                    },
                })
                if (poQtys.length === acceptedPoQtys.length) {
                    let shouldClose = true
                    for (const poQty of poQtys) {
                        for (const acceptedPoQty of acceptedPoQtys) {
                            if (poQty.rmId === acceptedPoQty.rmId) {
                                if (
                                    acceptedPoQty._sum.quantity &&
                                    poQty.quantity > acceptedPoQty._sum.quantity
                                ) {
                                    shouldClose = false
                                    break
                                }
                            }
                        }
                        if (!shouldClose) {
                            break
                        }
                    }
                    if (shouldClose) {
                        await prisma.po.update({
                            where: {
                                id: (result as InwardsPoPending).poId,
                            },
                            data: {
                                status: 'Closed',
                            },
                        })
                    }
                }
            }
            // Close invoice if no more pending entries
            const pending = await prisma.invoiceDetails.count({
                where: {
                    invoiceId: (result as InwardsPoPending).invoiceId,
                    status: 'PendingPoVerification',
                },
            })
            if (pending === 0) {
                await prisma.invoice.update({
                    where: {
                        id_supplierId: {
                            id: (result as InwardsPoPending).invoiceId,
                            supplierId: (result as InwardsPoPending).supplierId,
                        },
                    },
                    data: {
                        status: 'Closed',
                    },
                })
            }
        }
    } catch {}

    return result
})

export default prisma
