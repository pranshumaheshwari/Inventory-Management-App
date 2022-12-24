import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// When creating invoice with inwards, update the raw material stock as well
// TODO - Update this
prisma.$use(async (params, next) => {
    const result = await next(params)
    if (
        params.model === 'Invoice' &&
        params.action === 'create' &&
        params.args.data &&
        params.args.data.inwards
    ) {
        const rawMaterials = params.args.create.inwards.createMany.data
        for (let rm of rawMaterials) {
            await prisma.rm.update({
                where: {
                    id: rm.rmId,
                },
                data: {
                    poPendingStock: {
                        increment: rm.quantity,
                    },
                },
            })
        }
    }
    return result
})

export default prisma
