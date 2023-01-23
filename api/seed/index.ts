import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const f = async () => {
    await prisma.attendance.createMany({
        data: Array.apply(null, Array(100)).map(function (currentValue, index) {
            let d = new Date()
            d.setDate(d.getDate() - index)
            return {
                number: Math.floor(Math.random() * 200),
                date: d,
            }
        }),
    })
    await prisma.users.create({
        data: {
            name: 'TEMP',
            password: 'PASS',
            type: 'admin',
            username: 'TEMP',
        },
    })
    await prisma.supplier.create({
        data: {
            city: 'ABAD',
            gst: '123456789012345',
            id: 'SUP',
            name: 'SUP NAME',
            state: 'MH',
        },
    })
    await prisma.customer.create({
        data: {
            city: 'ABAD',
            gst: '123456789012345',
            id: 'CUS',
            name: 'CUS NAME',
            state: 'MH',
        },
    })

    let rms: Prisma.RmCreateManyInput[] = Array.apply(null, Array(1000)).map(
        function (currentValue, index) {
            return {
                id: 'RM ' + index.toString(),
                category: 'Coil',
                description: 'RM ' + index.toString() + ' DESC',
                dtplCode: 'RM ' + index.toString() + ' DTPL CODE',
                unit: 'MTR',
                supplierId: 'SUP',
            }
        }
    )

    await prisma.rm.createMany({
        data: rms,
    })

    await prisma.fg.createMany({
        data: Array.apply(null, Array(100)).map(function (currentValue, index) {
            return {
                id: 'FG ' + index.toString(),
                category: 'Piaggio',
                customerId: 'CUS',
                description: 'FG ' + index.toString() + ' DESC',
                price: Math.round(Math.random() * 400),
            }
        }),
    })

    for (let i = 0; i < 100; i++) {
        await prisma.bom.createMany({
            data: Array.apply(null, Array(Math.floor(Math.random() * 40))).map(
                function (currentValue, index) {
                    return {
                        fgId: 'FG ' + i.toString(),
                        rmId: 'RM ' + Math.floor(Math.random() * 1000),
                        quantity: Math.floor(Math.random() * 100),
                    }
                }
            ),
            skipDuplicates: true,
        })
    }
}

f()
