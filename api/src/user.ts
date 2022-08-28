import { default as PrismaClient } from './prisma'
import express, { Request, Response, Router } from 'express'

const app: Router = express.Router()
const prisma = PrismaClient.users


app.get('/', async (req: Request, res: Response) => {
    const data = await prisma.findMany()
    res.json(data)
})

app.post('/', async (req: Request, res: Response) => {
    const {
        username,
        password,
        type,
        name
    } = req.body

    try {
        const result = await prisma.create({
            data: {
                username,
                password,
                type,
                name
            }
        })
        res.json(result)
    } catch (e) {
        res.json({
            status: 500,
            message: (e as Error).message
        })
    }
})

app.get('/:username', async (req: Request, res: Response) => {
    const { username } = req.params
    const data = await prisma.findUnique({
        where: {
            username
        }
    })
    res.json(data)
})

app.put('/:username', async (req: Request, res: Response) => {
    const {
        password,
        type,
        name
    } = req.body

    const { username } = req.params

    try {
        const result = await prisma.update({
            where: {
                username,
            },
            data: {
                password,
                type,
                name
            }
        })
        res.json(result)
    } catch (e) {
        res.json({
            status: 500,
            message: (e as Error).message
        })
    }
})

app.delete('/:username', async (req: Request, res: Response) => {
    const { username } = req.params
    try {
        const result = await prisma.delete({
            where: {
                username
            }
        })
        res.json(result)
    } catch (e) {
        res.json({
            status: 500,
            message: (e as Error).message
        })
    }
})

export default app