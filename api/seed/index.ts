import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


const f = async () => {
    // let resp = await prisma.users.create({
    //     data: {
    //         name: 'TEMP',
    //         password: 'PASS',
    //         type: 'admin',
    //         username: 'TEMP',
    //     }
    // })
    // let resp = await prisma.supplier.create({
    //     data: {
    //         city: 'ABAD',
    //         gst: '123456789012345',
    //         id: 'SUP',
    //         name: 'SUP NAME',
    //         state: 'MH',
    //     }
    // })
    
    
    let rms: Prisma.RmCreateManyInput[] = Array.apply(null, Array(1000)).map(function(currentValue, index) { return {
        id: index.toString(),
        category: 'Coil',
        description: index.toString() + ' DESC',
        dtplCode: index.toString() + ' DTPL CODE',
        unit: 'MTR',
        supplierId: 'SUP'
    }})
    
    // await prisma.rm.createMany({
    //     data: rms
    // })

}

f()

