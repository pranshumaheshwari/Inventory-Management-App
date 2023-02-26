import {
    FgCategory,
    Prisma,
    PrismaClient,
    RmCategory,
    UsersType,
} from '@prisma/client'

import { FieldInfo } from 'mysql'
import { MysqlError } from 'mysql'
import dotenv from 'dotenv'
import mysql from 'mysql'

const prisma = new PrismaClient()
dotenv.config()

const connection = mysql.createConnection({
    user: 'root',
    password: '',
    database: 'store',
    socketPath: '',
})
connection.connect()

// USERS
connection.query(
    'SELECT * FROM users',
    async (
        error: MysqlError,
        res: {
            username: string
            password: string
            type: UsersType
        }[],
        fields: FieldInfo[]
    ) => {
        if (error) throw error
        await prisma.users.createMany({
            data: res.map((r) => ({ ...r, name: r.username })),
        })
    }
)

// CUSTOMER
connection.query(
    'SELECT * FROM customer',
    async (
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
        await prisma.customer.createMany({
            data: res.map((r) => ({
                id: r.code,
                name: r.name,
                address1: r.address1,
                address2: r.address2,
                city: r.city,
                state: r.state,
                gst: r.GST_no,
            })),
        })
    }
)

// SUPPLIER
connection.query(
    'SELECT * FROM supplier',
    async (
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
        await prisma.supplier.createMany({
            data: res.map((r) => ({
                id: r.code,
                name: r.name,
                address1: r.address1,
                address2: r.address2,
                city: r.city,
                state: r.state,
                gst: r.GST_no,
            })),
        })
    }
)

// RAW MATERIAL
connection.query(
    'SELECT * FROM raw_material',
    async (
        error: MysqlError,
        res: {
            code: string
            DTPL_code: string
            name: string
            category: RmCategory
            stock: number
            line_stock: number
            unit: string
            supplier_code: string
            price: number
            monthly_requirement: number
        }[],
        fields: FieldInfo[]
    ) => {
        if (error) throw error
        await prisma.rm.createMany({
            data: res.map((r) => ({
                id: r.code,
                description: r.name,
                dtplCode: r.DTPL_code,
                supplierId: r.supplier_code,
                category: r.category,
                unit: r.unit,
                price: r.price,
                storeStock: r.stock,
                lineStock: r.line_stock,
            })),
        })
    }
)

// FINISHED GOODS
connection.query(
    'SELECT * FROM finished_goods',
    async (
        error: MysqlError,
        res: {
            code: string
            name: string
            customer: string
            category: FgCategory
            stock: number
            quantity: number
            price: number
            overheads: number
            man_power: number
        }[],
        fields: FieldInfo[]
    ) => {
        if (error) throw error
        await prisma.fg.createMany({
            data: res.map((r) => ({
                id: r.code,
                customerId: r.customer,
                description: r.name,
                storeStock: r.stock,
                category: r.category,
                price: r.price,
                manPower: r.man_power,
                overheads: r.overheads,
            })),
        })
    }
)

// BOM
connection.query(
    'SELECT * FROM finished_goods_detail',
    async (
        error: MysqlError,
        res: {
            code: string
            raw_material_code: string
            quantity: number
        }[],
        fields: FieldInfo[]
    ) => {
        if (error) throw error
        await prisma.bom.createMany({
            data: res.map((r) => ({
                fgId: r.code,
                rmId: r.raw_material_code,
                quantity: r.quantity,
            })),
        })
    }
)

connection.end()
