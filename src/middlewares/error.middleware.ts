import { Request, Response, NextFunction,} from "express"

export const notfound = (req:Request, res:Response, next:NextFunction):void=>{
    res.status(404).json({
        sucess: false,
        message: `Route not found: ${req.originalUrl}`
    })
}

export const errorHandlder = (err: Error, req:Request, res:Response, next: NextFunction):void=>{
    res.status(500).json({
        success: false,
        message: "Internal server error"
    })
}