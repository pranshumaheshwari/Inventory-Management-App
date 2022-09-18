import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload, Secret } from "jsonwebtoken"

export default (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1]
    if (token == undefined) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret, (err, user) => {
      if (err) res.sendStatus(403)
      req.user = user as {username : string}
      next()
    })
  }