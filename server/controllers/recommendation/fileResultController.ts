import { NextFunction, Request, Response } from 'express'
import { getFiles } from '../../data/makeDecisionApiClient'
import config from '../../config'

async function get(req: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    user: { token },
    flags: featureFlags,
  } = res.locals

  const files = await getFiles({ recommendationId: recommendation.id, token })

  const data = files.map(file => {
    let link
    if (featureFlags.flagFileEndpointProxy) {
      link = `${config.domain}/recommendations/${recommendation.id}/file/${file.id}?token=${file.token}`
    } else {
      link = `${config.apis.makeRecallDecisionApi.url}/recommendations/${recommendation.id}/file/${
        file.id
      }?token=${encodeURIComponent(file.token)}`
    }
    return {
      ...file,
      link,
    }
  })

  res.locals = {
    ...res.locals,
    page: {
      id: 'fileUpload',
    },
    inputDisplayValues: {
      files: data,
    },
  }

  res.render(`pages/recommendations/fileResult`)
  next()
}

export default { get }
