import express, { Request, Response, Router } from 'express'
import jwt, { Secret } from 'jsonwebtoken'
import { PrismaService } from '../service'

const app: Router = express.Router()
const prisma = PrismaService.users

app.post('/login', async (req: Request, res: Response) => {
    // Authenticate
    const { username, password } = req.body
    try {
        const user = await prisma.findFirstOrThrow({
            where: {
                username,
                password
            }
        })
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as Secret)
        res.json({
            token,
            user
        })
    } catch (e) {
        res.sendStatus(401)
    }
})


export default app
