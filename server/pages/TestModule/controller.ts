import { NextFunction, Request, Response } from 'express'
import path from 'path'

const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  res.locals.testVariable = 'Hello!'
  res.locals.page = {
    id: 'testPage',
  }

  res.render(path.join(__dirname, 'views/testView'))
}

export default {
  get,
}
