import { NextFunction, Request, Response } from 'express'
import CUSTODY_GROUP from '../../@types/make-recall-decision-api/models/ppud/CustodyGroup'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    isNewSentence: recommendation.bookRecallToPpud?.ppudSentenceId === 'ADD_NEW',
    isIndeterminateSentence: recommendation.bookRecallToPpud?.custodyGroup === CUSTODY_GROUP.INDETERMINATE,
    page: {
      id: 'bookedToPpudSuccess',
    },
  }

  res.render('pages/recommendations/bookedToPpudSuccess')
  next()
}

export default { get }
