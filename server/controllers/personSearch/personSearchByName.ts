import { Request, Response } from 'express'

export const personSearchByName = async (req: Request, res: Response): Promise<Response | void> => {
  const { hasPpcsRole } = {
    hasPpcsRole: req.query.hasPpcsRole as string,
  }
  res.locals.hasPpcsRole = hasPpcsRole
  res.render('pages/personSearchByName')
}
