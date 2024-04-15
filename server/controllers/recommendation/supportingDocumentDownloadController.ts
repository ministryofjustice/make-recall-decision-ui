import { NextFunction, Request, Response } from 'express'
import { downloadSupportingDocument } from '../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId, id } = req.params
  const {
    flags,
    user: { token },
  } = res.locals

  const file = await downloadSupportingDocument({
    recommendationId,
    token,
    id,
    featureFlags: flags,
  })

  const data = atob(file.data)

  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-disposition': `attachment;filename=${file.filename}`,
    'Content-Length': data.length,
  })
  res.end(Buffer.from(data, 'binary'))
  next()
}

export default { get }
