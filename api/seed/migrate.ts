import { Prisma, PrismaClient, UsersType } from '@prisma/client'

import { FieldInfo } from 'mysql'
import { MysqlError } from 'mysql'
import dotenv from 'dotenv'
import { exit } from 'process'
import mysql from 'mysql'

const prisma = new PrismaClient()
dotenv.config()

const connection_url = process.env.DATABASE_URL_OLD

if (connection_url) {
    const connection = mysql.createConnection(connection_url)
    connection.connect()

    // USERS
    connection.query(
        'SELECT * FROM users',
        (
            error: MysqlError,
            res: {
                username: string
                password: string
                type: UsersType
            }[],
            fields: FieldInfo[]
        ) => {
            if (error) throw error
            prisma.users.createMany({
                data: res.map((r) => ({ ...r, name: r.username })),
            })
        }
    )

    // CUSTOMER
    connection.query(
        'SELECT * FROM customer',
        (
            error: MysqlError,
            res: {
                code: string
                name: string
                address1: string
                address2: string
                city: string
                state: string
                GST_no: string
                PAN_no: string
            }[],
            fields: FieldInfo[]
        ) => {
            if (error) throw error
            prisma.customer.createMany({
                data: res.map((r) => ({ ...r, gst: r.GST_no, id: r.code })),
            })
        }
    )

    // SUPPLIER
    connection.query(
        'SELECT * FROM supplier',
        (
            error: MysqlError,
            res: {
                code: string
                name: string
                address1: string
                address2: string
                city: string
                state: string
                GST_no: string
                PAN_no: string
            }[],
            fields: FieldInfo[]
        ) => {
            if (error) throw error
            prisma.supplier.createMany({
                data: res.map((r) => ({ ...r, gst: r.GST_no, id: r.code })),
            })
        }
    )

    connection.end()
} else {
    exit(1)
}
