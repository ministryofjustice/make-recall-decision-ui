import { NextFunction, Request, Response } from 'express'
import path from 'path'

const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  res.render(path.join(__dirname, 'views/testView'))
}

export default {
  get,
}
