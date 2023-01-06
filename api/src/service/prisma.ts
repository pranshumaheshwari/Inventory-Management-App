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

interface RequisitionOutwards {
    id: number
    rmId: string
    quantity: number
    user: string
    requisitionId: number
}

prisma.$use(async (params, next) => {
    const result: any = await next(params)

    if (
        params.model === 'InwardsPoPending' &&
        params.action === 'update' &&
        params.args.data &&
        params.args.data.status
    ) {
        if (params.args.data.status === 'Accepted') {
            // Check if PO need to be closed
            const acceptedPoQtys = await prisma.inwardsPoPending.groupBy({
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
        const pending = await prisma.inwardsPoPending.count({
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

    if (
        params.model === 'RequisitionOutward' &&
        params.action === 'create' &&
        params.args.data
    ) {
        const totalQtys = await prisma.requisition
            .findUnique({
                where: {
                    id: (result as RequisitionOutwards).requisitionId,
                },
                select: {
                    fg: {
                        select: {
                            bom: {
                                select: {
                                    rmId: true,
                                    quantity: true,
                                },
                            },
                        },
                    },
                    quantity: true,
                },
            })
            .then((data) =>
                data?.fg.bom.map((d) => ({
                    rmId: d.rmId,
                    quantity: d.quantity * data.quantity,
                }))
            )
        const issuedQtys = await prisma.requisitionOutward.groupBy({
            where: {
                requisitionId: (result as RequisitionOutwards).requisitionId,
            },
            by: ['rmId'],
            _sum: {
                quantity: true,
            },
        })
        if (totalQtys && totalQtys.length === issuedQtys.length) {
            let shouldClose = true
            for (const totalQty of totalQtys) {
                for (const issuedQty of issuedQtys) {
                    if (totalQty.rmId === issuedQty.rmId) {
                        if (
                            issuedQty._sum.quantity &&
                            totalQty.quantity > issuedQty._sum.quantity
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
                await prisma.requisition.update({
                    where: {
                        id: (result as RequisitionOutwards).requisitionId,
                    },
                    data: {
                        status: 'Closed',
                    },
                })
            }
        }
    }

    return result
})

export default prisma
