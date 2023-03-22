import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import { parse } from 'csv-parse'

const prisma = new PrismaClient()

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

const f = async () => {
    // USERS
    fs.createReadStream(`${__dirname}/users.csv`)
        .pipe(parse({ delimiter: ',', columns: true }))
        .on('data', async (row) => {
            try {
                await prisma.users.create({
                    data: row,
                })
                console.log(`User ${row['name']} created`)
            } catch (e) {
                console.log(e)
                console.log(row)
                process.exit(1)
            }
        })
        .on('end', async () => {
            // SUPPLIER
            await sleep(1000)
            fs.createReadStream(`${__dirname}/supplier.csv`)
                .pipe(parse({ delimiter: ',', columns: true }))
                .on('data', async (row) => {
                    try {
                        await prisma.supplier.create({
                            data: row,
                        })
                        console.log(`Supplier ${row['id']} created`)
                    } catch (e) {
                        console.log(e)
                        console.log(row)
                        process.exit(1)
                    }
                })
                .on('end', async () => {
                    // RAW MATERIAL
                    await sleep(1000)
                    fs.createReadStream(`${__dirname}/rm.csv`)
                        .pipe(parse({ delimiter: ',', columns: true }))
                        .on('data', async (row) => {
                            try {
                                await prisma.rm.create({
                                    data: {
                                        ...row,
                                        price: parseFloat(row.price),
                                        storeStock: parseFloat(row.storeStock),
                                        lineStock: parseFloat(row.lineStock),
                                    },
                                })
                                console.log(`RM ${row['id']} created`)
                            } catch (e) {
                                console.log(e)
                                console.log(row)
                                process.exit(1)
                            }
                        })
                        .on('end', async () => {
                            // CUSTOMER
                            await sleep(1000)
                            fs.createReadStream(`${__dirname}/customer.csv`)
                                .pipe(parse({ delimiter: ',', columns: true }))
                                .on('data', async (row) => {
                                    try {
                                        await prisma.customer.create({
                                            data: row,
                                        })
                                        console.log(
                                            `Customer ${row['id']} created`
                                        )
                                    } catch (e) {
                                        console.log(e)
                                        console.log(row)
                                        process.exit(1)
                                    }
                                })
                                .on('end', async () => {
                                    // FINISHED GOODS
                                    await sleep(1000)
                                    fs.createReadStream(`${__dirname}/fg.csv`)
                                        .pipe(
                                            parse({
                                                delimiter: ',',
                                                columns: true,
                                            })
                                        )
                                        .on('data', async (row) => {
                                            try {
                                                await prisma.fg.create({
                                                    data: {
                                                        ...row,
                                                        price: parseFloat(
                                                            row.price
                                                        ),
                                                        storeStock: parseFloat(
                                                            row.storeStock
                                                        ),
                                                        overheads: parseFloat(
                                                            row.overheads
                                                        ),
                                                        manPower: parseFloat(
                                                            row.manPower
                                                        ),
                                                    },
                                                })
                                                console.log(
                                                    `FG ${row['id']} created`
                                                )
                                            } catch (e) {
                                                console.log(e)
                                                console.log(row)
                                                process.exit(1)
                                            }
                                        })
                                        .on('end', async () => {
                                            // BOM
                                            await sleep(1000)
                                            fs.createReadStream(
                                                `${__dirname}/bom.csv`
                                            )
                                                .pipe(
                                                    parse({
                                                        delimiter: ',',
                                                        columns: true,
                                                    })
                                                )
                                                .on('data', async (row) => {
                                                    try {
                                                        await prisma.bom.create(
                                                            {
                                                                data: {
                                                                    ...row,
                                                                    quantity:
                                                                        parseFloat(
                                                                            row.quantity
                                                                        ),
                                                                },
                                                            }
                                                        )
                                                    } catch (e) {
                                                        console.log(e)
                                                        console.log(row)
                                                        process.exit(1)
                                                    }
                                                })
                                        })
                                })
                        })
                })
        })
}

f()
