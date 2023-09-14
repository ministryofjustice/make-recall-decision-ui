import { NextFunction, Request, Response } from 'express'
import config from '../../config'
import { createFile } from '../../data/makeDecisionApiClient'

async function get(req: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    user: { token },
    flags: featureFlags,
  } = res.locals

  let errors

  if (req.query.error === 'BAD_SIZE') {
    errors = {
      list: [
        {
          name: 'fileUpload',
          text: 'The size of the file is invalid.',
          href: '#file-upload',
          errorId: 'invalidSize',
        },
      ],
      fileUpload: {
        text: 'The size of the file is invalid.',
        href: '#file-upload',
        errorId: 'invalidSize',
      },
    }
  }

  const file = await createFile(recommendation.id, { category: 'LICENCE_DOCUMENT' }, token, featureFlags)

  let url = `${config.apis.makeRecallDecisionApi.url}/recommendations/${recommendation.id}/file-upload`
  if (featureFlags.flagFileEndpointProxy) {
    url = `/recommendations/${recommendation.id}/file-upload`
  }

  res.locals = {
    ...res.locals,
    page: {
      id: 'fileUpload',
    },
    errors,
    token: file.token,
    redirectSuccess: `${config.domain}/recommendations/${recommendation.id}/file-result`,
    redirectFailure: `${config.domain}/recommendations/${recommendation.id}/file-upload`,
    url,
  }

  res.render(`pages/recommendations/fileUpload`)
  next()
}

export default { get }
