import { NextFunction, Request, Response } from 'express'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const id: string = 'apRationaleConfirmation'
  let title: string
  let bodyText1: string
  let bodyText2: string

  if (recommendation.spoRecallType === 'RECALL') {
    title = 'Recall started'
    bodyText1 = 'Tell the probation practitioner you’ve started the recall. Give them the:'
    bodyText2 = 'The practitioner will fill in the Part A.'
  } else {
    title = 'Decision not to recall'
    bodyText1 = 'Tell the probation practitioner you made this decision. Give them the:'
    bodyText2 = 'The practitioner will write the decision not to recall letter.'
  }

  res.locals = {
    ...res.locals,
    page: {
      id,
      title,
      bodyText1,
      bodyText2,
    },
    nomsNumber: recommendation.personOnProbation.nomsNumber,
    crn: recommendation.crn,
    personOnProbation: recommendation.personOnProbation.name,
    spoRecallRationale: recommendation.spoRecallRationale,
  }

  res.render(`pages/recommendations/apRationaleConfirmation`)
  next()
}

export default { get }
